-- ─────────────────────────────────────────────────────────────────
-- AeroJet Dynamic Flight Schedule Seed (15 Days)
-- Covers today + next 14 days across all 8 hubs
-- ─────────────────────────────────────────────────────────────────

DO $$
DECLARE
  d INT;
  flight_date DATE;
  suffix VARCHAR;
BEGIN
  -- Generate flights for 15 days starting from today
  FOR d IN 0..14 LOOP
    flight_date := CURRENT_DATE + d;
    suffix := to_char(flight_date, 'MMDD');

    INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price, status) VALUES
    -- JFK <-> LAX
    (gen_random_uuid(), 'AJ101' || suffix, 'JFK', 'LAX', flight_date + interval '6 hours', flight_date + interval '12 hours', 'Boeing 777', 319.00, 'scheduled'),
    (gen_random_uuid(), 'AJ103' || suffix, 'JFK', 'LAX', flight_date + interval '10 hours', flight_date + interval '16 hours', 'Boeing 787', 289.00, 'scheduled'),
    (gen_random_uuid(), 'AJ105' || suffix, 'JFK', 'LAX', flight_date + interval '18 hours', flight_date + interval '24 hours', 'Airbus A350', 349.00, 'scheduled'),
    (gen_random_uuid(), 'AJ102' || suffix, 'LAX', 'JFK', flight_date + interval '8 hours', flight_date + interval '14 hours', 'Boeing 777', 329.00, 'scheduled'),
    (gen_random_uuid(), 'AJ104' || suffix, 'LAX', 'JFK', flight_date + interval '14 hours', flight_date + interval '20 hours', 'Boeing 787', 279.00, 'scheduled'),
    (gen_random_uuid(), 'AJ106' || suffix, 'LAX', 'JFK', flight_date + interval '22 hours', flight_date + interval '28 hours', 'Airbus A350', 359.00, 'scheduled'),

    -- ORD <-> MIA
    (gen_random_uuid(), 'AJ201' || suffix, 'ORD', 'MIA', flight_date + interval '4 hours', flight_date + interval '7 hours', 'Airbus A320', 199.00, 'scheduled'),
    (gen_random_uuid(), 'AJ203' || suffix, 'ORD', 'MIA', flight_date + interval '12 hours', flight_date + interval '15 hours', 'Airbus A321', 219.00, 'scheduled'),
    (gen_random_uuid(), 'AJ202' || suffix, 'MIA', 'ORD', flight_date + interval '6 hours', flight_date + interval '9 hours', 'Airbus A320', 199.00, 'scheduled'),
    (gen_random_uuid(), 'AJ204' || suffix, 'MIA', 'ORD', flight_date + interval '15 hours', flight_date + interval '18 hours', 'Airbus A321', 229.00, 'scheduled'),

    -- SFO <-> SEA
    (gen_random_uuid(), 'AJ301' || suffix, 'SFO', 'SEA', flight_date + interval '3 hours', flight_date + interval '5 hours', 'Boeing 737', 139.00, 'scheduled'),
    (gen_random_uuid(), 'AJ303' || suffix, 'SFO', 'SEA', flight_date + interval '10 hours', flight_date + interval '12 hours', 'Boeing 737', 159.00, 'scheduled'),
    (gen_random_uuid(), 'AJ302' || suffix, 'SEA', 'SFO', flight_date + interval '5 hours', flight_date + interval '7 hours', 'Boeing 737', 149.00, 'scheduled'),
    (gen_random_uuid(), 'AJ304' || suffix, 'SEA', 'SFO', flight_date + interval '13 hours', flight_date + interval '15 hours', 'Boeing 737', 145.00, 'scheduled'),

    -- DFW <-> DEN
    (gen_random_uuid(), 'AJ401' || suffix, 'DFW', 'DEN', flight_date + interval '5 hours', flight_date + interval '7 hours', 'Airbus A321', 169.00, 'scheduled'),
    (gen_random_uuid(), 'AJ403' || suffix, 'DFW', 'DEN', flight_date + interval '14 hours', flight_date + interval '16 hours', 'Boeing 737', 149.00, 'scheduled'),
    (gen_random_uuid(), 'AJ402' || suffix, 'DEN', 'DFW', flight_date + interval '9 hours', flight_date + interval '11 hours', 'Airbus A321', 169.00, 'scheduled'),
    (gen_random_uuid(), 'AJ404' || suffix, 'DEN', 'DFW', flight_date + interval '17 hours', flight_date + interval '19 hours', 'Boeing 737', 159.00, 'scheduled'),

    -- ORD <-> JFK
    (gen_random_uuid(), 'AJ501' || suffix, 'ORD', 'JFK', flight_date + interval '4 hours', flight_date + interval '6 hours', 'Boeing 737', 189.00, 'scheduled'),
    (gen_random_uuid(), 'AJ503' || suffix, 'ORD', 'JFK', flight_date + interval '16 hours', flight_date + interval '18 hours', 'Airbus A320', 209.00, 'scheduled'),
    (gen_random_uuid(), 'AJ502' || suffix, 'JFK', 'ORD', flight_date + interval '8 hours', flight_date + interval '10 hours', 'Boeing 737', 179.00, 'scheduled'),
    (gen_random_uuid(), 'AJ504' || suffix, 'JFK', 'ORD', flight_date + interval '20 hours', flight_date + interval '22 hours', 'Airbus A320', 199.00, 'scheduled'),

    -- SFO <-> LAX
    (gen_random_uuid(), 'AJ601' || suffix, 'SFO', 'LAX', flight_date + interval '2 hours', flight_date + interval '3 hours', 'Boeing 737', 89.00, 'scheduled'),
    (gen_random_uuid(), 'AJ603' || suffix, 'SFO', 'LAX', flight_date + interval '9 hours', flight_date + interval '10 hours', 'Airbus A320', 109.00, 'scheduled'),
    (gen_random_uuid(), 'AJ605' || suffix, 'SFO', 'LAX', flight_date + interval '20 hours', flight_date + interval '21 hours', 'Boeing 737', 99.00, 'scheduled'),
    (gen_random_uuid(), 'AJ602' || suffix, 'LAX', 'SFO', flight_date + interval '5 hours', flight_date + interval '6 hours', 'Boeing 737', 89.00, 'scheduled'),
    (gen_random_uuid(), 'AJ604' || suffix, 'LAX', 'SFO', flight_date + interval '13 hours', flight_date + interval '14 hours', 'Airbus A320', 109.00, 'scheduled'),

    -- MIA <-> JFK
    (gen_random_uuid(), 'AJ701' || suffix, 'MIA', 'JFK', flight_date + interval '3 hours', flight_date + interval '6 hours', 'Boeing 737', 229.00, 'scheduled'),
    (gen_random_uuid(), 'AJ703' || suffix, 'MIA', 'JFK', flight_date + interval '15 hours', flight_date + interval '18 hours', 'Boeing 777', 259.00, 'scheduled'),
    (gen_random_uuid(), 'AJ702' || suffix, 'JFK', 'MIA', flight_date + interval '7 hours', flight_date + interval '10 hours', 'Boeing 737', 219.00, 'scheduled'),
    (gen_random_uuid(), 'AJ704' || suffix, 'JFK', 'MIA', flight_date + interval '19 hours', flight_date + interval '22 hours', 'Boeing 777', 249.00, 'scheduled')
    ON CONFLICT (flight_no) DO NOTHING;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- Seat map generation for all flights
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_flight_seats()
RETURNS VOID AS $$
DECLARE
    r_flight RECORD;
    v_row INT;
    v_col CHAR(1);
BEGIN
    FOR r_flight IN SELECT id FROM flights LOOP
        -- Row 1-3: First Class (A, B, C, D)
        FOR v_row IN 1..3 LOOP
            FOREACH v_col IN ARRAY ARRAY['A', 'B', 'C', 'D'] LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (r_flight.id, v_row || v_col, 'first', 150.00)
                ON CONFLICT (flight_id, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;

        -- Row 4-8: Business Class (A, B, C, D, E, F)
        FOR v_row IN 4..8 LOOP
            FOREACH v_col IN ARRAY ARRAY['A', 'B', 'C', 'D', 'E', 'F'] LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (r_flight.id, v_row || v_col, 'business', 75.00)
                ON CONFLICT (flight_id, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;

        -- Row 9-24: Economy Class (A, B, C, D, E, F)
        FOR v_row IN 9..24 LOOP
            FOREACH v_col IN ARRAY ARRAY['A', 'B', 'C', 'D', 'E', 'F'] LOOP
                INSERT INTO seats (flight_id, seat_number, class, extra_fee)
                VALUES (r_flight.id, v_row || v_col, 'economy', 0.00)
                ON CONFLICT (flight_id, seat_number) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT generate_flight_seats();
DROP FUNCTION generate_flight_seats();
