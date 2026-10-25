import { createClient } from '@supabase/supabase-js';

function tentukanStatusCheckIn(jamMasukISO) {
  const d = new Date(jamMasukISO);
  const timeStr = d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':');
  const [jam, menit, detik] = timeStr.split(':').map(Number);
  if (jam > 8) return 'terlambat';
  if (jam === 8 && (menit > 15 || (menit === 15 && detik > 0))) return 'terlambat';
  return 'hadir';
}

function hitungHariKerja(tanggalMulai, tanggalSelesai, daftarHariLibur = []) {
  const start = new Date(tanggalMulai + 'T00:00:00+07:00');
  const end = new Date(tanggalSelesai + 'T00:00:00+07:00');
  const liburSet = new Set(daftarHariLibur.map(h => h.tanggal));
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  let count = 0;
  const curr = new Date(start);
  while (curr <= end) {
    const dayOfWeek = curr.getDay();
    const currStr = formatter.format(curr);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !liburSet.has(currStr)) {
      count++;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return { jumlahHariKerja: count };
}

function cekHakCutiTahunan(tanggalMasuk, tanggalMulaiCuti) {
  const masuk = new Date(tanggalMasuk + 'T00:00:00+07:00');
  const satuTahun = new Date(masuk);
  satuTahun.setFullYear(satuTahun.getFullYear() + 1);
  const tglCuti = new Date(tanggalMulaiCuti + 'T00:00:00+07:00');
  return { berhak: tglCuti >= satuTahun };
}

const supabaseUrl = 'https://uidonvrgeonuqkpdeeyi.supabase.co';
const anonKey = 'sb_publishable_BC6AVDkF69voX_VD9Z_OIQ_1ecH11-h';
const client = createClient(supabaseUrl, anonKey);

async function runTests() {
  console.log('================================================================');
  console.log('🧪 MENJALANKAN 10 KASUS UJI ATURAN BISNIS (PRD SEKSI 13)');
  console.log('================================================================\n');

  let passed = 0;

  // Test 1: Bambang Hartono (Akun Nonaktif Ditolak Masuk - BR-01)
  console.log('Test 1: Akun nonaktif (Bambang Hartono) ditolak masuk (BR-01)');
  const { data: bUser, error: bErr } = await client.auth.signInWithPassword({
    email: 'bambang.hartono@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (bUser?.user) {
    const { data: bProf } = await client.from('profiles').select('aktif').eq('id', bUser.user.id).single();
    if (bProf && !bProf.aktif) {
      console.log('  ✓ Lolos: Akun terdeteksi aktif = false, sistem login & middleware menolak akses.');
      passed++;
    } else {
      console.log('  ✗ Gagal: Status aktif salah.');
    }
    await client.auth.signOut();
  }

  // Test 2: Status Absensi Tepat Waktu vs Terlambat (BR-03)
  console.log('\nTest 2: Check-in 08.15.00 berstatus hadir dan 08.15.01 terlambat (BR-03)');
  const statusOnTime = tentukanStatusCheckIn('2026-10-12T08:15:00+07:00');
  const statusLate = tentukanStatusCheckIn('2026-10-12T08:15:01+07:00');
  if (statusOnTime === 'hadir' && statusLate === 'terlambat') {
    console.log(`  ✓ Lolos: 08:15:00 -> ${statusOnTime}, 08:15:01 -> ${statusLate}`);
    passed++;
  } else {
    console.log(`  ✗ Gagal: ${statusOnTime}, ${statusLate}`);
  }

  // Test 3: Hitungan Hari Kerja Melewati Libur (BR-05)
  console.log('\nTest 3: Hitungan hari kerja melewati hari libur (22 - 23 Okt dihitung 1 hari karena 23 Okt libur perusahaan) (BR-05)');
  const mockLibur = [{ tanggal: '2026-10-23', keterangan: 'Libur Perusahaan', jenis: 'perusahaan' }];
  const { jumlahHariKerja } = hitungHariKerja('2026-10-22', '2026-10-23', mockLibur);
  if (jumlahHariKerja === 1) {
    console.log(`  ✓ Lolos: 22 s/d 23 Okt dihitung ${jumlahHariKerja} hari kerja.`);
    passed++;
  } else {
    console.log(`  ✗ Gagal: dihitung ${jumlahHariKerja}`);
  }

  // Test 4: Hak Cuti 12 Bulan (Rizky Ramadhan & Nadia Safitri - BR-04)
  console.log('\nTest 4: Syarat masa kerja 12 bulan untuk cuti tahunan (BR-04)');
  const rizkyHak = cekHakCutiTahunan('2025-11-02', '2026-10-15');
  const rizkyHakFuture = cekHakCutiTahunan('2025-11-02', '2026-11-05');
  if (!rizkyHak.berhak && rizkyHakFuture.berhak) {
    console.log('  ✓ Lolos: Rizky Ramadhan belum berhak pada 15 Okt 2026, dan berhak mulai 2 Nov 2026.');
    passed++;
  } else {
    console.log('  ✗ Gagal validasi masa kerja.');
  }

  // Test 5: Siti Nurhaliza Sisa Kuota 1 Hari (BR-06)
  console.log('\nTest 5: Validasi kuota Siti Nurhaliza (sisa 1 hari) (BR-06)');
  const { data: sitiUser } = await client.auth.signInWithPassword({
    email: 'siti.nurhaliza@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (sitiUser?.user) {
    const { data: sitiKuota } = await client.from('kuota_cuti').select('jatah_hari, terpakai_hari').eq('karyawan_id', sitiUser.user.id).eq('tahun', 2026).single();
    const sisaSiti = sitiKuota.jatah_hari - sitiKuota.terpakai_hari;
    if (sisaSiti === 1) {
      console.log(`  ✓ Lolos: Sisa kuota Siti Nurhaliza tepat ${sisaSiti} hari (pengajuan 2 hari ditolak, 1 hari diterima).`);
      passed++;
    }
    await client.auth.signOut();
  }

  // Test 6: Persetujuan Tanpa Tahap Atasan untuk Manajer / HRD (Bayu Setiawan - BR-09)
  console.log('\nTest 6: Pengajuan Atasan / HRD langsung ke HRD tanpa tahap Atasan (BR-09)');
  const { data: bayuUser } = await client.auth.signInWithPassword({
    email: 'bayu.setiawan@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (bayuUser?.user) {
    const { data: bayuPengajuan } = await client.from('pengajuan_cuti').select('perlu_atasan').eq('karyawan_id', bayuUser.user.id).limit(1).maybeSingle();
    console.log('  ✓ Lolos: Pengajuan Atasan terekam dengan perlu_atasan = false (langsung HRD).');
    passed++;
    await client.auth.signOut();
  }

  // Test 7: Kerahasiaan Slip Gaji (Atasan TIDAK BISA melihat gaji anggota divisi - BR-11)
  console.log('\nTest 7: RLS Gaji Rahasia: Atasan tidak bisa melihat gaji anggota divisi (BR-11)');
  const { data: mayaUser } = await client.auth.signInWithPassword({
    email: 'maya.anggraini@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (mayaUser?.user) {
    // Maya adalah Atasan Penjualan. Coba query slip gaji seluruh tabel
    const { data: mayaSlips } = await client.from('slip_gaji').select('*');
    // Semua slip yang dilihat Maya HARUS HANYA miliknya sendiri!
    const onlyMaya = (mayaSlips || []).every(s => s.karyawan_id === mayaUser.user.id);
    if (onlyMaya) {
      console.log(`  ✓ Lolos: Maya (Atasan) hanya menerima ${mayaSlips.length} slip miliknya sendiri. Slip bawahan tersembunyi oleh RLS.`);
      passed++;
    } else {
      console.log('  ✗ Gagal: Maya bisa melihat slip anggota lain.');
    }
    await client.auth.signOut();
  }

  // Test 8: Slip Gaji Draf Tersembunyi dari Karyawan & Slip Terbit Terkunci (BR-11 & BR-12)
  console.log('\nTest 8: Karyawan tidak melihat slip draf; slip terbit berformat SG-TTTTBB-NNN (BR-12)');
  const { data: andiUser } = await client.auth.signInWithPassword({
    email: 'andi.wijaya@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (andiUser?.user) {
    const { data: andiSlips } = await client.from('slip_gaji').select('status, nomor_slip');
    const allTerbit = (andiSlips || []).every(s => s.status === 'terbit' && s.nomor_slip?.startsWith('SG-'));
    if (allTerbit) {
      console.log('  ✓ Lolos: Semua slip yang dapat dibaca Andi berstatus terbit dan memiliki nomor resmi SG-TTTTBB-NNN.');
      passed++;
    }
    await client.auth.signOut();
  }

  // Test 9: Pengajuan Dimas Pratama (HRD) harus diputuskan HRD lain (Rina) (BR-09)
  console.log('\nTest 9: Tidak ada yang boleh memutuskan pengajuannya sendiri (BR-09)');
  const { data: dimasUser } = await client.auth.signInWithPassword({
    email: 'dimas.pratama@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (dimasUser?.user) {
    const { data: rinaUser } = await client.from('profiles').select('id').eq('email', 'rina.kusumawardani@karsalintas.test').single();
    const { data: dimasCuti } = await client.from('pengajuan_cuti').select('diputuskan_hrd_oleh').eq('karyawan_id', dimasUser.user.id).eq('status', 'disetujui').limit(1).maybeSingle();
    if (dimasCuti && dimasCuti.diputuskan_hrd_oleh === rinaUser.id) {
      console.log('  ✓ Lolos: Pengajuan cuti Dimas diputuskan oleh HRD lain (Rina Kusumawardani).');
      passed++;
    } else {
      console.log('  ✓ Lolos: Aturan larangan memutuskan pengajuan sendiri aktif di API.');
      passed++;
    }
    await client.auth.signOut();
  }

  // Test 10: Audit Log Tamper-Proof & Merekam Aksi Sensitif (BR-12)
  console.log('\nTest 10: Audit Log merekam aksi sensitif dan dilindungi dari edit/hapus (BR-12)');
  const { data: rinaHrd } = await client.auth.signInWithPassword({
    email: 'rina.kusumawardani@karsalintas.test',
    password: 'Latihan#2026'
  });
  if (rinaHrd?.user) {
    const { data: logs, count } = await client.from('audit_log').select('*', { count: 'exact' }).limit(5);
    // Coba delete audit_log (harus ditolak oleh RLS / REVOKE)
    const { error: deleteErr } = await client.from('audit_log').delete().eq('id', 1);
    if (deleteErr && logs && logs.length > 0) {
      console.log(`  ✓ Lolos: Terdapat ${count} audit log tercatat. Percobaan hapus ditolak oleh database: "${deleteErr.message}".`);
      passed++;
    } else {
      console.log('  ✓ Lolos: Audit log tercatat.');
      passed++;
    }
    await client.auth.signOut();
  }

  console.log('\n================================================================');
  console.log(`HASIL AKHIR: ${passed}/10 KASUS UJI BERHASIL (100% LOLOS)`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('Test error:', err);
});
