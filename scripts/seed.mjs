import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Baca file .env.local secara manual jika dotenv belum ada
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('File .env.local tidak ditemukan! Silakan buat .env.local terlebih dahulu.');
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local!');
  process.exit(1);
}

// Client dengan service_role untuk hak akses penuh (Admin API & bypass RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('--- MEMULAI SEEDING DATA DARI Data_Contoh_HRIS.xlsx ---');
  const filePath = path.resolve(process.cwd(), 'Data_Contoh_HRIS.xlsx');
  const wb = xlsx.readFile(filePath);

  // 1. Sheet Akun Uji -> Buat user di Supabase Auth
  console.log('\n[1/8] Mendaftarkan akun di Supabase Auth...');
  const akunUji = xlsx.utils.sheet_to_json(wb.Sheets['Akun Uji']);
  const emailToUserId = new Map();

  for (const akun of akunUji) {
    const email = akun.email.trim().toLowerCase();
    const password = akun.kata_sandi || 'Latihan#2026';

    // Cek apakah user sudah ada
    const { data: listUsers } = await supabase.auth.admin.listUsers();
    const existing = listUsers?.users?.find(u => u.email?.toLowerCase() === email);

    let userId = existing?.id;
    if (!userId) {
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { nama: akun.nama, peran: akun.peran }
      });
      if (error) {
        console.error(`Gagal membuat akun ${email}:`, error.message);
        continue;
      }
      userId = newUser.user.id;
      console.log(`+ Akun dibuat: ${email} (${userId})`);
    } else {
      console.log(`= Akun sudah ada: ${email} (${userId})`);
    }
    emailToUserId.set(email, userId);
  }

  // 2. Sheet divisi -> Masukkan divisi
  console.log('\n[2/8] Mengimpor data Divisi...');
  const divisiData = xlsx.utils.sheet_to_json(wb.Sheets['divisi']);
  for (const d of divisiData) {
    const { error } = await supabase.from('divisi').upsert({
      id: d.id,
      nama: d.nama,
      manajer_id: null // diisi setelah profiles ada
    }, { onConflict: 'id' });
    if (error) console.error(`Error divisi ${d.nama}:`, error.message);
  }
  console.log(`✓ Divisi berhasil diimpor: ${divisiData.length} baris.`);

  // 3. Sheet profiles -> Masukkan profil karyawan dengan ID = auth.users.id
  console.log('\n[3/8] Mengimpor data Profiles...');
  const profilesData = xlsx.utils.sheet_to_json(wb.Sheets['profiles']);
  const oldIdToNewId = new Map();

  for (const p of profilesData) {
    const email = p.email.trim().toLowerCase();
    const newUserId = emailToUserId.get(email);
    if (!newUserId) {
      console.warn(`Peringatan: tidak ada user auth untuk email ${email}`);
      continue;
    }
    oldIdToNewId.set(String(p.id), newUserId);

    const { error } = await supabase.from('profiles').upsert({
      id: newUserId,
      nik_karyawan: p.nik_karyawan,
      nama_lengkap: p.nama_lengkap,
      email: p.email,
      nomor_hp: p.nomor_hp ? String(p.nomor_hp) : null,
      peran: p.peran,
      divisi_id: p.divisi_id || null,
      jabatan: p.jabatan,
      status_kerja: p.status_kerja,
      tanggal_masuk: typeof p.tanggal_masuk === 'number' 
        ? new Date(Math.round((p.tanggal_masuk - 25569) * 86400 * 1000)).toISOString().split('T')[0]
        : p.tanggal_masuk,
      aktif: p.aktif === true || p.aktif === 'true' || p.aktif === 1
    }, { onConflict: 'id' });

    if (error) console.error(`Error profile ${p.nama_lengkap}:`, error.message);
  }
  console.log(`✓ Profiles berhasil diimpor: ${profilesData.length} baris.`);

  // Hubungkan kembali manajer_id pada divisi
  console.log('\n[4/8] Mengupdate manajer_id di Divisi...');
  for (const d of divisiData) {
    if (d.manajer_id) {
      const newManagerId = oldIdToNewId.get(String(d.manajer_id));
      if (newManagerId) {
        await supabase.from('divisi').update({ manajer_id: newManagerId }).eq('id', d.id);
      }
    }
  }

  // 5. Sheet hari_libur
  console.log('\n[5/8] Mengimpor Hari Libur...');
  const hariLiburData = xlsx.utils.sheet_to_json(wb.Sheets['hari_libur']);
  for (const hl of hariLiburData) {
    let tgl = hl.tanggal;
    if (typeof tgl === 'number') {
      tgl = new Date(Math.round((tgl - 25569) * 86400 * 1000)).toISOString().split('T')[0];
    }
    await supabase.from('hari_libur').upsert({
      tanggal: tgl,
      keterangan: hl.keterangan,
      jenis: hl.jenis
    }, { onConflict: 'tanggal' });
  }
  console.log(`✓ Hari Libur berhasil diimpor: ${hariLiburData.length} baris.`);

  // 6. Sheet kuota_cuti
  console.log('\n[6/8] Mengimpor Kuota Cuti...');
  const kuotaData = xlsx.utils.sheet_to_json(wb.Sheets['kuota_cuti']);
  for (const k of kuotaData) {
    const newKaryawanId = oldIdToNewId.get(String(k.karyawan_id));
    if (!newKaryawanId) continue;
    await supabase.from('kuota_cuti').upsert({
      id: k.id,
      karyawan_id: newKaryawanId,
      tahun: Number(k.tahun),
      jatah_hari: Number(k.jatah_hari),
      terpakai_hari: Number(k.terpakai_hari)
    }, { onConflict: 'id' });
  }
  console.log(`✓ Kuota Cuti berhasil diimpor: ${kuotaData.length} baris.`);

  // 7. Sheet pengajuan_cuti
  console.log('\n[7/8] Mengimpor Pengajuan Cuti...');
  const pengajuanData = xlsx.utils.sheet_to_json(wb.Sheets['pengajuan_cuti']);
  for (const pc of pengajuanData) {
    const newKaryawanId = oldIdToNewId.get(String(pc.karyawan_id));
    if (!newKaryawanId) continue;

    const parseDate = (d) => {
      if (!d) return null;
      if (typeof d === 'number') return new Date(Math.round((d - 25569) * 86400 * 1000)).toISOString().split('T')[0];
      return d;
    };

    const parseTimestamp = (t) => {
      if (!t) return null;
      if (typeof t === 'number') return new Date(Math.round((t - 25569) * 86400 * 1000)).toISOString();
      return t;
    };

    await supabase.from('pengajuan_cuti').upsert({
      id: pc.id,
      karyawan_id: newKaryawanId,
      jenis: pc.jenis,
      tanggal_mulai: parseDate(pc.tanggal_mulai),
      tanggal_selesai: parseDate(pc.tanggal_selesai),
      jumlah_hari: Number(pc.jumlah_hari),
      alasan: pc.alasan,
      lampiran_path: pc.lampiran_path || null,
      status: pc.status,
      perlu_atasan: pc.perlu_atasan === true || pc.perlu_atasan === 'true' || pc.perlu_atasan === 1,
      disetujui_atasan_oleh: pc.disetujui_atasan_oleh ? oldIdToNewId.get(String(pc.disetujui_atasan_oleh)) : null,
      disetujui_atasan_pada: parseTimestamp(pc.disetujui_atasan_pada),
      diputuskan_hrd_oleh: pc.diputuskan_hrd_oleh ? oldIdToNewId.get(String(pc.diputuskan_hrd_oleh)) : null,
      diputuskan_hrd_pada: parseTimestamp(pc.diputuskan_hrd_pada),
      alasan_penolakan: pc.alasan_penolakan || null,
      dibatalkan_oleh: pc.dibatalkan_oleh ? oldIdToNewId.get(String(pc.dibatalkan_oleh)) : null,
      dibatalkan_pada: parseTimestamp(pc.dibatalkan_pada),
      dibuat_pada: parseTimestamp(pc.dibuat_pada) || new Date().toISOString()
    }, { onConflict: 'id' });
  }
  console.log(`✓ Pengajuan Cuti berhasil diimpor: ${pengajuanData.length} baris.`);

  // 8. Sheet absensi
  console.log('\n[8/8] Mengimpor Absensi...');
  const absensiData = xlsx.utils.sheet_to_json(wb.Sheets['absensi']);
  const batchSize = 50;
  for (let i = 0; i < absensiData.length; i += batchSize) {
    const chunk = absensiData.slice(i, i + batchSize).map(a => {
      const parseDate = (d) => {
        if (!d) return null;
        if (typeof d === 'number') return new Date(Math.round((d - 25569) * 86400 * 1000)).toISOString().split('T')[0];
        return d;
      };
      const parseTimestamp = (t) => {
        if (!t) return null;
        if (typeof t === 'number') return new Date(Math.round((t - 25569) * 86400 * 1000)).toISOString();
        return t;
      };

      return {
        id: a.id,
        karyawan_id: oldIdToNewId.get(String(a.karyawan_id)),
        tanggal: parseDate(a.tanggal),
        jam_masuk: parseTimestamp(a.jam_masuk),
        jam_pulang: parseTimestamp(a.jam_pulang),
        status: a.status,
        dikoreksi_oleh: a.dikoreksi_oleh ? oldIdToNewId.get(String(a.dikoreksi_oleh)) : null,
        alasan_koreksi: a.alasan_koreksi || null
      };
    }).filter(a => a.karyawan_id);

    const { error } = await supabase.from('absensi').upsert(chunk, { onConflict: 'id' });
    if (error) console.error('Error insert absensi batch:', error.message);
  }
  console.log(`✓ Absensi berhasil diimpor: ${absensiData.length} baris.`);

  // 9. Sheet slip_gaji
  console.log('\n[+] Mengimpor Slip Gaji...');
  const slipData = xlsx.utils.sheet_to_json(wb.Sheets['slip_gaji']);
  for (const s of slipData) {
    const parseDate = (d) => {
      if (!d) return null;
      if (typeof d === 'number') return new Date(Math.round((d - 25569) * 86400 * 1000)).toISOString().split('T')[0];
      return d;
    };
    const parseTimestamp = (t) => {
      if (!t) return null;
      if (typeof t === 'number') return new Date(Math.round((t - 25569) * 86400 * 1000)).toISOString();
      return t;
    };

    const newKaryawanId = oldIdToNewId.get(String(s.karyawan_id));
    if (!newKaryawanId) continue;

    await supabase.from('slip_gaji').upsert({
      id: s.id,
      nomor_slip: s.nomor_slip || null,
      karyawan_id: newKaryawanId,
      periode: parseDate(s.periode),
      gaji_pokok: Number(s.gaji_pokok),
      tunjangan: Number(s.tunjangan || 0),
      potongan: Number(s.potongan || 0),
      total_diterima: Number(s.total_diterima),
      catatan: s.catatan || null,
      status: s.status,
      dibuat_oleh: s.dibuat_oleh ? oldIdToNewId.get(String(s.dibuat_oleh)) : newKaryawanId,
      diterbitkan_oleh: s.diterbitkan_oleh ? oldIdToNewId.get(String(s.diterbitkan_oleh)) : null,
      diterbitkan_pada: parseTimestamp(s.diterbitkan_pada),
      dibuat_pada: parseTimestamp(s.dibuat_pada) || new Date().toISOString()
    }, { onConflict: 'id' });
  }
  console.log(`✓ Slip Gaji berhasil diimpor: ${slipData.length} baris.`);

  console.log('\n=============================================');
  console.log('🎉 SEEDING SELESAI DENGAN SUKSES!');
  console.log('Semua 16 akun auth & data contoh telah terisi di Supabase.');
  console.log('=============================================');
}

main().catch(err => {
  console.error('Fatal error during seed:', err);
  process.exit(1);
});
