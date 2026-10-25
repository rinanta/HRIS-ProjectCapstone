import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const filePath = path.resolve(process.cwd(), 'Data_Contoh_HRIS.xlsx');
const wb = xlsx.readFile(filePath);

function escapeSql(str) {
  if (str === null || str === undefined || String(str).trim() === '') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function parseDate(d) {
  if (!d || String(d).trim() === '') return 'NULL';
  if (typeof d === 'number') {
    const date = new Date(Math.round((d - 25569) * 86400 * 1000));
    return `'${date.toISOString().split('T')[0]}'`;
  }
  return `'${d}'`;
}

function parseTimestamp(t) {
  if (!t || String(t).trim() === '') return 'NULL';
  if (typeof t === 'number') {
    const date = new Date(Math.round((t - 25569) * 86400 * 1000));
    return `'${date.toISOString()}'`;
  }
  return `'${t}'`;
}

let sql = `-- ==============================================================================
-- SEED DATA UNTUK HRIS PT KARSA LINTAS NUSANTARA
-- Dibuat otomatis dari Data_Contoh_HRIS.xlsx
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Bersihkan data tabel aplikasi sebelumnya agar fresh dan tidak ada duplicate key
TRUNCATE TABLE public.audit_log, public.slip_gaji, public.absensi, public.pengajuan_cuti, public.kuota_cuti, public.hari_libur, public.divisi, public.profiles CASCADE;

-- 1. DAFTAR AKUN AUTH.USERS & AUTH.IDENTITIES (16 Karyawan)
-- Password untuk semua akun: Latihan#2026
`;

// Sheet Akun Uji & profiles
const akunUji = xlsx.utils.sheet_to_json(wb.Sheets['Akun Uji']);
const profiles = xlsx.utils.sheet_to_json(wb.Sheets['profiles']);

// Map email to profile id (UUID from profiles sheet)
const emailToProfile = new Map();
profiles.forEach(p => {
  emailToProfile.set(p.email.trim().toLowerCase(), p);
});

akunUji.forEach(a => {
  const email = a.email.trim().toLowerCase();
  const prof = emailToProfile.get(email);
  const userId = prof ? prof.id : null;
  if (!userId) return;

  sql += `
-- Akun: ${prof.nama_lengkap} (${email})
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '${userId}',
    'authenticated',
    'authenticated',
    '${email}',
    crypt('Latihan#2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nama', '${prof.nama_lengkap.replace(/'/g, "''")}', 'peran', '${prof.peran}'),
    now(), now(), '', '', '', ''
) ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('Latihan#2026', gen_salt('bf')),
    email_confirmed_at = now();

INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
    '${userId}',
    '${userId}',
    jsonb_build_object('sub', '${userId}', 'email', '${email}'),
    'email',
    '${email}',
    now(), now(), now()
) ON CONFLICT (provider, provider_id) DO NOTHING;
`;
});

// 2. DIVISI
sql += `\n-- 2. DIVISI\n`;
const divisiData = xlsx.utils.sheet_to_json(wb.Sheets['divisi']);
divisiData.forEach(d => {
  sql += `INSERT INTO public.divisi (id, nama, manajer_id) VALUES ('${d.id}', ${escapeSql(d.nama)}, NULL) ON CONFLICT (id) DO NOTHING;\n`;
});

// 3. PROFILES
sql += `\n-- 3. PROFILES\n`;
profiles.forEach(p => {
  const tglMasuk = parseDate(p.tanggal_masuk);
  const aktif = (p.aktif === true || p.aktif === 'true' || p.aktif === 1) ? 'true' : 'false';
  sql += `INSERT INTO public.profiles (id, nik_karyawan, nama_lengkap, email, nomor_hp, peran, divisi_id, jabatan, status_kerja, tanggal_masuk, aktif)
VALUES ('${p.id}', ${escapeSql(p.nik_karyawan)}, ${escapeSql(p.nama_lengkap)}, ${escapeSql(p.email)}, ${escapeSql(p.nomor_hp)}, '${p.peran}', ${p.divisi_id ? `'${p.divisi_id}'` : 'NULL'}, ${escapeSql(p.jabatan)}, '${p.status_kerja}', ${tglMasuk}, ${aktif})
ON CONFLICT (id) DO UPDATE SET aktif = ${aktif}, jabatan = ${escapeSql(p.jabatan)}, peran = '${p.peran}';\n`;
});

// Update manajer_id di divisi
sql += `\n-- UPDATE MANAJER DIVISI\n`;
divisiData.forEach(d => {
  if (d.manajer_id) {
    sql += `UPDATE public.divisi SET manajer_id = '${d.manajer_id}' WHERE id = '${d.id}';\n`;
  }
});

// 4. HARI LIBUR
sql += `\n-- 4. HARI LIBUR\n`;
const hariLibur = xlsx.utils.sheet_to_json(wb.Sheets['hari_libur']);
hariLibur.forEach(h => {
  sql += `INSERT INTO public.hari_libur (tanggal, keterangan, jenis) VALUES (${parseDate(h.tanggal)}, ${escapeSql(h.keterangan)}, '${h.jenis}') ON CONFLICT (tanggal) DO NOTHING;\n`;
});

// 5. KUOTA CUTI
sql += `\n-- 5. KUOTA CUTI\n`;
const kuotaCuti = xlsx.utils.sheet_to_json(wb.Sheets['kuota_cuti']);
kuotaCuti.forEach(k => {
  sql += `INSERT INTO public.kuota_cuti (id, karyawan_id, tahun, jatah_hari, terpakai_hari) VALUES ('${k.id}', '${k.karyawan_id}', ${k.tahun}, ${k.jatah_hari}, ${k.terpakai_hari}) ON CONFLICT (id) DO NOTHING;\n`;
});

// 6. PENGAJUAN CUTI
sql += `\n-- 6. PENGAJUAN CUTI\n`;
const pengajuan = xlsx.utils.sheet_to_json(wb.Sheets['pengajuan_cuti']);
pengajuan.forEach(pc => {
  const perluAtasan = (pc.perlu_atasan === true || pc.perlu_atasan === 'true' || pc.perlu_atasan === 1) ? 'true' : 'false';
  sql += `INSERT INTO public.pengajuan_cuti (
    id, karyawan_id, jenis, tanggal_mulai, tanggal_selesai, jumlah_hari, alasan, lampiran_path, status,
    perlu_atasan, disetujui_atasan_oleh, disetujui_atasan_pada, diputuskan_hrd_oleh, diputuskan_hrd_pada,
    alasan_penolakan, dibatalkan_oleh, dibatalkan_pada, dibuat_pada
) VALUES (
    '${pc.id}', '${pc.karyawan_id}', '${pc.jenis}', ${parseDate(pc.tanggal_mulai)}, ${parseDate(pc.tanggal_selesai)},
    ${pc.jumlah_hari}, ${escapeSql(pc.alasan)}, ${escapeSql(pc.lampiran_path)}, '${pc.status}',
    ${perluAtasan}, ${pc.disetujui_atasan_oleh ? `'${pc.disetujui_atasan_oleh}'` : 'NULL'}, ${parseTimestamp(pc.disetujui_atasan_pada)},
    ${pc.diputuskan_hrd_oleh ? `'${pc.diputuskan_hrd_oleh}'` : 'NULL'}, ${parseTimestamp(pc.diputuskan_hrd_pada)},
    ${escapeSql(pc.alasan_penolakan)}, ${pc.dibatalkan_oleh ? `'${pc.dibatalkan_oleh}'` : 'NULL'}, ${parseTimestamp(pc.dibatalkan_pada)},
    ${parseTimestamp(pc.dibuat_pada)}
) ON CONFLICT (id) DO NOTHING;\n`;
});

// 7. ABSENSI
sql += `\n-- 7. ABSENSI\n`;
const absensi = xlsx.utils.sheet_to_json(wb.Sheets['absensi']);
absensi.forEach(a => {
  sql += `INSERT INTO public.absensi (
    id, karyawan_id, tanggal, jam_masuk, jam_pulang, status, dikoreksi_oleh, alasan_koreksi
) VALUES (
    '${a.id}', '${a.karyawan_id}', ${parseDate(a.tanggal)}, ${parseTimestamp(a.jam_masuk)}, ${parseTimestamp(a.jam_pulang)},
    '${a.status}', ${a.dikoreksi_oleh ? `'${a.dikoreksi_oleh}'` : 'NULL'}, ${escapeSql(a.alasan_koreksi)}
) ON CONFLICT (id) DO NOTHING;\n`;
});

// 8. SLIP GAJI
sql += `\n-- 8. SLIP GAJI\n`;
const slipGaji = xlsx.utils.sheet_to_json(wb.Sheets['slip_gaji']);
slipGaji.forEach(s => {
  sql += `INSERT INTO public.slip_gaji (
    id, nomor_slip, karyawan_id, periode, gaji_pokok, tunjangan, potongan, total_diterima, catatan, status,
    dibuat_oleh, diterbitkan_oleh, diterbitkan_pada, dibuat_pada
) VALUES (
    '${s.id}', ${escapeSql(s.nomor_slip)}, '${s.karyawan_id}', ${parseDate(s.periode)},
    ${s.gaji_pokok}, ${s.tunjangan || 0}, ${s.potongan || 0}, ${s.total_diterima}, ${escapeSql(s.catatan)}, '${s.status}',
    '${s.dibuat_oleh}', ${s.diterbitkan_oleh ? `'${s.diterbitkan_oleh}'` : 'NULL'}, ${parseTimestamp(s.diterbitkan_pada)}, ${parseTimestamp(s.dibuat_pada)}
) ON CONFLICT (id) DO NOTHING;\n`;
});

// 9. AUDIT LOG
sql += `\n-- 9. AUDIT LOG\n`;
const auditLog = xlsx.utils.sheet_to_json(wb.Sheets['audit_log']);
auditLog.forEach(al => {
  const sebelum = al.nilai_sebelum ? escapeSql(typeof al.nilai_sebelum === 'string' ? al.nilai_sebelum : JSON.stringify(al.nilai_sebelum)) + '::jsonb' : 'NULL';
  const sesudah = al.nilai_sesudah ? escapeSql(typeof al.nilai_sesudah === 'string' ? al.nilai_sesudah : JSON.stringify(al.nilai_sesudah)) + '::jsonb' : 'NULL';
  sql += `INSERT INTO public.audit_log (id, pelaku_id, aksi, nama_tabel, data_id, nilai_sebelum, nilai_sesudah, dibuat_pada) OVERRIDING SYSTEM VALUE
VALUES (${al.id}, ${al.pelaku_id ? `'${al.pelaku_id}'` : 'NULL'}, ${escapeSql(al.aksi)}, ${escapeSql(al.nama_tabel)}, ${escapeSql(al.data_id)}, ${sebelum}, ${sesudah}, ${parseTimestamp(al.dibuat_pada)})
ON CONFLICT (id) DO NOTHING;\n`;
});

sql += `\n-- Reset sequence untuk audit_log agar insert baru melanjutkan nomor ID berikutnya
SELECT setval(pg_get_serial_sequence('public.audit_log', 'id'), COALESCE(MAX(id), 1), true) FROM public.audit_log;\n`;

fs.writeFileSync(path.resolve(process.cwd(), 'seed_data.sql'), sql, 'utf-8');
console.log('File seed_data.sql berhasil dibuat dengan ukuran:', sql.length, 'karakter.');
