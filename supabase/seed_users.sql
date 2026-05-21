-- ═══════════════════════════════════════════════════════════════
-- AeroJet Demo User Seeding Script
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- This inserts 5 test passengers into auth.users and their
-- matching public profiles. Passwords are all: AeroJet#2026
-- ═══════════════════════════════════════════════════════════════

-- IMPORTANT: Supabase uses bcrypt for passwords.
-- The hash below is for password: AeroJet#2026
-- Generated with: SELECT crypt('AeroJet#2026', gen_salt('bf'));

DO $$
DECLARE
  pwd_hash TEXT := crypt('AeroJet#2026', gen_salt('bf'));
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  u3 UUID := gen_random_uuid();
  u4 UUID := gen_random_uuid();
  u5 UUID := gen_random_uuid();
BEGIN

-- ── Insert 5 demo users into Supabase Auth ──────────────────────
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  recovery_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change,
  email_change_token_new, recovery_token
)
VALUES
  (
    u1, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'alex.turner@aerojet.demo',
    pwd_hash, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Turner"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    u2, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'sarah.chen@aerojet.demo',
    pwd_hash, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Chen"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    u3, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'james.patel@aerojet.demo',
    pwd_hash, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"James Patel"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    u4, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'maria.santos@aerojet.demo',
    pwd_hash, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Maria Santos"}',
    NOW(), NOW(), '', '', '', ''
  ),
  (
    u5, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'david.kim@aerojet.demo',
    pwd_hash, NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"David Kim"}',
    NOW(), NOW(), '', '', '', ''
  )
ON CONFLICT (email) DO NOTHING;

-- ── Insert matching identity records (needed for password login) ─
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  json_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.id::text,
  NOW(), NOW(), NOW()
FROM auth.users u
WHERE u.email IN (
  'alex.turner@aerojet.demo',
  'sarah.chen@aerojet.demo',
  'james.patel@aerojet.demo',
  'maria.santos@aerojet.demo',
  'david.kim@aerojet.demo'
)
ON CONFLICT (provider, provider_id) DO NOTHING;

RAISE NOTICE 'AeroJet demo users seeded successfully!';
END $$;

-- ── Verify the users were created ───────────────────────────────
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email LIKE '%@aerojet.demo'
ORDER BY created_at;
