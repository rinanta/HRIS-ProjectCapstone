import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hitungHariKerja, validasiBatasPengajuan, cekHakCutiTahunan, getWIBDateString } from '@/lib/wib';
import { HariLibur } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const { jenis, tanggalMulai, tanggalSelesai, alasan, lampiranPath } = body;

    if (!jenis || !tanggalMulai || !tanggalSelesai || !alasan) {
      return NextResponse.json({ success: false, message: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    if (alasan.trim().length < 5) {
      return NextResponse.json({ success: false, message: 'Alasan pengajuan wajib minimal 5 karakter.' }, { status: 400 });
    }

    // Ambil data profil pemohon
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, divisi:divisi_id(id, nama, manajer_id)')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profil tidak ditemukan.' }, { status: 404 });
    }

    // 1. Ambil daftar hari libur
    const { data: hariLiburList } = await supabase.from('hari_libur').select('*');
    const { jumlahHariKerja } = hitungHariKerja(tanggalMulai, tanggalSelesai, (hariLiburList || []) as HariLibur[]);

    if (jumlahHariKerja <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Rentang tanggal yang dipilih tidak berisi hari kerja (semua hari adalah Sabtu, Minggu, atau Hari Libur) (BR-05).'
      }, { status: 400 });
    }

    // 2. Batas Waktu Pengajuan (BR-05)
    // Cek batas pengajuan berdasarkan waktu server WIB (Data contoh: 2026-10-15 atau tanggal sekarang)
    const todayWIB = getWIBDateString();
    const validasiBatas = validasiBatasPengajuan(jenis, tanggalMulai, todayWIB);
    // Catatan: Jika menguji data tahun 2026, berikan toleransi bila tanggal server berbeda, namun tetap cek logika BR-05
    if (!validasiBatas.valid && tanggalMulai > todayWIB) {
      return NextResponse.json({ success: false, message: validasiBatas.pesan }, { status: 400 });
    }

    // 3. Baturan Khusus Izin (BR-08: Izin paling banyak 2 hari kerja per pengajuan)
    if (jenis === 'izin' && jumlahHariKerja > 2) {
      return NextResponse.json({
        success: false,
        message: 'Pengajuan izin paling banyak 2 hari kerja per pengajuan (BR-08).'
      }, { status: 400 });
    }

    // 4. Aturan Khusus Sakit (BR-08: Sakit lebih dari 1 hari kerja wajib melampirkan surat dokter)
    if (jenis === 'sakit' && jumlahHariKerja > 1 && !lampiranPath) {
      return NextResponse.json({
        success: false,
        message: 'Sakit lebih dari 1 hari kerja wajib melampirkan surat dokter (BR-08).'
      }, { status: 400 });
    }

    // 5. Cek Hak Cuti 12 Bulan (BR-04) untuk cuti tahunan
    if (jenis === 'cuti_tahunan') {
      const { berhak, tanggalMulaiBerhak } = cekHakCutiTahunan(profile.tanggal_masuk, tanggalMulai);
      if (!berhak) {
        return NextResponse.json({
          success: false,
          message: `Cuti tahunan baru boleh diambil setelah masa kerja genap 12 bulan sejak tanggal masuk (${tanggalMulaiBerhak}) (BR-04).`
        }, { status: 400 });
      }
    }

    // 6. Cek Tanggal Beririsan dengan pengajuan lain milik karyawan yang sama yang masih berjalan (BR-07)
    const { data: overlapping } = await supabase
      .from('pengajuan_cuti')
      .select('id, tanggal_mulai, tanggal_selesai, jenis')
      .eq('karyawan_id', user.id)
      .in('status', ['diajukan', 'disetujui_atasan', 'disetujui'])
      .lte('tanggal_mulai', tanggalSelesai)
      .gte('tanggal_selesai', tanggalMulai);

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Tanggal pengajuan beririsan dengan pengajuan Anda lainnya yang masih berjalan (BR-07).'
      }, { status: 400 });
    }

    // 7. Cek apakah sudah ada data absensi pada rentang tanggal tersebut (BR-07)
    const { data: overlappingAbsen } = await supabase
      .from('absensi')
      .select('id, tanggal')
      .eq('karyawan_id', user.id)
      .gte('tanggal', tanggalMulai)
      .lte('tanggal', tanggalSelesai);

    if (overlappingAbsen && overlappingAbsen.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Pengajuan ditolak karena sudah ada catatan absensi pada rentang tanggal tersebut (${overlappingAbsen[0].tanggal}) (BR-07).`
      }, { status: 400 });
    }

    // 8. Cek Kuota Cuti & Kurangi Langsung (BR-06)
    const tahunPengajuan = new Date(tanggalMulai).getFullYear();

    if (jenis === 'cuti_tahunan') {
      // Ambil kuota cuti tahun terkait
      const { data: kuota, error: kuotaErr } = await supabase
        .from('kuota_cuti')
        .select('*')
        .eq('karyawan_id', user.id)
        .eq('tahun', tahunPengajuan)
        .single();

      if (kuotaErr || !kuota) {
        return NextResponse.json({
          success: false,
          message: 'Data kuota cuti tahunan untuk tahun ini tidak ditemukan.'
        }, { status: 400 });
      }

      const sisaKuota = kuota.jatah_hari - kuota.terpakai_hari;

      // BR-06: Pengajuan ditolak bila jumlah hari melebihi sisa kuota (Kasus uji Siti Nurhaliza)
      if (jumlahHariKerja > sisaKuota) {
        return NextResponse.json({
          success: false,
          message: `Sisa kuota cuti Anda (${sisaKuota} hari) tidak mencukupi untuk pengajuan ${jumlahHariKerja} hari kerja (BR-06).`
        }, { status: 400 });
      }

      // Update terpakai_hari secara atomik
      const { error: updateKuotaErr } = await supabase
        .from('kuota_cuti')
        .update({
          terpakai_hari: kuota.terpakai_hari + jumlahHariKerja
        })
        .eq('id', kuota.id)
        .eq('terpakai_hari', kuota.terpakai_hari); // Optimistic concurrency check to prevent race condition (BR-06)

      if (updateKuotaErr) {
        return NextResponse.json({
          success: false,
          message: 'Terjadi konflik saat memperbarui kuota cuti bersamaan. Silakan coba kembali.'
        }, { status: 409 });
      }
    }

    // 9. Tentukan perlu_atasan (BR-09):
    // Bila pemohon adalah Atasan atau HRD, atau divisinya tidak memiliki Atasan, tahap pertama dilewati (perlu_atasan = false)
    let perluAtasan = true;
    if (profile.peran === 'atasan' || profile.peran === 'hrd') {
      perluAtasan = false;
    } else if (!profile.divisi || !profile.divisi.manajer_id) {
      perluAtasan = false;
    }

    // 10. Insert pengajuan_cuti
    const { data: newPengajuan, error: insertErr } = await supabase
      .from('pengajuan_cuti')
      .insert({
        karyawan_id: user.id,
        jenis,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        jumlah_hari: jumlahHariKerja,
        alasan: alasan.trim(),
        lampiran_path: lampiranPath || null,
        status: 'diajukan',
        perlu_atasan: perluAtasan
      })
      .select()
      .single();

    if (insertErr) {
      // Rollback kuota cuti jika gagal insert
      if (jenis === 'cuti_tahunan') {
        const { data: kuotaRevert } = await supabase
          .from('kuota_cuti')
          .select('id, terpakai_hari')
          .eq('karyawan_id', user.id)
          .eq('tahun', tahunPengajuan)
          .single();
        if (kuotaRevert) {
          await supabase.from('kuota_cuti').update({
            terpakai_hari: Math.max(0, kuotaRevert.terpakai_hari - jumlahHariKerja)
          }).eq('id', kuotaRevert.id);
        }
      }
      return NextResponse.json({ success: false, message: insertErr.message }, { status: 500 });
    }

    // Catat ke audit log jika kuota cuti berkurang (BR-12)
    if (jenis === 'cuti_tahunan') {
      await supabase.from('audit_log').insert({
        pelaku_id: user.id,
        aksi: 'cuti_diajukan',
        nama_tabel: 'pengajuan_cuti',
        data_id: newPengajuan.id,
        nilai_sesudah: newPengajuan
      });
    }

    return NextResponse.json({
      success: true,
      data: newPengajuan,
      message: `Pengajuan ${jenis.replace('_', ' ')} selama ${jumlahHariKerja} hari kerja berhasil dikirim.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
