-- ─────────────────────────────────────────────────────────────────
-- AeroJet Expanded Flight Schedule Seed
-- Covers today + next 7 days across all 8 hubs
-- ─────────────────────────────────────────────────────────────────

-- JFK <-> LAX  (6 round-trips)
INSERT INTO flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price, status) VALUES
('f1000000-0000-0000-0000-000000000001','AJ101','JFK','LAX', NOW() + INTERVAL  '6 hours',  NOW() + INTERVAL '12 hours', 'Boeing 777',   319.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000021','AJ103','JFK','LAX', NOW() + INTERVAL '10 hours',  NOW() + INTERVAL '16 hours', 'Boeing 787',   289.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000022','AJ105','JFK','LAX', NOW() + INTERVAL '18 hours',  NOW() + INTERVAL '24 hours', 'Airbus A350',  349.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000002','AJ102','LAX','JFK', NOW() + INTERVAL  '8 hours',  NOW() + INTERVAL '14 hours', 'Boeing 777',   329.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000023','AJ104','LAX','JFK', NOW() + INTERVAL '14 hours',  NOW() + INTERVAL '20 hours', 'Boeing 787',   279.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000024','AJ106','LAX','JFK', NOW() + INTERVAL '22 hours',  NOW() + INTERVAL '28 hours', 'Airbus A350',  359.00, 'scheduled'),

-- JFK <-> LAX next day
('f2000000-0000-0000-0000-000000000001','AJ111','JFK','LAX', NOW() + INTERVAL '1 day 6 hours',  NOW() + INTERVAL '1 day 12 hours', 'Boeing 777',  309.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000002','AJ112','JFK','LAX', NOW() + INTERVAL '1 day 14 hours', NOW() + INTERVAL '1 day 20 hours', 'Boeing 737',  249.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000003','AJ113','LAX','JFK', NOW() + INTERVAL '1 day 7 hours',  NOW() + INTERVAL '1 day 13 hours', 'Airbus A350', 339.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000004','AJ114','LAX','JFK', NOW() + INTERVAL '1 day 16 hours', NOW() + INTERVAL '1 day 22 hours', 'Boeing 787',  295.00, 'scheduled'),

-- ORD <-> MIA (4 round-trips spread across 2 days)
('f1000000-0000-0000-0000-000000000003','AJ201','ORD','MIA', NOW() + INTERVAL  '4 hours',  NOW() + INTERVAL  '7 hours', 'Airbus A320', 199.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000025','AJ203','ORD','MIA', NOW() + INTERVAL '12 hours',  NOW() + INTERVAL '15 hours', 'Airbus A321', 219.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000004','AJ202','MIA','ORD', NOW() + INTERVAL  '6 hours',  NOW() + INTERVAL  '9 hours', 'Airbus A320', 199.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000026','AJ204','MIA','ORD', NOW() + INTERVAL '15 hours',  NOW() + INTERVAL '18 hours', 'Airbus A321', 229.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000005','AJ211','ORD','MIA', NOW() + INTERVAL '1 day 5 hours',  NOW() + INTERVAL '1 day 8 hours',  'Airbus A321', 209.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000006','AJ212','MIA','ORD', NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 13 hours', 'Airbus A320', 199.00, 'scheduled'),

-- SFO <-> SEA (4 round-trips)
('f1000000-0000-0000-0000-000000000005','AJ301','SFO','SEA', NOW() + INTERVAL  '3 hours',  NOW() + INTERVAL  '5 hours', 'Boeing 737',  139.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000027','AJ303','SFO','SEA', NOW() + INTERVAL '10 hours',  NOW() + INTERVAL '12 hours', 'Boeing 737',  159.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000006','AJ302','SEA','SFO', NOW() + INTERVAL  '5 hours',  NOW() + INTERVAL  '7 hours', 'Boeing 737',  149.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000028','AJ304','SEA','SFO', NOW() + INTERVAL '13 hours',  NOW() + INTERVAL '15 hours', 'Boeing 737',  145.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000007','AJ311','SFO','SEA', NOW() + INTERVAL '1 day 6 hours',  NOW() + INTERVAL '1 day 8 hours',  'Airbus A320', 169.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000008','AJ312','SEA','SFO', NOW() + INTERVAL '1 day 9 hours',  NOW() + INTERVAL '1 day 11 hours', 'Airbus A320', 155.00, 'scheduled'),

-- DFW <-> DEN (4 round-trips)
('f1000000-0000-0000-0000-000000000007','AJ401','DFW','DEN', NOW() + INTERVAL  '5 hours',  NOW() + INTERVAL  '7 hours', 'Airbus A321', 169.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000029','AJ403','DFW','DEN', NOW() + INTERVAL '14 hours',  NOW() + INTERVAL '16 hours', 'Boeing 737',  149.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000008','AJ402','DEN','DFW', NOW() + INTERVAL  '9 hours',  NOW() + INTERVAL '11 hours', 'Airbus A321', 169.00, 'scheduled'),
('f1000000-0000-0000-0000-000000000030','AJ404','DEN','DFW', NOW() + INTERVAL '17 hours',  NOW() + INTERVAL '19 hours', 'Boeing 737',  159.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000009','AJ411','DFW','DEN', NOW() + INTERVAL '1 day 7 hours',  NOW() + INTERVAL '1 day 9 hours',  'Airbus A321', 179.00, 'scheduled'),
('f2000000-0000-0000-0000-000000000010','AJ412','DEN','DFW', NOW() + INTERVAL '1 day 12 hours', NOW() + INTERVAL '1 day 14 hours', 'Boeing 737',  155.00, 'scheduled'),

-- ORD <-> JFK (new routes)
('f3000000-0000-0000-0000-000000000001','AJ501','ORD','JFK', NOW() + INTERVAL  '4 hours',  NOW() + INTERVAL  '6 hours', 'Boeing 737',  189.00, 'scheduled'),
('f3000000-0000-0000-0000-000000000002','AJ502','JFK','ORD', NOW() + INTERVAL  '8 hours',  NOW() + INTERVAL '10 hours', 'Boeing 737',  179.00, 'scheduled'),
('f3000000-0000-0000-0000-000000000003','AJ503','ORD','JFK', NOW() + INTERVAL '16 hours',  NOW() + INTERVAL '18 hours', 'Airbus A320', 209.00, 'scheduled'),
('f3000000-0000-0000-0000-000000000004','AJ504','JFK','ORD', NOW() + INTERVAL '20 hours',  NOW() + INTERVAL '22 hours', 'Airbus A320', 199.00, 'scheduled'),
('f3000000-0000-0000-0000-000000000005','AJ511','ORD','JFK', NOW() + INTERVAL '1 day 5 hours',  NOW() + INTERVAL '1 day 7 hours',  'Boeing 737',  185.00, 'scheduled'),
('f3000000-0000-0000-0000-000000000006','AJ512','JFK','ORD', NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 12 hours', 'Airbus A321', 195.00, 'scheduled'),

-- SFO <-> LAX (new short-haul)
('f4000000-0000-0000-0000-000000000001','AJ601','SFO','LAX', NOW() + INTERVAL  '2 hours',  NOW() + INTERVAL  '3 hours', 'Boeing 737',   89.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000002','AJ602','LAX','SFO', NOW() + INTERVAL  '5 hours',  NOW() + INTERVAL  '6 hours', 'Boeing 737',   89.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000003','AJ603','SFO','LAX', NOW() + INTERVAL  '9 hours',  NOW() + INTERVAL '10 hours', 'Airbus A320', 109.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000004','AJ604','LAX','SFO', NOW() + INTERVAL '13 hours',  NOW() + INTERVAL '14 hours', 'Airbus A320', 109.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000005','AJ605','SFO','LAX', NOW() + INTERVAL '20 hours',  NOW() + INTERVAL '21 hours', 'Boeing 737',   99.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000006','AJ611','SFO','LAX', NOW() + INTERVAL '1 day 7 hours',  NOW() + INTERVAL '1 day 8 hours',  'Boeing 737',   95.00, 'scheduled'),
('f4000000-0000-0000-0000-000000000007','AJ612','LAX','SFO', NOW() + INTERVAL '1 day 12 hours', NOW() + INTERVAL '1 day 13 hours', 'Airbus A320', 105.00, 'scheduled'),

-- MIA <-> JFK
('f5000000-0000-0000-0000-000000000001','AJ701','MIA','JFK', NOW() + INTERVAL  '3 hours',  NOW() + INTERVAL  '6 hours', 'Boeing 737',  229.00, 'scheduled'),
('f5000000-0000-0000-0000-000000000002','AJ702','JFK','MIA', NOW() + INTERVAL  '7 hours',  NOW() + INTERVAL '10 hours', 'Boeing 737',  219.00, 'scheduled'),
('f5000000-0000-0000-0000-000000000003','AJ703','MIA','JFK', NOW() + INTERVAL '15 hours',  NOW() + INTERVAL '18 hours', 'Boeing 777',  259.00, 'scheduled'),
('f5000000-0000-0000-0000-000000000004','AJ704','JFK','MIA', NOW() + INTERVAL '19 hours',  NOW() + INTERVAL '22 hours', 'Boeing 777',  249.00, 'scheduled'),
('f5000000-0000-0000-0000-000000000005','AJ711','MIA','JFK', NOW() + INTERVAL '1 day 6 hours',  NOW() + INTERVAL '1 day 9 hours',  'Airbus A321', 239.00, 'scheduled'),
('f5000000-0000-0000-0000-000000000006','AJ712','JFK','MIA', NOW() + INTERVAL '1 day 11 hours', NOW() + INTERVAL '1 day 14 hours', 'Airbus A321', 229.00, 'scheduled')

ON CONFLICT (id) DO NOTHING;

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
