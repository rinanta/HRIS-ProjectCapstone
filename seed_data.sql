-- ==============================================================================
-- SEED DATA UNTUK HRIS PT KARSA LINTAS NUSANTARA
-- Dibuat otomatis dari Data_Contoh_HRIS.xlsx
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bersihkan data tabel aplikasi sebelumnya agar fresh dan tidak ada duplicate key
TRUNCATE TABLE public.audit_log, public.slip_gaji, public.absensi, public.pengajuan_cuti, public.kuota_cuti, public.hari_libur, public.divisi, public.profiles CASCADE;

-- 1. DAFTAR AKUN AUTH.USERS & AUTH.IDENTITIES (16 Karyawan)
-- Password untuk semua akun: Latihan#2026

-- Akun: Rina Kusumawardani (rina.kusumawardani@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4',
    'authenticated',
    'authenticated',
    'rina.kusumawardani@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Rina Kusumawardani', 'peran', 'hrd'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '391a65a7-cf37-5806-8e65-bba91e3c42e4',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4',
    jsonb_build_object('sub', '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'email', 'rina.kusumawardani@karsalintas.test'),
    'email',
    'rina.kusumawardani@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Dimas Pratama (dimas.pratama@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801',
    'authenticated',
    'authenticated',
    'dimas.pratama@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Dimas Pratama', 'peran', 'hrd'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '8db8c644-85b2-5327-97fa-5fa1cfee7801',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801',
    jsonb_build_object('sub', '8db8c644-85b2-5327-97fa-5fa1cfee7801', 'email', 'dimas.pratama@karsalintas.test'),
    'email',
    'dimas.pratama@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Bayu Setiawan (bayu.setiawan@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '1533d79b-4814-5d40-a1db-0f4df56eae1e',
    'authenticated',
    'authenticated',
    'bayu.setiawan@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Bayu Setiawan', 'peran', 'atasan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '1533d79b-4814-5d40-a1db-0f4df56eae1e',
    '1533d79b-4814-5d40-a1db-0f4df56eae1e',
    jsonb_build_object('sub', '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'email', 'bayu.setiawan@karsalintas.test'),
    'email',
    'bayu.setiawan@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Maya Anggraini (maya.anggraini@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '9e156b1b-7370-5e67-9dd3-e03340156757',
    'authenticated',
    'authenticated',
    'maya.anggraini@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Maya Anggraini', 'peran', 'atasan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '9e156b1b-7370-5e67-9dd3-e03340156757',
    '9e156b1b-7370-5e67-9dd3-e03340156757',
    jsonb_build_object('sub', '9e156b1b-7370-5e67-9dd3-e03340156757', 'email', 'maya.anggraini@karsalintas.test'),
    'email',
    'maya.anggraini@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Hendra Gunawan (hendra.gunawan@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ed0f5fa7-63fe-54c3-936e-342f8a31261c',
    'authenticated',
    'authenticated',
    'hendra.gunawan@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Hendra Gunawan', 'peran', 'atasan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'ed0f5fa7-63fe-54c3-936e-342f8a31261c',
    'ed0f5fa7-63fe-54c3-936e-342f8a31261c',
    jsonb_build_object('sub', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', 'email', 'hendra.gunawan@karsalintas.test'),
    'email',
    'hendra.gunawan@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Siti Nurhaliza (siti.nurhaliza@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '24173534-3de4-5c18-bc67-d3034545c061',
    'authenticated',
    'authenticated',
    'siti.nurhaliza@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Siti Nurhaliza', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '24173534-3de4-5c18-bc67-d3034545c061',
    '24173534-3de4-5c18-bc67-d3034545c061',
    jsonb_build_object('sub', '24173534-3de4-5c18-bc67-d3034545c061', 'email', 'siti.nurhaliza@karsalintas.test'),
    'email',
    'siti.nurhaliza@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Agus Salim (agus.salim@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '22c1e137-9c79-5bae-a1e2-4dda8edffd71',
    'authenticated',
    'authenticated',
    'agus.salim@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Agus Salim', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '22c1e137-9c79-5bae-a1e2-4dda8edffd71',
    '22c1e137-9c79-5bae-a1e2-4dda8edffd71',
    jsonb_build_object('sub', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', 'email', 'agus.salim@karsalintas.test'),
    'email',
    'agus.salim@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Andi Wijaya (andi.wijaya@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '3ce404ad-885e-51ef-bbf7-10345f2c2f04',
    'authenticated',
    'authenticated',
    'andi.wijaya@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Andi Wijaya', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '3ce404ad-885e-51ef-bbf7-10345f2c2f04',
    '3ce404ad-885e-51ef-bbf7-10345f2c2f04',
    jsonb_build_object('sub', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', 'email', 'andi.wijaya@karsalintas.test'),
    'email',
    'andi.wijaya@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Larasati Dewi (larasati.dewi@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '1c5a8b5d-7360-584f-85bf-98b455254054',
    'authenticated',
    'authenticated',
    'larasati.dewi@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Larasati Dewi', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '1c5a8b5d-7360-584f-85bf-98b455254054',
    '1c5a8b5d-7360-584f-85bf-98b455254054',
    jsonb_build_object('sub', '1c5a8b5d-7360-584f-85bf-98b455254054', 'email', 'larasati.dewi@karsalintas.test'),
    'email',
    'larasati.dewi@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Putri Lestari (putri.lestari@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d',
    'authenticated',
    'authenticated',
    'putri.lestari@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Putri Lestari', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d',
    'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d',
    jsonb_build_object('sub', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 'email', 'putri.lestari@karsalintas.test'),
    'email',
    'putri.lestari@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Fajar Nugroho (fajar.nugroho@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ab650d98-91c6-547c-b2a3-ad28dd51d16b',
    'authenticated',
    'authenticated',
    'fajar.nugroho@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Fajar Nugroho', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'ab650d98-91c6-547c-b2a3-ad28dd51d16b',
    'ab650d98-91c6-547c-b2a3-ad28dd51d16b',
    jsonb_build_object('sub', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', 'email', 'fajar.nugroho@karsalintas.test'),
    'email',
    'fajar.nugroho@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Bambang Hartono (bambang.hartono@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'c2b680c2-b18e-590b-88db-fa6b74e1a9fd',
    'authenticated',
    'authenticated',
    'bambang.hartono@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Bambang Hartono', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'c2b680c2-b18e-590b-88db-fa6b74e1a9fd',
    'c2b680c2-b18e-590b-88db-fa6b74e1a9fd',
    jsonb_build_object('sub', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', 'email', 'bambang.hartono@karsalintas.test'),
    'email',
    'bambang.hartono@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Wulan Sari (wulan.sari@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ceb0527e-312c-5e4c-b287-4f9ddb431a9a',
    'authenticated',
    'authenticated',
    'wulan.sari@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Wulan Sari', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'ceb0527e-312c-5e4c-b287-4f9ddb431a9a',
    'ceb0527e-312c-5e4c-b287-4f9ddb431a9a',
    jsonb_build_object('sub', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 'email', 'wulan.sari@karsalintas.test'),
    'email',
    'wulan.sari@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Yoga Permana (yoga.permana@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'd79cc2a2-8d5e-5530-b55e-e063bf1542ca',
    'authenticated',
    'authenticated',
    'yoga.permana@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Yoga Permana', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'd79cc2a2-8d5e-5530-b55e-e063bf1542ca',
    'd79cc2a2-8d5e-5530-b55e-e063bf1542ca',
    jsonb_build_object('sub', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', 'email', 'yoga.permana@karsalintas.test'),
    'email',
    'yoga.permana@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Rizky Ramadhan (rizky.ramadhan@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'fd10f4fe-70a6-56dd-a004-ff67de44aa5b',
    'authenticated',
    'authenticated',
    'rizky.ramadhan@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Rizky Ramadhan', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    'fd10f4fe-70a6-56dd-a004-ff67de44aa5b',
    'fd10f4fe-70a6-56dd-a004-ff67de44aa5b',
    jsonb_build_object('sub', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', 'email', 'rizky.ramadhan@karsalintas.test'),
    'email',
    'rizky.ramadhan@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- Akun: Nadia Safitri (nadia.safitri@karsalintas.test)
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '46473e08-7d13-5dde-9cfd-0013e914dece',
    'authenticated',
    'authenticated',
    'nadia.safitri@karsalintas.test',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', 'Nadia Safitri', 'peran', 'karyawan'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '46473e08-7d13-5dde-9cfd-0013e914dece',
    '46473e08-7d13-5dde-9cfd-0013e914dece',
    jsonb_build_object('sub', '46473e08-7d13-5dde-9cfd-0013e914dece', 'email', 'nadia.safitri@karsalintas.test'),
    'email',
    'nadia.safitri@karsalintas.test',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;

-- 2. DIVISI
INSERT INTO public.divisi (id, nama, manajer_id) VALUES ('a6af4e8a-1b1b-5610-9e53-db2fdaf38100', 'Human Resources', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.divisi (id, nama, manajer_id) VALUES ('8865d249-d46e-5207-bf19-1b9163f5e954', 'Operasional Gudang', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.divisi (id, nama, manajer_id) VALUES ('867481d0-6289-54a1-87db-47bb81db15ef', 'Penjualan', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.divisi (id, nama, manajer_id) VALUES ('400c86ae-d2db-5185-b2d3-db5f60a08649', 'Keuangan', NULL) ON CONFLICT (id) DO NOTHING;

-- 3. PROFILES
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('1533d79b-4814-5d40-a1db-0f4df56eae1e', 'KLN-0002', 'Bayu Setiawan', 'bayu.setiawan@karsalintas.test', '081270717355', 'atasan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Manajer Operasional', 'tetap', '2018-02-05', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Manajer Operasional', peran = 'atasan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('391a65a7-cf37-5806-8e65-bba91e3c42e4', 'KLN-0003', 'Rina Kusumawardani', 'rina.kusumawardani@karsalintas.test', '081285131377', 'hrd', 'a6af4e8a-1b1b-5610-9e53-db2fdaf38100', 'Kepala HRD', 'tetap', '2019-04-01', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Kepala HRD', peran = 'hrd';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('9e156b1b-7370-5e67-9dd3-e03340156757', 'KLN-0004', 'Maya Anggraini', 'maya.anggraini@karsalintas.test', '081272498494', 'atasan', '867481d0-6289-54a1-87db-47bb81db15ef', 'Manajer Penjualan', 'tetap', '2019-01-07', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Manajer Penjualan', peran = 'atasan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('ed0f5fa7-63fe-54c3-936e-342f8a31261c', 'KLN-0005', 'Hendra Gunawan', 'hendra.gunawan@karsalintas.test', '081270643907', 'atasan', '400c86ae-d2db-5185-b2d3-db5f60a08649', 'Manajer Keuangan', 'tetap', '2019-10-01', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Manajer Keuangan', peran = 'atasan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('24173534-3de4-5c18-bc67-d3034545c061', 'KLN-0006', 'Siti Nurhaliza', 'siti.nurhaliza@karsalintas.test', '081278161301', 'karyawan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Supervisor Gudang', 'tetap', '2020-09-14', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Supervisor Gudang', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('22c1e137-9c79-5bae-a1e2-4dda8edffd71', 'KLN-0008', 'Agus Salim', 'agus.salim@karsalintas.test', '081288837457', 'karyawan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Staf Gudang', 'tetap', '2021-03-01', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Staf Gudang', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('3ce404ad-885e-51ef-bbf7-10345f2c2f04', 'KLN-0009', 'Andi Wijaya', 'andi.wijaya@karsalintas.test', '081235488219', 'karyawan', '867481d0-6289-54a1-87db-47bb81db15ef', 'Sales Executive', 'tetap', '2021-06-01', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Sales Executive', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('1c5a8b5d-7360-584f-85bf-98b455254054', 'KLN-0010', 'Larasati Dewi', 'larasati.dewi@karsalintas.test', '081234784691', 'karyawan', '400c86ae-d2db-5185-b2d3-db5f60a08649', 'Staf Akuntansi', 'tetap', '2021-09-13', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Staf Akuntansi', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('8db8c644-85b2-5327-97fa-5fa1cfee7801', 'KLN-0011', 'Dimas Pratama', 'dimas.pratama@karsalintas.test', '081278707214', 'hrd', 'a6af4e8a-1b1b-5610-9e53-db2fdaf38100', 'Staf HR dan Payroll', 'tetap', '2022-07-11', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Staf HR dan Payroll', peran = 'hrd';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 'KLN-0012', 'Putri Lestari', 'putri.lestari@karsalintas.test', '081273855860', 'karyawan', '867481d0-6289-54a1-87db-47bb81db15ef', 'Sales Executive', 'tetap', '2022-02-14', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Sales Executive', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('ab650d98-91c6-547c-b2a3-ad28dd51d16b', 'KLN-0013', 'Fajar Nugroho', 'fajar.nugroho@karsalintas.test', '081294541427', 'karyawan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Staf Gudang', 'kontrak', '2023-01-09', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Staf Gudang', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('c2b680c2-b18e-590b-88db-fa6b74e1a9fd', 'KLN-0014', 'Bambang Hartono', 'bambang.hartono@karsalintas.test', '081292404159', 'karyawan', '400c86ae-d2db-5185-b2d3-db5f60a08649', 'Staf Keuangan', 'kontrak', '2023-04-03', false)
ON CONFLICT (id) DO UPDATE SET aktif = false, jabatan = 'Staf Keuangan', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 'KLN-0015', 'Wulan Sari', 'wulan.sari@karsalintas.test', '081234987809', 'karyawan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Admin Gudang', 'kontrak', '2024-05-20', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Admin Gudang', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('d79cc2a2-8d5e-5530-b55e-e063bf1542ca', 'KLN-0016', 'Yoga Permana', 'yoga.permana@karsalintas.test', '081222633036', 'karyawan', '867481d0-6289-54a1-87db-47bb81db15ef', 'Sales Executive', 'kontrak', '2024-08-05', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Sales Executive', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('fd10f4fe-70a6-56dd-a004-ff67de44aa5b', 'KLN-0018', 'Rizky Ramadhan', 'rizky.ramadhan@karsalintas.test', '081269940718', 'karyawan', '8865d249-d46e-5207-bf19-1b9163f5e954', 'Staf Gudang', 'kontrak', '2025-11-02', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Staf Gudang', peran = 'karyawan';
INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('46473e08-7d13-5dde-9cfd-0013e914dece', 'KLN-0019', 'Nadia Safitri', 'nadia.safitri@karsalintas.test', '081250721828', 'karyawan', '867481d0-6289-54a1-87db-47bb81db15ef', 'Customer Service', 'kontrak', '2026-03-02', true)
ON CONFLICT (id) DO UPDATE SET aktif = true, jabatan = 'Customer Service', peran = 'karyawan';

-- UPDATE MANAJER DIVISI
UPDATE public.divisi SET manajer_id = '1533d79b-4814-5d40-a1db-0f4df56eae1e' WHERE id = '8865d249-d46e-5207-bf19-1b9163f5e954';
UPDATE public.divisi SET manajer_id = '9e156b1b-7370-5e67-9dd3-e03340156757' WHERE id = '867481d0-6289-54a1-87db-47bb81db15ef';
UPDATE public.divisi SET manajer_id = 'ed0f5fa7-63fe-54c3-936e-342f8a31261c' WHERE id = '400c86ae-d2db-5185-b2d3-db5f60a08649';

-- 4. HARI LIBUR
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-01-01', 'Tahun Baru Masehi', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-01-16', 'Isra Mikraj', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-02-17', 'Tahun Baru Imlek', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-03-19', 'Hari Suci Nyepi', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-03-20', 'Cuti bersama Idulfitri', 'cuti_bersama') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-03-23', 'Cuti bersama Idulfitri', 'cuti_bersama') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-04-03', 'Wafat Yesus Kristus', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-05-01', 'Hari Buruh', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-05-14', 'Kenaikan Yesus Kristus', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-05-27', 'Iduladha', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-06-01', 'Hari Lahir Pancasila', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-06-16', 'Tahun Baru Islam', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-08-17', 'Hari Kemerdekaan RI', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-08-25', 'Maulid Nabi', 'nasional') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-10-23', 'HUT PT Karsa Lintas Nusantara', 'perusahaan') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-12-24', 'Cuti bersama Natal', 'cuti_bersama') ON CONFLICT (tanggal) DO NOTHING;
INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES ('2026-12-25', 'Hari Raya Natal', 'nasional') ON CONFLICT (tanggal) DO NOTHING;

-- 5. KUOTA CUTI
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('45282eae-2c34-5802-828d-f87aa23e5c37', '1533d79b-4814-5d40-a1db-0f4df56eae1e', 2026, 12, 9) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('b1e24e8d-f94c-5c49-bcc7-d993ed27fdae', '391a65a7-cf37-5806-8e65-bba91e3c42e4', 2026, 12, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('291388c6-17a2-50ec-bf1a-00612612e0ba', '9e156b1b-7370-5e67-9dd3-e03340156757', 2026, 12, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('926d64d8-9840-51ac-95de-ce0b58b71184', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', 2026, 12, 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('e508bc8d-0973-54b4-86fb-c4cd404c6798', '24173534-3de4-5c18-bc67-d3034545c061', 2026, 12, 11) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('3befc5ab-46a3-57d3-9c02-8830b0b2ee95', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', 2026, 12, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('5d20d824-da83-5165-85cf-ae5bf5579547', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', 2026, 12, 7) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('c9059756-4539-5afa-8e94-8d08ecf41344', '1c5a8b5d-7360-584f-85bf-98b455254054', 2026, 12, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('b519c20b-5cfc-5e09-a3b8-30c4cece973b', '8db8c644-85b2-5327-97fa-5fa1cfee7801', 2026, 12, 4) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('9556f046-e910-5298-a3e2-def098886332', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 2026, 12, 12) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('e4f559a7-c2d1-5bd9-b72f-8cc402640c36', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', 2026, 12, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('6845c279-17c2-57b1-b9a6-971c699f1d1c', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', 2026, 12, 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('18d26a19-a947-5a15-ba48-9ce0959fb6db', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 2026, 12, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('5d05461c-1af5-5bd6-9e3d-d4ae6386cf3d', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', 2026, 12, 5) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('4c825934-3c0c-5392-af69-627122fc3109', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', 2026, 2, 0) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('f8cd464f-e8fc-5c61-88e4-c9c0c1265cdc', '46473e08-7d13-5dde-9cfd-0013e914dece', 2026, 0, 0) ON CONFLICT (id) DO NOTHING;

-- 6. PENGAJUAN CUTI
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '5c73f094-9ad5-5549-9070-03eb48617075', '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_tahunan', '2026-03-24', '2026-03-27',
    4, 'Acara keluarga', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-15T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'aae299a7-fe36-56e1-a0a6-3c6dc088c552', '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_tahunan', '2026-03-24', '2026-03-26',
    3, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    false, NULL, NULL,
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-03-15T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '16fea62f-2066-5d9d-842f-77f827f1c850', '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_tahunan', '2026-03-24', '2026-03-25',
    2, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-15T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'fb56c859-e085-5b20-a664-e62e8ebc70d8', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', 'cuti_tahunan', '2026-03-24', '2026-03-26',
    3, 'Mengurus keperluan keluarga', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-15T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '391ef15e-8aad-53fe-b1cd-ae77f15fe715', '24173534-3de4-5c18-bc67-d3034545c061', 'cuti_tahunan', '2026-03-24', '2026-03-27',
    4, 'Mengurus keperluan keluarga', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '80e39fe9-be66-5acc-91b4-b37454a67a72', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', 'cuti_tahunan', '2026-03-24', '2026-03-25',
    2, 'Pernikahan saudara', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '43b8be6b-d608-5856-b3fd-93deb4e7e8b2', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', 'cuti_tahunan', '2026-03-24', '2026-03-25',
    2, 'Pernikahan saudara', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'da314f97-0e95-55d3-bfa1-405978e26402', '1c5a8b5d-7360-584f-85bf-98b455254054', 'cuti_tahunan', '2026-03-24', '2026-03-26',
    3, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    true, 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '2af44cce-68ea-5141-b3a5-a35f9f979fd6', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 'cuti_tahunan', '2026-03-24', '2026-03-27',
    4, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '36def4b1-0a9a-5129-8a7e-9bb237efd767', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', 'cuti_tahunan', '2026-03-24', '2026-03-24',
    1, 'Acara keluarga', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'f5b3ef87-d621-5500-8339-e878f972cfab', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', 'cuti_tahunan', '2026-03-24', '2026-03-25',
    2, 'Pernikahan saudara', NULL, 'disetujui',
    true, 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '33f92e45-875a-572b-9332-cbf458bb9dbc', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 'cuti_tahunan', '2026-03-24', '2026-03-26',
    3, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-03-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '5657c89b-1c48-5eb4-ae80-1b2465343991', '8db8c644-85b2-5327-97fa-5fa1cfee7801', 'cuti_tahunan', '2026-04-06', '2026-04-08',
    3, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-03-28T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-03-27T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '4c1f121b-29bc-5ba7-baa3-9af0fde72f3f', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 'cuti_tahunan', '2026-06-08', '2026-06-12',
    5, 'Acara keluarga', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-05-30T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-05-31T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-05-29T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '010342a7-0235-5876-8ee5-585b79724ac9', '24173534-3de4-5c18-bc67-d3034545c061', 'cuti_tahunan', '2026-06-22', '2026-06-26',
    5, 'Pernikahan saudara', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-06-13T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-06-14T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-06-12T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'bca38a65-ef16-5aa9-9671-a6fb3b856e8c', '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_tahunan', '2026-06-29', '2026-07-01',
    3, 'Pernikahan saudara', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-06-20T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-06-19T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '419fd4a4-783f-5511-8fc7-c24d686998e4', '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_tahunan', '2026-07-06', '2026-07-07',
    2, 'Pernikahan saudara', NULL, 'disetujui',
    false, NULL, NULL,
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-06-27T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-06-26T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'e72b7a8f-717a-5b44-885f-27da51057a13', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', 'cuti_tahunan', '2026-07-13', '2026-07-14',
    2, 'Mudik setelah Idulfitri', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-07-04T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-07-05T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-07-03T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '4e1344e1-8a71-574e-bde3-0c6612a2e36e', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', 'cuti_tahunan', '2026-07-20', '2026-07-22',
    3, 'Liburan bersama keluarga', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-07-11T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-07-12T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-07-10T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '77a01bf1-38d6-5f26-ae8f-69be05d579fe', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 'cuti_tahunan', '2026-08-03', '2026-08-04',
    2, 'Mengurus keperluan keluarga', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-07-25T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-07-26T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-07-24T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'de036b83-114c-5368-a4a2-1381bcb3b9d9', '24173534-3de4-5c18-bc67-d3034545c061', 'cuti_tahunan', '2026-08-10', '2026-08-11',
    2, 'Acara keluarga', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-08-01T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-02T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-07-31T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '10469df0-139f-5237-bf75-001a26276584', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', 'cuti_tahunan', '2026-09-21', '2026-09-22',
    2, 'Menghadiri wisuda adik', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-11T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-12T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-09-10T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'd3e0718c-f77c-5cdb-b698-858b03cb4320', '1c5a8b5d-7360-584f-85bf-98b455254054', 'cuti_tahunan', '2026-09-24', '2026-09-25',
    2, 'Acara keluarga di Solo', NULL, 'disetujui',
    true, 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-15T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-16T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-09-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '4b0e92fd-e326-5d61-a2b6-d0334833f6c1', '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_tahunan', '2026-09-28', '2026-09-30',
    3, 'Liburan keluarga', NULL, 'dibatalkan',
    false, NULL, NULL,
    NULL, NULL,
    NULL, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-16T08:30:00+07:00',
    '2026-09-15T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'a08bd8cf-f706-54f6-b7b6-3fe88861562b', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', 'izin', '2026-09-29', '2026-09-29',
    1, 'Mengantar orang tua kontrol ke rumah sakit', NULL, 'ditolak',
    true, NULL, NULL,
    NULL, NULL,
    'Bertepatan dengan stok opname bulanan, mohon ganti tanggal', NULL, NULL,
    '2026-09-25T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '6f4699c5-e618-5e56-b8e3-8f4516f07599', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', 'izin', '2026-10-02', '2026-10-02',
    1, 'Mengurus perpanjangan SIM', NULL, 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-01T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-02T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-09-30T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '4c3cfd5e-3a62-5ccf-84de-2f7d90377419', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', 'cuti_tahunan', '2026-10-19', '2026-10-20',
    2, 'Acara keluarga di Bandung', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-06T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-07T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-10-05T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'c75cde0a-a6f9-59c0-811e-b41da89d1796', '46473e08-7d13-5dde-9cfd-0013e914dece', 'izin', '2026-10-09', '2026-10-09',
    1, 'Mengurus administrasi kependudukan', NULL, 'disetujui',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-07T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-08T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-10-06T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '2bb7a540-2361-50e8-bdb2-228ba2ab42c1', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', 'sakit', '2026-10-07', '2026-10-08',
    2, 'Demam dan radang tenggorokan', '22c1e137-9c79-5bae-a1e2-4dda8edffd71/surat-dokter-0710.pdf', 'disetujui',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-08T10:05:00+07:00',
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-09T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-10-07T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '1b5bacea-7556-5786-ae50-aaa9e4690be2', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', 'cuti_tahunan', '2026-11-09', '2026-11-11',
    3, 'Pernikahan kakak di Medan', NULL, 'disetujui_atasan',
    true, '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-09T10:05:00+07:00',
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-08T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '5f32839c-acf9-53a6-8a21-142fdfac5892', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', 'cuti_tahunan', '2026-10-21', '2026-10-21',
    1, 'Mengurus renovasi rumah', NULL, 'disetujui_atasan',
    true, '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-13T10:05:00+07:00',
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-12T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '2fb8a734-ff14-52a6-b923-87b59de18023', '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_tahunan', '2026-11-02', '2026-11-06',
    5, 'Umrah bersama orang tua', NULL, 'diajukan',
    false, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-12T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'f699ab25-9048-5d5c-9015-31f2a3c56b1d', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', 'sakit', '2026-10-13', '2026-10-13',
    1, 'Sakit kepala dan demam', NULL, 'disetujui',
    false, NULL, NULL,
    '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-14T13:40:00+07:00',
    NULL, NULL, NULL,
    '2026-10-13T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'feaf39cf-e72b-5830-bb52-efe413bc1c55', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', 'cuti_tahunan', '2026-10-26', '2026-10-28',
    3, 'Pulang kampung ke Yogyakarta', NULL, 'diajukan',
    true, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-13T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '42818f09-cf70-54a4-bf0d-92da9a8d6d81', '8db8c644-85b2-5327-97fa-5fa1cfee7801', 'cuti_tahunan', '2026-10-22', '2026-10-23',
    1, 'Libur panjang bersama keluarga', NULL, 'diajukan',
    false, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    'fe636507-1efd-571a-baba-159e31bf9285', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', 'izin', '2026-10-16', '2026-10-16',
    1, 'Menghadiri pembagian rapor anak', NULL, 'diajukan',
    true, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '4e472e78-3353-501e-a140-249c525f9530', '1c5a8b5d-7360-584f-85bf-98b455254054', 'sakit', '2026-10-14', '2026-10-15',
    2, 'Gejala tifus, rawat jalan', '1c5a8b5d-7360-584f-85bf-98b455254054/surat-dokter-1410.jpg', 'diajukan',
    true, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    '2026-10-14T09:12:00+07:00'
) ON CONFLICT (id) DO NOTHING;

-- 7. ABSENSI
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3228aa63-d9fd-5416-93b1-7bc3291d218f', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-21', '2026-09-21T08:13:12+07:00', '2026-09-21T18:06:14+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dff36532-2fb9-5bbc-8666-e1dea6f016b3', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-21', '2026-09-21T07:51:00+07:00', '2026-09-21T18:24:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'daa7494e-bfc5-54b6-a739-fda47277f49d', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-21', '2026-09-21T07:37:26+07:00', '2026-09-21T18:10:59+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '60eae3a3-8bcc-5556-b6c4-3889ed03a54a', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-21', '2026-09-21T08:05:16+07:00', '2026-09-21T17:40:48+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3295fb79-5ebf-5e2a-9104-1ee4a6877937', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-21', '2026-09-21T07:38:01+07:00', '2026-09-21T17:08:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '662588b4-ee13-508d-909e-ee0a27676fbc', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-21', '2026-09-21T07:45:06+07:00', '2026-09-21T17:37:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9b0f5926-fcc5-521a-96b0-042c55c56f70', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-21', '2026-09-21T07:21:54+07:00', '2026-09-21T18:27:00+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '99727e84-2e44-5c60-afb4-3734f79c0bb9', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-21', '2026-09-21T07:23:30+07:00', '2026-09-21T17:48:45+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7722f44c-b2d0-5069-b92d-e0bd6d33e247', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-21', '2026-09-21T07:24:36+07:00', '2026-09-21T18:20:12+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1e5c0795-1569-5df9-bc55-750a7c73a2a7', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-21', '2026-09-21T07:37:21+07:00', '2026-09-21T17:11:19+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ef723103-ca01-5dfd-a032-f4cdd03f67b8', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-21', '2026-09-21T07:46:48+07:00', '2026-09-21T17:15:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '57220d4e-d4a1-57b4-8956-c3008b9371e8', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-21', '2026-09-21T07:26:00+07:00', '2026-09-21T17:07:29+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4d91199c-7e12-56d6-aacb-5b18d11ddfe6', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-21', '2026-09-21T07:31:43+07:00', '2026-09-21T18:11:12+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '42f5bae5-98e4-5125-966c-ab122a3c7a65', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-21', '2026-09-21T07:32:46+07:00', '2026-09-21T17:16:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd615cb4d-1685-530d-87db-5a17bcd4a909', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-21', '2026-09-21T07:27:25+07:00', '2026-09-21T17:53:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b2444c5b-92f6-5a6b-8c84-70c08ccdd3a6', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-22', '2026-09-22T08:53:19+07:00', '2026-09-22T17:02:13+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4b2e2010-8f06-501d-a8b6-7b26121ea529', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-22', '2026-09-22T08:14:38+07:00', '2026-09-22T18:22:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'cdb331a9-8a5b-5b3f-9fc8-063847206edd', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-22', '2026-09-22T07:29:13+07:00', '2026-09-22T17:56:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bc1ba07e-ed6c-5f8b-9d39-7a335b57ac29', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-22', '2026-09-22T08:55:21+07:00', '2026-09-22T17:37:24+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e303d504-67d3-5d8f-9bf5-f8e6f3e1113e', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-22', '2026-09-22T07:25:13+07:00', '2026-09-22T18:14:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a2cf87f2-fd1b-5eaf-af2d-656608912f5c', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-22', '2026-09-22T07:58:23+07:00', '2026-09-22T17:47:39+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '44406e71-f84a-589a-bb02-0c0c7ddab4db', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-22', '2026-09-22T07:57:30+07:00', '2026-09-22T18:13:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '47a75f40-6944-5db1-a86d-5f4d4acfdf48', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-22', '2026-09-22T07:31:40+07:00', '2026-09-22T17:19:19+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6cbd4387-d27a-5dbf-b2b9-f158b926b7af', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-22', '2026-09-22T08:12:39+07:00', '2026-09-22T17:31:46+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '838bd954-ca88-52a9-ba10-33a53ce53a66', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-22', '2026-09-22T09:03:40+07:00', '2026-09-22T18:10:12+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '73078a0b-a128-533d-8215-1705eaed17f2', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-22', '2026-09-22T07:44:56+07:00', '2026-09-22T18:01:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4e653d62-6764-5f23-b59c-95c20f0875f9', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-22', '2026-09-22T07:23:06+07:00', '2026-09-22T17:13:02+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4a97ef45-0af6-539a-b448-52947fb65ffc', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-22', '2026-09-22T07:36:15+07:00', '2026-09-22T18:30:25+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '309bff79-a9b5-5565-8d64-e4b2e9851156', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-22', '2026-09-22T08:12:57+07:00', '2026-09-22T18:16:31+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0213c997-433c-50ba-885c-bc0da2eaec79', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-22', '2026-09-22T07:31:59+07:00', '2026-09-22T17:08:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dfe18b6a-0d7c-5a7c-b50e-a461546cfe23', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-23', '2026-09-23T07:55:41+07:00', '2026-09-23T18:18:39+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bbae7c91-9847-55f3-8ce4-d87047f4efb1', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-23', '2026-09-23T07:33:58+07:00', '2026-09-23T17:26:47+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'c246c56f-990e-5389-99bd-eabcd08476ca', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-23', '2026-09-23T08:33:26+07:00', '2026-09-23T17:57:15+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '76535910-4283-5b6f-9cb0-4132ba6e4ac9', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-23', '2026-09-23T07:31:18+07:00', '2026-09-23T17:47:33+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4b754b64-cd1f-57ff-ae85-7946406f3d69', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-23', '2026-09-23T07:28:05+07:00', '2026-09-23T17:46:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '939ee182-ed9f-58e2-9c9c-57de4106a09d', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-23', '2026-09-23T07:41:42+07:00', '2026-09-23T18:28:33+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '435a2fe2-fee0-56e0-8994-1a4144923d0e', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-23', '2026-09-23T07:28:37+07:00', '2026-09-23T17:04:59+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd807fee7-377c-5e25-aea5-3bce8b048c08', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-23', '2026-09-23T08:38:44+07:00', '2026-09-23T17:39:02+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fdb93f04-0170-5e97-850c-31e84f9fb36a', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-23', '2026-09-23T08:56:04+07:00', '2026-09-23T18:01:04+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '95b39145-7fce-5cc2-872b-23807ce7b0f9', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-23', '2026-09-23T07:40:08+07:00', '2026-09-23T17:09:04+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e365d10b-0184-5c63-9622-4f690012f361', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-23', '2026-09-23T07:43:47+07:00', '2026-09-23T17:05:57+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a0140274-76b3-51c8-b40b-d8a134fc640e', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-23', '2026-09-23T08:07:45+07:00', '2026-09-23T17:16:50+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0085d263-486f-5397-9311-3b47b541f5ef', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-23', '2026-09-23T07:41:22+07:00', '2026-09-23T17:10:43+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd83c806f-8f8b-5817-b0b8-b934cd558d8b', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-23', '2026-09-23T07:24:55+07:00', '2026-09-23T17:53:50+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '5b92377e-d7d7-5041-8ad3-966eb5bdefb6', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-23', '2026-09-23T08:47:36+07:00', '2026-09-23T17:01:39+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e6dd87cf-5038-595e-92a1-429b8a43cc6e', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-23', '2026-09-23T07:44:37+07:00', '2026-09-23T17:01:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bd8738ed-345e-58ab-a878-73b993de0e9f', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-24', '2026-09-24T07:25:40+07:00', '2026-09-24T17:14:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b8220cd0-9fbf-53f3-9210-9d956040ec62', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-24', '2026-09-24T08:06:21+07:00', '2026-09-24T17:49:59+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '295a8695-df8e-56f0-9523-b766a6756e60', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-24', '2026-09-24T07:57:29+07:00', '2026-09-24T17:56:29+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9d392022-eeff-5f7f-8e66-21da7f2125ff', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-24', '2026-09-24T07:25:33+07:00', '2026-09-24T18:05:01+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6d5ec464-05a2-58c4-89f7-6f5a092d7833', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-24', '2026-09-24T07:25:30+07:00', '2026-09-24T17:02:14+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '59099b44-f8aa-5c8b-a602-82cb6c34ff38', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-24', '2026-09-24T07:27:31+07:00', '2026-09-24T18:18:42+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b0400050-8841-5051-a3ef-7708662f31dc', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-24', '2026-09-24T07:36:57+07:00', '2026-09-24T17:01:23+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '05c729c9-62c9-5739-9229-7721d40da07f', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-24', '2026-09-24T08:03:39+07:00', '2026-09-24T17:25:33+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '917cc2bb-c464-58ec-b9dc-816f258a4e30', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-24', '2026-09-24T07:41:42+07:00', '2026-09-24T17:56:31+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f0f1ecf4-ced7-5cde-8a54-61415e89e5b5', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-24', '2026-09-24T07:40:25+07:00', '2026-09-24T18:25:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9bc90b72-470b-543f-84d5-0362f796325d', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-24', '2026-09-24T07:47:51+07:00', '2026-09-24T17:25:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b465d503-09ad-54a9-9d36-898562d379f3', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-24', '2026-09-24T07:34:37+07:00', '2026-09-24T17:40:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bcec530a-e73c-5723-8c7c-940e6d15f837', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-24', '2026-09-24T08:47:22+07:00', '2026-09-24T17:05:45+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'c26a632d-4bfe-54e7-90e7-78dba066f470', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-24', '2026-09-24T08:33:52+07:00', '2026-09-24T17:21:07+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3077fdfd-9178-5587-8d3f-a43984aa8250', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-24', '2026-09-24T07:37:59+07:00', '2026-09-24T17:27:53+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b83609b2-c40b-5b80-908b-bbf13704dcf3', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-25', '2026-09-25T08:00:33+07:00', '2026-09-25T18:03:43+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6ee03360-2dac-53a2-ba82-6cdd482cc99c', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25', '2026-09-25T08:13:53+07:00', '2026-09-25T18:19:28+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0ccc6ddd-9cdf-50ba-bf73-bcf2d9196830', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-25', '2026-09-25T08:13:02+07:00', '2026-09-25T17:35:55+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b715447f-2ac4-57a6-8e84-a89ee171ed5e', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-25', '2026-09-25T08:03:45+07:00', '2026-09-25T17:35:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b80613c3-5531-5389-bbb1-c568ada8c281', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-25', '2026-09-25T08:01:50+07:00', '2026-09-25T18:12:01+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1e5fae47-a349-5901-bc8f-5c4071cc5178', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-25', '2026-09-25T07:45:29+07:00', '2026-09-25T17:24:01+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'da2ae8a0-ef76-5a05-929a-97a648dfaef6', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-25', '2026-09-25T07:37:15+07:00', '2026-09-25T17:18:50+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd3a2deb3-c171-50a1-9bed-3ffa166a834e', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-25', '2026-09-25T08:56:07+07:00', '2026-09-25T17:57:06+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7185a29b-6a3d-5f04-ae56-50792b168614', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-25', '2026-09-25T08:01:40+07:00', '2026-09-25T17:47:04+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f627e432-6b5a-5c31-a48b-684eb824f4a1', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-25', '2026-09-25T07:32:52+07:00', '2026-09-25T18:00:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd48909f3-8892-54eb-bbae-97c727338362', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-25', '2026-09-25T07:20:48+07:00', '2026-09-25T18:00:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2c639d24-7465-5cc6-98d0-02b2ad3c5a8d', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-25', '2026-09-25T07:31:14+07:00', '2026-09-25T17:34:49+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2c9594fe-c954-507f-a9c9-0dc86399450c', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-25', '2026-09-25T09:00:33+07:00', '2026-09-25T18:04:39+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ad8e8081-036e-5110-90b3-1e6cfa1cd71c', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-25', '2026-09-25T07:30:25+07:00', '2026-09-25T18:29:57+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4153aa14-7932-505c-8bfd-f0097386a06f', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-25', '2026-09-25T07:46:59+07:00', '2026-09-25T17:49:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '54a53a05-33ab-5a51-98c3-a25cccdc8201', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-28', '2026-09-28T07:32:40+07:00', '2026-09-28T17:00:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1795f469-2654-5fce-b3fa-bf7d86101834', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-28', '2026-09-28T08:01:56+07:00', '2026-09-28T18:04:50+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '65bf83ff-e986-5c6c-90f9-21e483cbfdb9', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-28', '2026-09-28T07:41:29+07:00', '2026-09-28T17:41:41+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '51504d78-3748-543d-ad25-46d1b0f33bd8', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-28', '2026-09-28T07:26:46+07:00', '2026-09-28T18:22:59+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4248a617-ec8c-5a2e-86a7-147671d3bbb1', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-28', '2026-09-28T07:33:15+07:00', '2026-09-28T17:49:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '61fde971-8b5c-5b60-ba18-27becd34bc7a', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-28', '2026-09-28T07:54:50+07:00', '2026-09-28T17:41:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f1bde797-2eb6-5e39-a38e-d45fa98cab0a', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-28', '2026-09-28T08:14:01+07:00', '2026-09-28T17:44:32+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fce016ab-f775-5b1c-af53-bceb2c5d77c3', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-28', '2026-09-28T07:48:21+07:00', '2026-09-28T18:10:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '26baee1c-aa47-51a3-bd93-c6aa5979dcf4', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-28', '2026-09-28T07:51:58+07:00', '2026-09-28T17:03:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a69303b6-4ee8-5612-bd77-6efe1d1b69e2', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-28', '2026-09-28T07:24:27+07:00', '2026-09-28T17:04:11+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9db98d4d-a6d2-574c-ada6-8a9e7dc5b81b', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-28', '2026-09-28T08:03:50+07:00', '2026-09-28T17:17:30+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1ce85288-09eb-5aa9-82d0-430e5433f970', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-28', '2026-09-28T07:53:57+07:00', '2026-09-28T18:06:53+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '13cdfb67-f22c-540d-bd46-235f1506742a', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-28', '2026-09-28T07:48:56+07:00', '2026-09-28T18:03:37+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3b5a167a-5f7c-5cf8-a6b4-a8e060dd5f86', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-28', '2026-09-28T07:25:48+07:00', '2026-09-28T17:28:28+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ece814ac-e044-5e28-82f8-554a97134051', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-28', '2026-09-28T07:38:53+07:00', '2026-09-28T18:11:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '921f2d1e-2c1d-50f2-aebc-6de0f6c4b3ac', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-28', '2026-09-28T07:52:53+07:00', '2026-09-28T18:11:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '07fd7a8c-c293-5ca8-aea6-2d2ab39c76a4', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-29', '2026-09-29T07:44:54+07:00', '2026-09-29T18:18:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6a1ae720-f383-5bbd-bc81-a3809e7bff9a', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-29', '2026-09-29T07:29:34+07:00', '2026-09-29T18:07:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '010cb533-756e-576c-90d1-4cd27edb0d6c', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-29', '2026-09-29T07:32:26+07:00', '2026-09-29T18:08:07+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2413b5d2-8232-587e-90fb-b2a4e8168b4a', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-29', '2026-09-29T07:58:24+07:00', '2026-09-29T17:03:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bfa61f95-2b42-5a7c-bb60-b66a622f062f', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-29', '2026-09-29T07:53:58+07:00', '2026-09-29T17:51:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '30b58a5c-4bcb-54e4-afa3-dab34e1182db', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-29', '2026-09-29T07:55:00+07:00', '2026-09-29T18:02:05+07:00',
    'hadir', '8db8c644-85b2-5327-97fa-5fa1cfee7801', 'Mesin absensi gangguan, check-in dicatat manual oleh HRD'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b2de3a06-f05a-5047-afbb-642fa3ebc745', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-29', '2026-09-29T07:24:59+07:00', '2026-09-29T18:08:29+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '97a7a9e7-3582-5b8f-83de-5527e47312f7', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-29', '2026-09-29T08:11:59+07:00', '2026-09-29T17:51:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1145beef-efe8-5878-97cb-46b71198b5ca', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-29', '2026-09-29T07:51:08+07:00', '2026-09-29T17:43:27+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd13f5232-7d78-5c12-a649-519dca69d814', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-29', '2026-09-29T07:50:33+07:00', '2026-09-29T17:40:06+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1d30da2d-55b8-598b-9849-76047414e5b7', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-29', '2026-09-29T08:55:01+07:00', '2026-09-29T17:33:08+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dbbc0e75-93c7-5920-979a-5ad07ae83d70', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-29', '2026-09-29T07:21:02+07:00', '2026-09-29T17:24:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '09565b7e-4842-58ea-b669-6d2deff0c82f', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-29', '2026-09-29T08:03:18+07:00', '2026-09-29T17:41:46+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '845317bd-6634-5898-b523-fdb736564293', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-29', '2026-09-29T07:59:31+07:00', '2026-09-29T17:13:31+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '70e08437-6cb9-5b6e-b393-cf6b227c39f7', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-29', '2026-09-29T07:27:54+07:00', '2026-09-29T18:05:39+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0deb5970-8d8f-59ae-ac5e-527947519f66', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-29', '2026-09-29T07:32:44+07:00', '2026-09-29T18:07:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd3817f9e-e79a-5fe9-bc2e-dd7ad48e3aab', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-30', '2026-09-30T07:44:40+07:00', '2026-09-30T17:52:52+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a3951043-880b-5daa-acaa-85dabdc65582', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-30', '2026-09-30T07:30:34+07:00', '2026-09-30T17:26:55+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'cdd74ba6-f6cf-5066-a348-0296ace1027a', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-30', '2026-09-30T08:00:13+07:00', '2026-09-30T18:07:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'af10274a-93c8-5f98-80af-4a9e795ff7c6', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-30', '2026-09-30T07:59:37+07:00', '2026-09-30T17:17:14+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b49c2de7-cdc6-5721-ad2d-e8a3f2bd7568', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-30', '2026-09-30T08:00:51+07:00', '2026-09-30T17:44:57+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '89167c14-ee9c-5463-9a25-eaf8f9bbed5d', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-30', '2026-09-30T07:58:20+07:00', '2026-09-30T17:24:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '28db900c-e0e2-59f9-8c92-cb00b2d706d1', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-30', '2026-09-30T07:32:56+07:00', '2026-09-30T17:12:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '516e3204-fff6-5f50-9408-4ca784e25896', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-30', '2026-09-30T07:28:46+07:00', '2026-09-30T17:11:16+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e1a01aee-3348-5db2-9f1e-aecc1eb6cbf4', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-30', '2026-09-30T07:47:53+07:00', '2026-09-30T17:53:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1d7b8236-21ad-5da3-af1e-767b7a3d7620', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-30', '2026-09-30T07:28:12+07:00', '2026-09-30T17:51:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '93d8c56e-cdf4-507f-aa69-d7504ea6ca8e', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-30', '2026-09-30T07:21:06+07:00', '2026-09-30T17:25:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f4cde708-4617-59f7-9e45-9bbf9c8da26c', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-30', '2026-09-30T08:12:23+07:00', '2026-09-30T17:14:45+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '786222c3-c86b-589f-9d38-d75048204649', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-30', '2026-09-30T08:08:21+07:00', '2026-09-30T18:04:43+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'cbd7b9f5-23a4-5c87-a688-c575f65b9261', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-30', '2026-09-30T08:11:04+07:00', '2026-09-30T18:01:06+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7a02472e-2c3f-59a9-84f7-17538fd763fe', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-30', '2026-09-30T09:04:35+07:00', '2026-09-30T18:18:32+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '51f88a20-60f5-5a03-ab07-674990124c19', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-01', '2026-10-01T07:50:09+07:00', '2026-10-01T17:24:11+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '985fba35-6a5c-5ddf-aa0f-ed4e2a3cf9c6', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-01', '2026-10-01T07:31:53+07:00', '2026-10-01T17:20:18+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a15f584e-6d66-55f5-84bb-7b153d0e1b5c', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-01', '2026-10-01T07:26:37+07:00', '2026-10-01T17:07:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '99f46dbb-bf35-5792-ab6e-c24f05a05285', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-01', '2026-10-01T07:49:04+07:00', '2026-10-01T17:12:20+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9a446a5a-531a-5bd4-af8f-81e6e328b738', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-01', '2026-10-01T07:47:32+07:00', '2026-10-01T17:45:27+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '32375dfa-5eda-5b56-8d4e-a0d903ea661f', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-01', '2026-10-01T07:43:00+07:00', '2026-10-01T18:21:44+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '10227c39-9ed6-507e-ae34-75f4ac9edaab', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-01', '2026-10-01T08:28:11+07:00', '2026-10-01T17:52:29+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b90e6929-d7dd-5d36-b298-4c9d2fe847c5', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-01', '2026-10-01T07:43:25+07:00', '2026-10-01T17:24:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'da56baba-4f63-5ad8-aa6b-0c7b3476cb7e', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-01', '2026-10-01T07:52:50+07:00', '2026-10-01T17:01:20+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9f19c86c-e2f1-555e-9e5d-191697919571', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-01', '2026-10-01T08:11:53+07:00', '2026-10-01T18:30:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '35f74a80-a65e-5193-9355-229a5875b7b3', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-01', '2026-10-01T08:00:25+07:00', '2026-10-01T18:12:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd8299fc1-b789-5b84-8f4a-b9bf6a40f953', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-01', '2026-10-01T07:57:21+07:00', '2026-10-01T17:33:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '875d3de5-b8cb-5a7a-aeed-b08969341750', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-01', '2026-10-01T08:07:47+07:00', '2026-10-01T17:20:52+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '00b47195-e3e0-5439-80ca-c40c66b2b2b1', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-01', '2026-10-01T07:28:57+07:00', '2026-10-01T17:42:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b5a4f4ca-b019-566a-abb9-b94e21a12107', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-01', '2026-10-01T07:43:49+07:00', '2026-10-01T17:55:48+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'edf374df-e663-5bad-a60f-6e4ea2e25ea1', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-02', '2026-10-02T07:33:46+07:00', '2026-10-02T17:23:04+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3cec1de2-b577-5356-99b8-22f78841e1fd', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-02', '2026-10-02T07:39:30+07:00', '2026-10-02T17:12:00+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '8281a580-048d-51da-a514-33c6e5c4c883', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-02', '2026-10-02T08:00:57+07:00', '2026-10-02T18:19:03+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '18f6c264-5d0c-51f9-811b-20706a57991d', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-02', '2026-10-02T08:02:19+07:00', '2026-10-02T17:43:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b0efc5a9-0313-5e7a-a8a7-ebd47d77be89', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-02', '2026-10-02T07:56:11+07:00', '2026-10-02T18:08:04+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '89de00b9-9a91-5e17-a4cd-bbb630799ec2', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-02', '2026-10-02T07:51:41+07:00', '2026-10-02T17:27:44+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '22154346-5a5e-54d9-9814-6c13fb85aeac', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-02', '2026-10-02T07:45:36+07:00', '2026-10-02T17:02:07+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '233189e3-d117-5733-81ed-06195a00c175', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-02', '2026-10-02T08:07:15+07:00', '2026-10-02T17:32:28+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '49bfc65b-0b34-5d2e-b003-7b948856e745', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-02', '2026-10-02T07:23:48+07:00', '2026-10-02T17:25:41+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f16c574e-3c9a-5457-b740-9dfc997268a8', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-02', '2026-10-02T07:26:16+07:00', '2026-10-02T17:32:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ba454729-c7e6-5618-a143-2819afc1bdeb', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-02', '2026-10-02T07:55:34+07:00', '2026-10-02T18:05:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '194adc0b-1356-502f-a413-5869d75a7c77', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-02', '2026-10-02T07:56:54+07:00', '2026-10-02T17:12:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'df6a1126-94cb-5fab-846b-8853c0e5b134', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-02', '2026-10-02T08:01:04+07:00', '2026-10-02T18:10:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd6de3079-251e-5c51-a4c7-3992cc0b287c', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-02', '2026-10-02T07:22:24+07:00', '2026-10-02T17:20:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'df41ccc1-3f2e-5c86-994d-6b9abaecb494', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-05', '2026-10-05T07:30:54+07:00', '2026-10-05T18:03:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a723775e-0666-5432-8755-1d6efa01946b', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-05', '2026-10-05T07:23:27+07:00', '2026-10-05T18:03:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '77413137-46e1-5906-a595-3f66f437f7d5', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-05', '2026-10-05T07:45:38+07:00', '2026-10-05T17:39:23+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ba7fdccb-b1db-5ef1-b473-c38f357921d6', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-05', '2026-10-05T07:50:41+07:00', '2026-10-05T17:34:35+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '411ec7f5-8f52-584b-9724-1e6dbc24ecb3', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-05', '2026-10-05T08:02:45+07:00', '2026-10-05T17:37:01+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ceee5ae5-0d30-5f94-92e0-19cabe7055d2', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-05', '2026-10-05T08:31:37+07:00', '2026-10-05T17:05:40+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '8e6e8127-ef3a-55d3-9bf8-b62e61f57cb9', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-05', '2026-10-05T08:08:43+07:00', '2026-10-05T17:49:03+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fe7109e9-5826-5573-aba9-97d9db72f4f1', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-05', '2026-10-05T08:07:25+07:00', '2026-10-05T17:06:37+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a8081ee6-5043-511b-b46e-16aef007b8fa', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-05', '2026-10-05T07:40:04+07:00', '2026-10-05T17:28:27+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3e32fe81-ed15-5a5d-ae70-0eb0f4ad7858', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-05', '2026-10-05T07:36:48+07:00', '2026-10-05T17:31:02+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1ce5a0c1-5b45-52b1-b313-903ebc57b5fe', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-05', '2026-10-05T08:11:46+07:00', '2026-10-05T17:59:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ef8afdb2-b431-5abf-9d2e-9380a0b6b13a', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-05', '2026-10-05T08:12:15+07:00', '2026-10-05T18:17:45+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '265909fc-9ae9-5059-bfac-c92c94dac246', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-05', '2026-10-05T08:55:26+07:00', '2026-10-05T17:58:07+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'efeec8d2-a36b-5ff6-b3ee-79f44696a928', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-05', '2026-10-05T07:23:22+07:00', '2026-10-05T18:07:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9e41614e-c72d-5d6e-9e4c-e429bae5d3b5', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-05', '2026-10-05T07:48:08+07:00', '2026-10-05T18:25:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7cb6a062-dbc1-5d82-b992-997743297e89', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-06', '2026-10-06T07:36:40+07:00', '2026-10-06T18:14:43+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '347a4054-0c82-5db9-a2ad-74cf3180b63e', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-06', '2026-10-06T08:09:47+07:00', '2026-10-06T18:07:52+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4b47151c-73b6-5471-a431-211cd8f81377', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-06', '2026-10-06T07:38:46+07:00', '2026-10-06T17:16:15+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dd923fbc-72a3-5d6b-9982-7ddd7bed2b20', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-06', '2026-10-06T07:52:57+07:00', '2026-10-06T17:39:50+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4f753789-8947-53ad-b326-1bc216938cb2', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-06', '2026-10-06T08:14:22+07:00', '2026-10-06T17:35:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '341294d8-5ef9-51a9-991c-5c113dac92cf', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-06', '2026-10-06T08:06:36+07:00', '2026-10-06T18:29:37+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '45e2f24e-9907-5cfd-a0ee-795695a79cff', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-06', '2026-10-06T07:37:48+07:00', '2026-10-06T17:30:12+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3170d109-b7e3-581e-81df-f928d083779e', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-06', '2026-10-06T07:52:41+07:00', '2026-10-06T17:25:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a3f19e7d-1e79-5fc0-8102-9eed8c96b6d9', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-06', '2026-10-06T08:00:03+07:00', '2026-10-06T17:01:17+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd1ab6832-49c8-5aaa-830c-651a64888ea9', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-06', '2026-10-06T07:21:39+07:00', '2026-10-06T17:04:06+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0ef5f495-6d78-5eb3-aef8-e0048b15bf89', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-06', '2026-10-06T07:37:04+07:00', '2026-10-06T17:11:58+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '04f81ecc-e586-50e6-b0ec-3ccb0584ae1c', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-06', '2026-10-06T07:55:15+07:00', '2026-10-06T18:20:23+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0a06ef01-0d6b-51ee-8293-c22ed61ba7ef', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-06', '2026-10-06T07:42:13+07:00', '2026-10-06T17:43:21+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '64710477-bf9d-51ce-b4cd-2e8b0e5bac2b', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-06', '2026-10-06T07:28:53+07:00', '2026-10-06T17:09:51+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'be6470eb-5f9e-564c-97dd-425a6ebe1b4c', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-07', '2026-10-07T08:11:52+07:00', '2026-10-07T18:19:53+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '791b5da5-f207-5b5e-a299-828fd29b227f', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-07', '2026-10-07T07:33:28+07:00', '2026-10-07T17:54:47+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1520f20c-8984-5ce7-a063-fbc2be4aede5', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-07', '2026-10-07T08:11:09+07:00', '2026-10-07T17:47:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '525c5fa4-73db-56b1-90d7-76969afeb1e6', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-07', '2026-10-07T07:58:20+07:00', '2026-10-07T17:37:35+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2e6b2385-06f8-5c92-8143-fb4a5b095344', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-07', '2026-10-07T08:12:58+07:00', '2026-10-07T17:23:27+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7924c998-3d05-576b-93b0-55d93019ac55', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-07', '2026-10-07T07:57:06+07:00', '2026-10-07T17:59:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9a39e99d-4ebd-5d4a-bb51-5eb135ef9b14', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-07', '2026-10-07T07:54:05+07:00', '2026-10-07T17:55:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7ecd4eb2-108f-59fe-a50c-299d321d01a0', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-07', '2026-10-07T08:12:43+07:00', '2026-10-07T17:59:19+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bbcab3e0-0c60-594d-8a9d-ef36c15a76cb', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-07', '2026-10-07T07:20:04+07:00', '2026-10-07T17:39:13+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '06f2a6d4-7dcf-565b-8065-4a7fff66d28a', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-07', '2026-10-07T07:58:05+07:00', '2026-10-07T18:28:19+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '774f7f33-5705-55c4-b40c-7134ebd4f61e', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-07', '2026-10-07T08:08:44+07:00', '2026-10-07T17:41:18+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '52db0183-162d-539f-a1e7-c080559f188c', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-07', '2026-10-07T07:34:22+07:00', '2026-10-07T18:24:46+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '5432acff-2fa8-520a-b399-702e43bae0ac', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-07', '2026-10-07T07:27:20+07:00', '2026-10-07T18:30:28+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1f2b397d-4e2b-5d39-9b9d-a1d9a4c98ce2', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-07', '2026-10-07T08:03:58+07:00', '2026-10-07T17:35:28+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a11b2194-25a4-5be1-88c4-2caf10ba9347', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-08', '2026-10-08T07:39:29+07:00', '2026-10-08T17:40:14+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd590721b-c903-57f6-8179-7328361845d9', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-08', '2026-10-08T08:06:57+07:00', '2026-10-08T18:06:15+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7a6436c8-7b50-5670-9ef6-fcf44efc4db6', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-08', '2026-10-08T08:13:23+07:00', '2026-10-08T17:03:23+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'aea96ed2-244e-58a4-9108-6e88c359114c', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-08', '2026-10-08T07:57:24+07:00', '2026-10-08T17:24:47+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a73b09a9-1412-5956-af86-16373d2f4a24', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-08', '2026-10-08T08:11:24+07:00', '2026-10-08T18:09:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2e6e6f33-aedb-5803-9ae7-b9bd60c1a930', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-08', '2026-10-08T07:56:11+07:00', '2026-10-08T17:22:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2f0774c9-a5d6-58c0-b77e-bce5e59fde09', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-08', '2026-10-08T08:14:18+07:00', '2026-10-08T17:02:14+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f63f3f12-dd28-5666-bc76-32142dfbdc0b', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-08', '2026-10-08T07:54:10+07:00', '2026-10-08T18:12:18+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ff032095-5d14-537c-8c8d-95fd4d82bd4f', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-08', '2026-10-08T08:01:53+07:00', '2026-10-08T17:54:04+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '2eed25e2-3978-5dd9-8623-c90eb796076b', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-08', '2026-10-08T07:39:50+07:00', '2026-10-08T18:09:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '45726a86-0519-5c10-9755-c73af4c587a1', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-08', '2026-10-08T07:37:47+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '3bff64a5-c65b-5cac-be50-f2dbeea97345', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-08', '2026-10-08T08:17:40+07:00', '2026-10-08T18:23:09+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fa18170d-1729-5f44-89c3-c832fc5e13e0', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-08', '2026-10-08T08:57:27+07:00', '2026-10-08T17:31:45+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd743b7e8-f0aa-5501-b6ba-e5af57a70057', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-08', '2026-10-08T08:08:58+07:00', '2026-10-08T18:06:21+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '342b562d-686c-576e-a7e0-b34a207c44ed', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-09', '2026-10-09T07:45:22+07:00', '2026-10-09T17:43:51+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '75e3c0d3-3bff-5608-b27a-267503d5170e', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-09', '2026-10-09T08:03:08+07:00', '2026-10-09T18:03:31+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd5de645d-af92-53cf-a717-3f8dd4da9ad7', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-09', '2026-10-09T08:06:04+07:00', '2026-10-09T18:30:39+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'afe91e66-a575-553a-9c3b-8c3597d82fc4', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-09', '2026-10-09T07:46:48+07:00', '2026-10-09T18:25:22+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ca196034-bee2-533c-b4fd-167396a6d232', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-09', '2026-10-09T08:11:24+07:00', '2026-10-09T17:11:56+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ddbb5656-25fa-5bf0-b0ab-ceed5ca8b4b0', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-09', '2026-10-09T07:54:40+07:00', '2026-10-09T17:03:33+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'db49f7dc-1258-5423-a8d0-88a5b5d0aebf', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-09', '2026-10-09T07:20:51+07:00', '2026-10-09T17:14:26+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '58fda93a-77a0-58e7-b155-f71d9442107c', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-09', '2026-10-09T07:29:15+07:00', '2026-10-09T17:20:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bd8b9efe-cdda-5904-9a99-ff31456ed3ca', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-09', '2026-10-09T07:30:20+07:00', '2026-10-09T17:26:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '5d1f4661-3a12-5ed5-9b2d-a4fc869de62f', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-09', '2026-10-09T07:38:17+07:00', '2026-10-09T17:07:30+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9cc670bc-f811-5353-859c-acfecfd24ada', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-09', '2026-10-09T07:27:19+07:00', '2026-10-09T18:22:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fa163fa6-d9cc-594d-b4e1-cca4743d4809', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-09', '2026-10-09T07:31:58+07:00', '2026-10-09T17:07:48+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'abe59b1c-5dc4-54be-815b-aafa8f9c2190', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-09', '2026-10-09T07:57:30+07:00', '2026-10-09T17:04:20+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b9d1ebd9-73c4-5644-b35a-ce97e624ce8e', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-09', '2026-10-09T08:27:22+07:00', '2026-10-09T17:27:37+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '249acbde-7c24-5c99-9834-fa0016308d80', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-12', '2026-10-12T08:05:30+07:00', '2026-10-12T18:16:32+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '34db6a9a-694e-565f-b2be-8a0a1cfe0a17', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-12', '2026-10-12T07:31:57+07:00', '2026-10-12T17:35:25+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '57fcf320-439f-5b1e-91b6-74b40e574ef5', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-12', '2026-10-12T08:08:59+07:00', '2026-10-12T17:39:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bd630735-5389-5d1d-bef1-359d8b3cf498', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-12', '2026-10-12T08:12:35+07:00', '2026-10-12T18:01:54+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '22374fe9-a032-5efc-89b3-546093131918', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-12', '2026-10-12T08:15:01+07:00', '2026-10-12T17:43:42+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6c63e949-bcd1-5590-aebd-bf6394ec24de', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-12', '2026-10-12T07:25:30+07:00', '2026-10-12T17:28:25+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd0ee28a8-993d-5b1a-b751-7c29c71fee82', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-12', '2026-10-12T08:15:00+07:00', '2026-10-12T17:49:33+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fd3c98ef-1dc5-5487-b9cc-2594e75b848c', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-12', '2026-10-12T08:09:17+07:00', '2026-10-12T17:07:42+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9caa10e6-0870-5805-bfdf-64ea72588dda', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-12', '2026-10-12T07:20:55+07:00', '2026-10-12T18:00:57+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'c7cf35bd-6000-5330-b470-2b9678af0187', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-12', '2026-10-12T08:10:15+07:00', '2026-10-12T17:53:38+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '8ab172dc-2249-595b-b029-18fb80a779df', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-12', '2026-10-12T07:46:10+07:00', '2026-10-12T17:41:09+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '44dd9b75-35c8-51f3-9b78-331632c5dcfe', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-12', '2026-10-12T08:11:33+07:00', '2026-10-12T17:16:40+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a0c241f8-3d43-50f7-a26f-9af39f549270', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-12', '2026-10-12T07:59:17+07:00', '2026-10-12T18:06:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'fed28c78-0d18-5cda-8d04-84b36e06e646', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-12', '2026-10-12T08:52:49+07:00', '2026-10-12T17:22:00+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'abdb1eb1-ef40-5aa2-bb2d-e33dad27ad2b', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-12', '2026-10-12T08:14:09+07:00', '2026-10-12T17:16:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ce163a19-fff8-530b-acdb-d3b311e38037', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-13', '2026-10-13T07:59:45+07:00', '2026-10-13T18:07:06+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6589a299-a36f-5604-8bd4-a9462b3aaec4', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-13', '2026-10-13T08:04:29+07:00', '2026-10-13T17:10:47+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bdf6351b-74ff-596a-a626-d037f540341b', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-13', '2026-10-13T08:14:32+07:00', '2026-10-13T17:38:01+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '23495981-2cbe-5664-9cbb-e75b1b199be9', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-13', '2026-10-13T07:46:12+07:00', '2026-10-13T18:27:05+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ffec1edc-e67c-50e0-b97c-cecf809aab89', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-13', '2026-10-13T07:48:13+07:00', '2026-10-13T17:04:34+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '5d282e19-af5a-5f0d-81e9-33ca920daaf3', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-13', '2026-10-13T07:51:10+07:00', '2026-10-13T17:39:20+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '370b193c-6f2a-569e-9f9b-83ea63a8b866', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-10-13', '2026-10-13T07:24:35+07:00', '2026-10-13T17:39:29+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dd0a9cf8-76cd-5eb2-b3cb-0d8f8d660655', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-13', '2026-10-13T07:24:23+07:00', '2026-10-13T17:09:43+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd7bcf698-f4f7-5849-a2a4-b969db705fc8', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-13', '2026-10-13T08:02:25+07:00', '2026-10-13T18:26:29+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e4a77aaf-3193-54b7-ae43-4a568529d95f', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-13', '2026-10-13T08:10:53+07:00', '2026-10-13T17:15:41+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0fc430d0-a278-5ea7-be7a-16293da3ea3f', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-13', '2026-10-13T07:44:45+07:00', '2026-10-13T18:30:30+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'c0fc8e84-653c-5f7b-a1cc-1e95a970f60d', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-13', '2026-10-13T08:52:07+07:00', '2026-10-13T17:58:49+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '723155c0-29cf-56fe-8b61-b8e35d5f2c2c', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-13', '2026-10-13T09:02:13+07:00', '2026-10-13T18:18:09+07:00',
    'terlambat', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9e908e0a-142e-5bf2-828c-dde77ebd701b', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-13', '2026-10-13T07:44:59+07:00', '2026-10-13T18:09:47+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '84dde812-5456-51a0-99f9-38111b7e6ca0', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-10-14', '2026-10-14T07:41:48+07:00', '2026-10-14T17:50:35+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '1aec940f-0ee5-5e5e-8705-f583ce625c43', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-14', '2026-10-14T07:36:12+07:00', '2026-10-14T17:25:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ff1ab8cf-aa4d-5851-bcdc-271eda3260b8', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-14', '2026-10-14T07:41:19+07:00', '2026-10-14T17:35:36+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f91a2657-f797-56f2-aa9c-75a905b8b07c', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-14', '2026-10-14T08:00:21+07:00', '2026-10-14T17:57:52+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '6ab41526-d726-5fe8-a339-9a114762b3e4', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-14', '2026-10-14T07:26:09+07:00', '2026-10-14T18:19:06+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '90002369-c436-54b7-b9c5-06acaf04ed63', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-14', '2026-10-14T08:00:45+07:00', '2026-10-14T17:22:11+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'b20d03b8-8665-5fa7-b3e5-3de75c554cb2', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-14', '2026-10-14T07:22:53+07:00', '2026-10-14T17:59:37+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '29a0b709-65f8-5e6a-8597-baf00dfb05dd', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-14', '2026-10-14T07:26:14+07:00', '2026-10-14T17:04:10+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '560898c3-f488-569e-a24b-1435c948df1e', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-14', '2026-10-14T07:47:26+07:00', '2026-10-14T17:09:21+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f23dde23-54f8-5a16-9cb9-92ce06fab6a6', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-14', '2026-10-14T07:47:59+07:00', '2026-10-14T18:05:08+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e058f959-64fe-5031-a215-5ca8a0bbe260', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-14', '2026-10-14T08:09:09+07:00', '2026-10-14T18:28:24+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'f49d3a65-34f9-57ae-bb10-32b2f36338ac', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-14', '2026-10-14T07:46:39+07:00', '2026-10-14T17:01:46+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'bc65e69d-1332-54fa-a9ce-62a1e025a648', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-14', '2026-10-14T08:04:20+07:00', '2026-10-14T17:31:42+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '018d97fa-1107-551f-85f7-52b7121cb9b9', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-14', '2026-10-14T07:53:01+07:00', '2026-10-14T17:33:21+07:00',
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'dcf4f66d-8f11-5a2b-aa1f-66567645e1dc', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-10-15', '2026-10-15T07:39:41+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '9e14f457-3487-562a-b900-65fdc40ad406', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-10-15', '2026-10-15T07:55:24+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'ed2555fe-719d-513e-903f-490c340b7b1b', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-10-15', '2026-10-15T07:41:50+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'c0ac0dad-69b2-5a6e-b5de-da8ae841c341', '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-15', '2026-10-15T07:26:39+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'd2ec1a53-18b0-5726-8db5-019c926096f0', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-15', '2026-10-15T07:36:49+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'e2a3e238-253c-599c-912d-77180cd28830', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-15', '2026-10-15T07:39:35+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '7da0cf78-a2f2-50d5-8c8e-eb2add6b3cc1', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-10-15', '2026-10-15T07:59:32+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '0ebedd5a-1d69-5195-a147-c20f851fcb61', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-15', '2026-10-15T07:56:45+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '16da49a4-170f-5cbc-abd9-d5d0929291ea', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-15', '2026-10-15T07:53:45+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    'a7d1759c-039f-5f80-b55c-519faf36bc6d', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-15', '2026-10-15T07:32:36+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '4b1783a3-edf1-56e3-bb2b-fc661bc4428f', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-10-15', '2026-10-15T08:00:42+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '20173fcb-a37f-528b-8378-8974acd91a7c', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-10-15', '2026-10-15T07:25:08+07:00', NULL,
    'hadir', NULL, NULL
) ON CONFLICT (id) DO NOTHING;

-- 8. SLIP GAJI
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'dee3628e-467e-5dbb-9193-84ee78ecd921', 'SG-202608-001', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-08-01',
    16500000, 2750000, 660000, 18590000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '06e1b6ad-e0df-5396-8e90-b35a67c9e133', 'SG-202608-002', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-01',
    16000000, 2750000, 640000, 18110000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'c54bd838-2137-5c27-9100-052eb7a6e414', 'SG-202608-003', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-08-01',
    17000000, 2750000, 680000, 19070000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'e9389bbf-fba6-55d5-8ca1-30ecd5c4b45d', 'SG-202608-004', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-08-01',
    16500000, 2750000, 660000, 18590000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'c8288013-2907-5b53-956b-f46a4bec488f', 'SG-202608-005', '24173534-3de4-5c18-bc67-d3034545c061', '2026-08-01',
    8500000, 1750000, 340000, 9910000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '6fb0c1d4-3e6a-5613-9e83-bb20d0be22d4', 'SG-202608-006', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-08-01',
    6100000, 1150000, 244000, 7006000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '9367cd00-add8-5492-8072-848b4efb2c9a', 'SG-202608-007', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-08-01',
    7200000, 1450000, 288000, 8362000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '63cef3f0-d5e4-5d20-a616-d0c5e7a31df2', 'SG-202608-008', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-08-01',
    7500000, 1150000, 300000, 8350000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '5fa51b13-ff5b-52ac-83e9-2cd42dea1c28', 'SG-202608-009', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-08-01',
    7800000, 1150000, 312000, 8638000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'e5cb9cc6-0235-5033-ae8a-fcc4d3faef87', 'SG-202608-010', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-08-01',
    7000000, 1450000, 280000, 8170000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'fb7bce60-1ec5-5916-b875-87dd64ee95a9', 'SG-202608-011', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-08-01',
    5900000, 1150000, 236000, 6814000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'd6f66fe8-2f97-5bb0-b660-4a6a07df5dca', 'SG-202608-012', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-08-01',
    6300000, 1150000, 252000, 7198000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '34f91fbb-9a3c-55d6-ae98-1458e93551b3', 'SG-202608-013', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-08-01',
    5900000, 1000000, 236000, 6664000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '210ebafc-01f5-5337-855a-37081e3a4291', 'SG-202608-014', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-08-01',
    6500000, 1450000, 260000, 7690000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '2f7ef9cc-c955-5188-bcda-de72260c8f33', 'SG-202608-015', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-08-01',
    5800000, 1000000, 232000, 6568000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '0885153e-6c47-5468-8b48-e4204a072785', 'SG-202608-016', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-08-01',
    5800000, 1000000, 232000, 6568000, 'Potongan: iuran BPJS bagian karyawan 4%; tunjangan termasuk insentif HUT RI Rp250.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-08-25T10:00:00+07:00', '2026-08-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '91d43e4a-de89-5547-b169-be4dcba8ed2d', 'SG-202609-001', '1533d79b-4814-5d40-a1db-0f4df56eae1e', '2026-09-01',
    16500000, 2500000, 660000, 18340000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'cc25fac2-9c5b-5e27-bc97-5c92dc65a2c1', 'SG-202609-002', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-01',
    16000000, 2500000, 640000, 17860000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '2024c053-01d6-55f0-a74b-93c1c68b73f6', 'SG-202609-003', '9e156b1b-7370-5e67-9dd3-e03340156757', '2026-09-01',
    17000000, 2500000, 680000, 18820000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '4521aaa3-f54a-50a1-b0b2-4ff868a75ca9', 'SG-202609-004', 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', '2026-09-01',
    16500000, 2500000, 660000, 18340000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '5370946d-ae89-567c-9347-11d71982bc9b', 'SG-202609-005', '24173534-3de4-5c18-bc67-d3034545c061', '2026-09-01',
    8500000, 1500000, 340000, 9660000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '733aa3a5-7318-5eab-a244-2983d5c0c9a9', 'SG-202609-006', '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-09-01',
    6100000, 900000, 244000, 6756000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'd8f667b3-53e4-542f-a4b6-4d31c733fed4', 'SG-202609-007', '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-09-01',
    7200000, 1200000, 288000, 8112000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'a96a928d-28e6-536e-a49c-168eb956dda7', 'SG-202609-008', '1c5a8b5d-7360-584f-85bf-98b455254054', '2026-09-01',
    7500000, 900000, 300000, 8100000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'c03279d1-16ba-5b2e-b481-b0d264b35d21', 'SG-202609-009', '8db8c644-85b2-5327-97fa-5fa1cfee7801', '2026-09-01',
    7800000, 900000, 312000, 8388000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'ca804be2-8ed4-5d1b-8dfa-de3bdfa00e83', 'SG-202609-010', 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-09-01',
    7000000, 1200000, 280000, 7920000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '6405fbca-56e8-5cfd-ab52-ea47abaab3fa', 'SG-202609-011', 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-09-01',
    5900000, 900000, 236000, 6564000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'dbc1a39b-e9de-5803-8864-7a2697bdff18', 'SG-202609-012', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '2026-09-01',
    6300000, 900000, 252000, 6948000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'cd92b484-93d3-588e-9af3-9b5370cb6edd', 'SG-202609-013', 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-09-01',
    5900000, 750000, 236000, 6414000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '1d8315ef-7046-5262-ad5d-e5520d119da1', 'SG-202609-014', 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-09-01',
    6500000, 1200000, 710000, 6990000, 'Potongan: iuran BPJS 4% dan cicilan kasbon Rp450.000', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'c805b979-7d31-502b-84de-e0acaa44d073', 'SG-202609-015', 'fd10f4fe-70a6-56dd-a004-ff67de44aa5b', '2026-09-01',
    5800000, 750000, 232000, 6318000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '2aa1c9bc-b358-5e8b-921f-ec71d748ce50', 'SG-202609-016', '46473e08-7d13-5dde-9cfd-0013e914dece', '2026-09-01',
    5800000, 750000, 232000, 6318000, 'Potongan: iuran BPJS bagian karyawan 4%', 'terbit',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', '391a65a7-cf37-5806-8e65-bba91e3c42e4', '2026-09-25T10:00:00+07:00', '2026-09-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '06c4369d-e1cd-540b-8ec8-4c8ea8d01b51', NULL, '24173534-3de4-5c18-bc67-d3034545c061', '2026-10-01',
    8500000, 1500000, 340000, 9660000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '7de8e7be-6fe7-531d-99e6-51a1b57c601e', NULL, '22c1e137-9c79-5bae-a1e2-4dda8edffd71', '2026-10-01',
    6100000, 900000, 244000, 6756000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '86d1f148-ceb7-5f27-b658-06a21b9209ef', NULL, '3ce404ad-885e-51ef-bbf7-10345f2c2f04', '2026-10-01',
    7200000, 1200000, 288000, 8112000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    'b3e4545b-8cf4-5305-b0f4-03f9247ece32', NULL, 'a1eae53e-5cba-50f7-9211-4eec3c1d1f6d', '2026-10-01',
    7000000, 1200000, 280000, 7920000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '6a0caba6-5750-5ce9-a4a2-9e96bb19300c', NULL, 'ab650d98-91c6-547c-b2a3-ad28dd51d16b', '2026-10-01',
    5900000, 900000, 236000, 6564000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '2ae12363-7b05-502e-954e-84ffdf9dde2b', NULL, 'ceb0527e-312c-5e4c-b287-4f9ddb431a9a', '2026-10-01',
    5900000, 750000, 236000, 6414000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;
INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '5d5e065c-fb5c-5f36-804b-675ed59569cc', NULL, 'd79cc2a2-8d5e-5530-b55e-e063bf1542ca', '2026-10-01',
    6500000, 1200000, 260000, 7440000, 'Potongan: iuran BPJS bagian karyawan 4%', 'draf',
    '8db8c644-85b2-5327-97fa-5fa1cfee7801', NULL, NULL, '2026-10-20T14:00:00+07:00'
) ON CONFLICT (id) DO NOTHING;

-- 9. AUDIT LOG
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (1, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'kuota_update', 'kuota_cuti', '4c825934-3c0c-5392-af69-627122fc3109', '{"jatah_hari": 12}'::jsonb, '{"jatah_hari": 2}'::jsonb, '2026-01-05T09:30:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (2, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'kuota_update', 'kuota_cuti', 'f8cd464f-e8fc-5c61-88e4-c9c0c1265cdc', '{"jatah_hari": 12}'::jsonb, '{"jatah_hari": 0}'::jsonb, '2026-01-05T09:31:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (3, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'slip_update', 'slip_gaji', 'dee3628e-467e-5dbb-9193-84ee78ecd921', '{"status": "draf"}'::jsonb, '{"status": "terbit", "nomor_slip": "SG-202608-001"}'::jsonb, '2026-08-25T10:00:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (4, '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_update', 'pengajuan_cuti', '10469df0-139f-5237-bf75-001a26276584', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-09-11T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (5, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', '10469df0-139f-5237-bf75-001a26276584', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-09-12T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (6, 'ed0f5fa7-63fe-54c3-936e-342f8a31261c', 'cuti_update', 'pengajuan_cuti', 'd3e0718c-f77c-5cdb-b698-858b03cb4320', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-09-15T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (7, '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_update', 'pengajuan_cuti', '4b0e92fd-e326-5d61-a2b6-d0334833f6c1', '{"status": "diajukan"}'::jsonb, '{"status": "dibatalkan"}'::jsonb, '2026-09-16T08:30:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (8, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', 'd3e0718c-f77c-5cdb-b698-858b03cb4320', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-09-16T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (9, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'slip_update', 'slip_gaji', '91d43e4a-de89-5547-b169-be4dcba8ed2d', '{"status": "draf"}'::jsonb, '{"status": "terbit", "nomor_slip": "SG-202609-001"}'::jsonb, '2026-09-25T10:00:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (10, '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_update', 'pengajuan_cuti', 'a08bd8cf-f706-54f6-b7b6-3fe88861562b', '{"status": "diajukan"}'::jsonb, '{"status": "ditolak", "alasan_penolakan": "Bertepatan dengan stok opname bulanan, mohon ganti tanggal"}'::jsonb, '2026-09-26T09:20:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (11, '8db8c644-85b2-5327-97fa-5fa1cfee7801', 'koreksi_absensi_insert', 'absensi', '30b58a5c-4bcb-54e4-afa3-dab34e1182db', NULL, '{"jam_masuk": "2026-09-29T07:55:00+07:00", "alasan_koreksi": "Mesin absensi gangguan, check-in dicatat manual oleh HRD"}'::jsonb, '2026-09-29T11:30:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (12, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'karyawan_update', 'profiles', 'c2b680c2-b18e-590b-88db-fa6b74e1a9fd', '{"aktif": true}'::jsonb, '{"aktif": false}'::jsonb, '2026-10-01T08:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (13, '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_update', 'pengajuan_cuti', '6f4699c5-e618-5e56-b8e3-8f4516f07599', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-01T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (14, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', '6f4699c5-e618-5e56-b8e3-8f4516f07599', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-10-02T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (15, '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_update', 'pengajuan_cuti', '4c3cfd5e-3a62-5ccf-84de-2f7d90377419', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-06T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (16, '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_update', 'pengajuan_cuti', 'c75cde0a-a6f9-59c0-811e-b41da89d1796', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-07T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (17, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', '4c3cfd5e-3a62-5ccf-84de-2f7d90377419', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-10-07T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (18, '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_update', 'pengajuan_cuti', '2bb7a540-2361-50e8-bdb2-228ba2ab42c1', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-08T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (19, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', 'c75cde0a-a6f9-59c0-811e-b41da89d1796', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-10-08T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (20, '9e156b1b-7370-5e67-9dd3-e03340156757', 'cuti_update', 'pengajuan_cuti', '1b5bacea-7556-5786-ae50-aaa9e4690be2', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-09T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (21, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', '2bb7a540-2361-50e8-bdb2-228ba2ab42c1', '{"status": "disetujui_atasan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-10-09T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (22, '1533d79b-4814-5d40-a1db-0f4df56eae1e', 'cuti_update', 'pengajuan_cuti', '5f32839c-acf9-53a6-8a21-142fdfac5892', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui_atasan"}'::jsonb, '2026-10-13T10:05:00+07:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (23, '391a65a7-cf37-5806-8e65-bba91e3c42e4', 'cuti_update', 'pengajuan_cuti', 'f699ab25-9048-5d5c-9015-31f2a3c56b1d', '{"status": "diajukan"}'::jsonb, '{"status": "disetujui"}'::jsonb, '2026-10-14T13:40:00+07:00')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence untuk audit_log agar insert baru melanjutkan nomor ID berikutnya
SELECT setval(pg_get_serial_sequence('public.audit_log', 'id'), COALESCE(MAX(id), 1), true) FROM public.audit_log;
