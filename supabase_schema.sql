-- ==============================================================================
-- SKEMA DATABASE HRIS PT KARSA LINTAS NUSANTARA
-- Sesuai dengan ERD_HRIS.pdf dan PRD_HRIS.docx.md
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hapus tabel lama (beserta foreign key lama) agar tidak bentrok dengan tipe default 'int8' bawaan Supabase UI
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.slip_gaji CASCADE;
DROP TABLE IF EXISTS public.absensi CASCADE;
DROP TABLE IF EXISTS public.pengajuan_cuti CASCADE;
DROP TABLE IF EXISTS public.kuota_cuti CASCADE;
DROP TABLE IF EXISTS public.hari_libur CASCADE;
DROP TABLE IF EXISTS public.divisi CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TABEL: DIVISI
-- Dibuat terlebih dahulu (manajer_id menyusul karena saling referensi dengan profiles)
CREATE TABLE public.divisi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT UNIQUE NOT NULL,
    manajer_id UUID UNIQUE, -- FK ke profiles ditambahkan setelah tabel profiles dibuat
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL: PROFILES
-- Terhubung satu-satu dengan auth.users (id bertipe UUID)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nik_karyawan TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL CHECK (char_length(trim(nama_lengkap)) >= 3),
    email TEXT UNIQUE NOT NULL,
    nomor_hp TEXT,
    peran TEXT NOT NULL DEFAULT 'karyawan' CHECK (peran IN ('karyawan', 'atasan', 'hrd')),
    divisi_id UUID REFERENCES public.divisi(id) ON DELETE SET NULL,
    jabatan TEXT NOT NULL,
    status_kerja TEXT NOT NULL CHECK (status_kerja IN ('tetap', 'kontrak')),
    tanggal_masuk DATE NOT NULL,
    aktif BOOLEAN NOT NULL DEFAULT true,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hubungkan FK manajer_id pada tabel divisi ke profiles
ALTER TABLE public.divisi 
    DROP CONSTRAINT IF EXISTS fk_divisi_manajer,
    ADD CONSTRAINT fk_divisi_manajer FOREIGN KEY (manajer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. TABEL: HARI_LIBUR
CREATE TABLE public.hari_libur (
    tanggal DATE PRIMARY KEY,
    keterangan TEXT NOT NULL,
    jenis TEXT NOT NULL CHECK (jenis IN ('nasional', 'cuti_bersama', 'perusahaan'))
);

-- 5. TABEL: KUOTA_CUTI
CREATE TABLE public.kuota_cuti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karyawan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tahun INT NOT NULL,
    jatah_hari INT NOT NULL DEFAULT 12 CHECK (jatah_hari >= 0 AND jatah_hari <= 12),
    terpakai_hari INT NOT NULL DEFAULT 0 CHECK (terpakai_hari >= 0 AND terpakai_hari <= jatah_hari),
    CONSTRAINT uk_kuota_karyawan_tahun UNIQUE (karyawan_id, tahun)
);

-- 6. TABEL: PENGAJUAN_CUTI
CREATE TABLE public.pengajuan_cuti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karyawan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    jenis TEXT NOT NULL CHECK (jenis IN ('cuti_tahunan', 'sakit', 'izin')),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL CHECK (tanggal_selesai >= tanggal_mulai),
    jumlah_hari INT NOT NULL CHECK (jumlah_hari >= 1),
    alasan TEXT NOT NULL CHECK (char_length(trim(alasan)) >= 5),
    lampiran_path TEXT, -- Lokasi dokumen di Supabase Storage (wajib untuk sakit > 1 hari)
    status TEXT NOT NULL DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'disetujui_atasan', 'disetujui', 'ditolak', 'dibatalkan')),
    perlu_atasan BOOLEAN NOT NULL DEFAULT true,
    disetujui_atasan_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    disetujui_atasan_pada TIMESTAMPTZ,
    diputuskan_hrd_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    diputuskan_hrd_pada TIMESTAMPTZ,
    alasan_penolakan TEXT, -- Wajib minimal 10 huruf bila status ditolak
    dibatalkan_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    dibatalkan_pada TIMESTAMPTZ,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_alasan_penolakan CHECK (
        status <> 'ditolak' OR (alasan_penolakan IS NOT NULL AND char_length(trim(alasan_penolakan)) >= 10)
    )
);

-- 7. TABEL: ABSENSI
CREATE TABLE public.absensi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    karyawan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    jam_masuk TIMESTAMPTZ NOT NULL,
    jam_pulang TIMESTAMPTZ CHECK (jam_pulang IS NULL OR jam_pulang >= jam_masuk),
    status TEXT NOT NULL CHECK (status IN ('hadir', 'terlambat')),
    dikoreksi_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    alasan_koreksi TEXT,
    CONSTRAINT uk_absensi_karyawan_tanggal UNIQUE (karyawan_id, tanggal),
    CONSTRAINT ck_alasan_koreksi CHECK (
        dikoreksi_oleh IS NULL OR (alasan_koreksi IS NOT NULL AND char_length(trim(alasan_koreksi)) >= 10)
    )
);

-- 8. TABEL: SLIP_GAJI
CREATE TABLE public.slip_gaji (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_slip TEXT UNIQUE, -- format SG-TTTTBB-NNN saat diterbitkan
    karyawan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    periode DATE NOT NULL, -- tanggal 1 bulan bersangkutan
    gaji_pokok NUMERIC(12,0) NOT NULL CHECK (gaji_pokok >= 0),
    tunjangan NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (tunjangan >= 0),
    potongan NUMERIC(12,0) NOT NULL DEFAULT 0 CHECK (potongan >= 0),
    total_diterima NUMERIC(12,0) NOT NULL CHECK (total_diterima >= 0),
    catatan TEXT,
    status TEXT NOT NULL DEFAULT 'draf' CHECK (status IN ('draf', 'terbit')),
    dibuat_oleh UUID NOT NULL REFERENCES public.profiles(id),
    diterbitkan_oleh UUID REFERENCES public.profiles(id),
    diterbitkan_pada TIMESTAMPTZ,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_slip_karyawan_periode UNIQUE (karyawan_id, periode),
    CONSTRAINT ck_total_diterima CHECK (total_diterima = (gaji_pokok + tunjangan - potongan))
);

-- 9. TABEL: AUDIT_LOG
CREATE TABLE public.audit_log (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    pelaku_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    aksi TEXT NOT NULL,
    nama_tabel TEXT NOT NULL,
    data_id TEXT NOT NULL,
    nilai_sebelum JSONB,
    nilai_sesudah JSONB,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- FUNGSI & TRIGGER: AUDIT LOG & NOMOR SLIP GAJI
-- ==============================================================================

-- Fungsi helper untuk mendapatkan peran pengguna saat ini
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT peran FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Fungsi helper untuk generate nomor slip gaji otomatis berurutan (SG-TTTTBB-NNN)
CREATE OR REPLACE FUNCTION public.generate_nomor_slip(p_periode DATE)
RETURNS TEXT AS $$
DECLARE
    v_prefix TEXT;
    v_count INT;
    v_nomor TEXT;
BEGIN
    -- Format: SG-YYYYMM-
    v_prefix := 'SG-' || to_char(p_periode, 'YYYYMM') || '-';
    
    -- Hitung slip yang sudah terbit pada periode yang sama
    SELECT COUNT(*) INTO v_count
    FROM public.slip_gaji
    WHERE periode = p_periode AND nomor_slip IS NOT NULL;
    
    v_nomor := v_prefix || lpad((v_count + 1)::TEXT, 3, '0');
    RETURN v_nomor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Mencegah update atau delete slip yang sudah berstatus 'terbit' (BR-12)
CREATE OR REPLACE FUNCTION public.check_slip_gaji_lock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'terbit' THEN
            RAISE EXCEPTION 'Slip gaji yang sudah terbit tidak dapat diubah (BR-12).';
        END IF;
        -- Jika status berubah dari draf ke terbit dan nomor_slip belum ada, buat otomatis
        IF NEW.status = 'terbit' AND OLD.status = 'draf' AND NEW.nomor_slip IS NULL THEN
            NEW.nomor_slip := public.generate_nomor_slip(NEW.periode);
            NEW.diterbitkan_pada := now();
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'terbit' THEN
            RAISE EXCEPTION 'Slip gaji yang sudah terbit tidak dapat dihapus (BR-12).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_slip_gaji_lock ON public.slip_gaji;
CREATE TRIGGER trg_slip_gaji_lock
    BEFORE UPDATE OR DELETE ON public.slip_gaji
    FOR EACH ROW
    EXECUTE FUNCTION public.check_slip_gaji_lock();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hari_libur ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_cuti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengajuan_cuti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slip_gaji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: PROFILES
-- Semua user terautentikasi bisa membaca profiles rekan kerja (nama, divisi, peran, dll)
-- Hanya HRD yang dapat INSERT, UPDATE, DELETE (BR-01)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "profiles_insert_hrd" ON public.profiles;
CREATE POLICY "profiles_insert_hrd" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (public.current_user_role() = 'hrd');

DROP POLICY IF EXISTS "profiles_update_hrd" ON public.profiles;
CREATE POLICY "profiles_update_hrd" ON public.profiles
    FOR UPDATE TO authenticated
    USING (public.current_user_role() = 'hrd' OR id = auth.uid())
    WITH CHECK (
        -- HRD tidak boleh mengubah peran atau menonaktifkan dirinya sendiri (BR-01)
        CASE 
            WHEN id = auth.uid() AND public.current_user_role() = 'hrd' THEN
                peran = 'hrd' AND aktif = true
            WHEN public.current_user_role() = 'hrd' THEN
                true
            ELSE
                false
        END
    );

-- ------------------------------------------------------------------------------
-- RLS: DIVISI & HARI_LIBUR
-- Dibaca oleh semua user login, dikelola hanya oleh HRD
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "divisi_read_all" ON public.divisi;
CREATE POLICY "divisi_read_all" ON public.divisi FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "divisi_manage_hrd" ON public.divisi;
CREATE POLICY "divisi_manage_hrd" ON public.divisi FOR ALL TO authenticated
    USING (public.current_user_role() = 'hrd')
    WITH CHECK (public.current_user_role() = 'hrd');

DROP POLICY IF EXISTS "hari_libur_read_all" ON public.hari_libur;
CREATE POLICY "hari_libur_read_all" ON public.hari_libur FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "hari_libur_manage_hrd" ON public.hari_libur;
CREATE POLICY "hari_libur_manage_hrd" ON public.hari_libur FOR ALL TO authenticated
    USING (public.current_user_role() = 'hrd')
    WITH CHECK (public.current_user_role() = 'hrd');

-- ------------------------------------------------------------------------------
-- RLS: KUOTA_CUTI
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "kuota_cuti_select" ON public.kuota_cuti;
CREATE POLICY "kuota_cuti_select" ON public.kuota_cuti FOR SELECT TO authenticated
    USING (
        karyawan_id = auth.uid() 
        OR public.current_user_role() = 'hrd'
        OR (public.current_user_role() = 'atasan' AND EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = kuota_cuti.karyawan_id AND p.divisi_id = (SELECT divisi_id FROM public.profiles WHERE id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "kuota_cuti_hrd" ON public.kuota_cuti;
CREATE POLICY "kuota_cuti_hrd" ON public.kuota_cuti FOR ALL TO authenticated
    USING (public.current_user_role() = 'hrd')
    WITH CHECK (public.current_user_role() = 'hrd');

-- ------------------------------------------------------------------------------
-- RLS: PENGAJUAN_CUTI
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "pengajuan_cuti_select" ON public.pengajuan_cuti;
CREATE POLICY "pengajuan_cuti_select" ON public.pengajuan_cuti FOR SELECT TO authenticated
    USING (
        karyawan_id = auth.uid()
        OR public.current_user_role() = 'hrd'
        OR (public.current_user_role() = 'atasan' AND EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = pengajuan_cuti.karyawan_id AND p.divisi_id = (SELECT divisi_id FROM public.profiles WHERE id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "pengajuan_cuti_insert" ON public.pengajuan_cuti;
CREATE POLICY "pengajuan_cuti_insert" ON public.pengajuan_cuti FOR INSERT TO authenticated
    WITH CHECK (karyawan_id = auth.uid());

DROP POLICY IF EXISTS "pengajuan_cuti_update" ON public.pengajuan_cuti;
CREATE POLICY "pengajuan_cuti_update" ON public.pengajuan_cuti FOR UPDATE TO authenticated
    USING (
        karyawan_id = auth.uid() 
        OR public.current_user_role() IN ('atasan', 'hrd')
    );

-- ------------------------------------------------------------------------------
-- RLS: ABSENSI
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "absensi_select" ON public.absensi;
CREATE POLICY "absensi_select" ON public.absensi FOR SELECT TO authenticated
    USING (
        karyawan_id = auth.uid()
        OR public.current_user_role() = 'hrd'
        OR (public.current_user_role() = 'atasan' AND EXISTS (
            SELECT 1 FROM public.profiles p WHERE p.id = absensi.karyawan_id AND p.divisi_id = (SELECT divisi_id FROM public.profiles WHERE id = auth.uid())
        ))
    );

DROP POLICY IF EXISTS "absensi_insert_self" ON public.absensi;
CREATE POLICY "absensi_insert_self" ON public.absensi FOR INSERT TO authenticated
    WITH CHECK (karyawan_id = auth.uid());

DROP POLICY IF EXISTS "absensi_update" ON public.absensi;
CREATE POLICY "absensi_update" ON public.absensi FOR UPDATE TO authenticated
    USING (
        (karyawan_id = auth.uid() AND jam_pulang IS NULL) -- Karyawan hanya bisa check-out
        OR public.current_user_role() = 'hrd' -- HRD bisa koreksi
    );

-- ------------------------------------------------------------------------------
-- RLS: SLIP_GAJI (BR-11: Data Rahasia! Atasan TIDAK BISA melihat)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "slip_gaji_select" ON public.slip_gaji;
CREATE POLICY "slip_gaji_select" ON public.slip_gaji FOR SELECT TO authenticated
    USING (
        (karyawan_id = auth.uid() AND status = 'terbit') -- Karyawan hanya melihat miliknya dan sudah terbit
        OR public.current_user_role() = 'hrd' -- HRD bisa melihat semua
    );

DROP POLICY IF EXISTS "slip_gaji_manage_hrd" ON public.slip_gaji;
CREATE POLICY "slip_gaji_manage_hrd" ON public.slip_gaji FOR ALL TO authenticated
    USING (public.current_user_role() = 'hrd')
    WITH CHECK (public.current_user_role() = 'hrd');

-- ------------------------------------------------------------------------------
-- RLS: AUDIT_LOG (BR-12: Tidak bisa diubah atau dihapus oleh siapapun)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_log_select_hrd" ON public.audit_log;
CREATE POLICY "audit_log_select_hrd" ON public.audit_log FOR SELECT TO authenticated
    USING (public.current_user_role() = 'hrd');

DROP POLICY IF EXISTS "audit_log_insert" ON public.audit_log;
CREATE POLICY "audit_log_insert" ON public.audit_log FOR INSERT TO authenticated
    WITH CHECK (true);

-- Larang keras UPDATE dan DELETE pada audit_log
REVOKE UPDATE, DELETE ON public.audit_log FROM authenticated, anon;

-- ------------------------------------------------------------------------------
-- STORAGE BUCKET: SURAT DOKTER
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('surat-dokter', 'surat-dokter', false)
ON CONFLICT (id) DO NOTHING;
