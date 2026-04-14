-- ============================================================
-- ADMIN ROLE SETUP
-- Run in Supabase SQL Editor after creating the user
-- ============================================================

-- Set role=admin on a specific user by their email
-- Replace 'admin@example.com' with the actual admin email

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
where email = 'admin@example.com';

-- To verify:
-- select email, raw_user_meta_data->>'role' as role from auth.users;

-- To revoke admin (set back to user):
-- update auth.users
-- set raw_user_meta_data = raw_user_meta_data || '{"role": "user"}'::jsonb
-- where email = 'admin@example.com';
