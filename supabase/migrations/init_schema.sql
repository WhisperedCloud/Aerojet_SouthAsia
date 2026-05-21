-- 1. Create flights table
CREATE TABLE IF NOT EXISTS flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_no VARCHAR(10) NOT NULL UNIQUE,
    origin VARCHAR(3) NOT NULL, -- IATA Airport Codes (e.g., JFK, LAX)
    destination VARCHAR(3) NOT NULL,
    departs_at TIMESTAMP WITH TIME ZONE NOT NULL,
    arrives_at TIMESTAMP WITH TIME ZONE NOT NULL,
    aircraft_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'delayed', 'cancelled', 'completed')),
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_route CHECK (origin <> destination),
    CONSTRAINT check_times CHECK (arrives_at > departs_at)
);

-- 2. Create seats table
CREATE TABLE IF NOT EXISTS seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
    seat_number VARCHAR(5) NOT NULL,
    class VARCHAR(15) NOT NULL CHECK (class IN ('economy', 'business', 'first')),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    extra_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (extra_fee >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_seats_flight_number ON seats(flight_id, seat_number);
CREATE INDEX IF NOT EXISTS idx_seats_flight_id ON seats(flight_id);

-- 3. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
    seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'rescheduled', 'cancelled')),
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    pnr_code VARCHAR(6) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enforce one active booking per seat/flight
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_seat ON bookings(flight_id, seat_id) WHERE (status != 'cancelled');
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight_id ON bookings(flight_id);

-- 4. Create passengers table
CREATE TABLE IF NOT EXISTS passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    passport_no VARCHAR(20) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_age CHECK (dob < CURRENT_DATE)
);

CREATE INDEX IF NOT EXISTS idx_passengers_booking_id ON passengers(booking_id);

-- 5. Create reschedules table
CREATE TABLE IF NOT EXISTS reschedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
    new_flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE RESTRICT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    fee_charged NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fee_charged >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reschedules_booking_id ON reschedules(booking_id);

-- 6. Trigger: 2-Hour Cancellation/Reschedule Rule (Database Level Constraint)
CREATE OR REPLACE FUNCTION enforce_cancellation_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_departs_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Only check on status changes to 'cancelled' or changes to flight_id (reschedule)
    IF (NEW.status = 'cancelled' AND OLD.status != 'cancelled') OR (NEW.flight_id != OLD.flight_id) THEN
        SELECT departs_at INTO v_departs_at FROM flights WHERE id = OLD.flight_id;
        IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
            RAISE EXCEPTION 'Modifications or cancellations within 2 hours of departure are prohibited.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_enforce_cancellation_limit
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION enforce_cancellation_limit();

-- 7. Supabase RPC seat-locking function to prevent concurrency double-booking issues
CREATE OR REPLACE FUNCTION book_flight(
    p_user_id UUID,
    p_flight_id UUID,
    p_seat_id UUID,
    p_passenger_name VARCHAR,
    p_passport_no VARCHAR,
    p_nationality VARCHAR,
    p_dob DATE,
    p_total_price NUMERIC,
    p_pnr_code VARCHAR
)
RETURNS TABLE (
    booking_id UUID,
    pnr VARCHAR
) AS $$
DECLARE
    v_seat_available BOOLEAN;
    v_new_booking_id UUID;
BEGIN
    -- Lock the seat row for updates to block concurrent transactions
    SELECT is_available INTO v_seat_available
    FROM seats
    WHERE id = p_seat_id AND flight_id = p_flight_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Seat not found on the specified flight.';
    END IF;

    IF NOT v_seat_available THEN
        RAISE EXCEPTION 'Seat is already occupied.';
    END IF;

    -- Mark the seat as unavailable
    UPDATE seats
    SET is_available = FALSE
    WHERE id = p_seat_id;

    -- Create the booking record
    INSERT INTO bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
    VALUES (p_user_id, p_flight_id, p_seat_id, 'confirmed', p_total_price, p_pnr_code)
    RETURNING id INTO v_new_booking_id;

    -- Create the passenger record
    INSERT INTO passengers (booking_id, full_name, passport_no, nationality, dob)
    VALUES (v_new_booking_id, p_passenger_name, p_passport_no, p_nationality, p_dob);

    RETURN QUERY SELECT v_new_booking_id, p_pnr_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Supabase RPC function for atomic cancellations
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_seat_id UUID;
BEGIN
    -- Select and lock booking to verify ownership and prevent race conditions
    SELECT seat_id INTO v_seat_id
    FROM bookings
    WHERE id = p_booking_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or unauthorized.';
    END IF;

    -- Update booking status (trigger will reject if departure time < 2 hours)
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = p_booking_id;

    -- Free the seat mapping
    UPDATE seats
    SET is_available = TRUE
    WHERE id = v_seat_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Supabase RPC function for rescheduling flights atomically
CREATE OR REPLACE FUNCTION reschedule_booking(
    p_booking_id UUID,
    p_new_flight_id UUID,
    p_new_seat_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_flight_id UUID;
    v_old_seat_id UUID;
    v_old_flight_price NUMERIC;
    v_new_flight_price NUMERIC;
    v_old_seat_fee NUMERIC;
    v_new_seat_fee NUMERIC;
    v_fee_charged NUMERIC := 0;
    v_departs_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Lock the booking row
    SELECT flight_id, seat_id INTO v_old_flight_id, v_old_seat_id
    FROM bookings
    WHERE id = p_booking_id AND user_id = p_user_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found or unauthorized.';
    END IF;

    -- Check if departure of old flight is > 2 hours away
    SELECT departs_at, base_price INTO v_departs_at, v_old_flight_price FROM flights WHERE id = v_old_flight_id;
    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
        RAISE EXCEPTION 'Rescheduling within 2 hours of departure is prohibited.';
    END IF;

    -- Lock and check target seat availability
    IF NOT EXISTS (
        SELECT 1 FROM seats 
        WHERE id = p_new_seat_id AND flight_id = p_new_flight_id AND is_available = TRUE 
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Target seat is no longer available.';
    END IF;

    -- Calculate price delta
    SELECT base_price INTO v_new_flight_price FROM flights WHERE id = p_new_flight_id;
    SELECT extra_fee INTO v_old_seat_fee FROM seats WHERE id = v_old_seat_id;
    SELECT extra_fee INTO v_new_seat_fee FROM seats WHERE id = p_new_seat_id;

    IF (v_new_flight_price + v_new_seat_fee) > (v_old_flight_price + v_old_seat_fee) THEN
        v_fee_charged := (v_new_flight_price + v_new_seat_fee) - (v_old_flight_price + v_old_seat_fee);
    END IF;

    -- Swap seats atomically
    UPDATE seats SET is_available = TRUE WHERE id = v_old_seat_id;
    UPDATE seats SET is_available = FALSE WHERE id = p_new_seat_id;

    -- Update booking
    UPDATE bookings
    SET flight_id = p_new_flight_id,
        seat_id = p_new_seat_id,
        status = 'rescheduled',
        total_price = total_price + v_fee_charged
    WHERE id = p_booking_id;

    -- Record reschedule event
    INSERT INTO reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
    VALUES (p_booking_id, v_old_flight_id, p_new_flight_id, v_fee_charged);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reschedules ENABLE ROW LEVEL SECURITY;

-- 11. Security Policies
CREATE POLICY "Public Read Flights" ON flights FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Public Read Seats" ON seats FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Users Read Own Bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users Insert Own Bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users Update Own Bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users Read Own Passengers" ON passengers FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users Insert Own Passengers" ON passengers FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid()));

CREATE POLICY "Users Read Own Reschedules" ON reschedules FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users Insert Own Reschedules" ON reschedules FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = reschedules.booking_id AND bookings.user_id = auth.uid()));
