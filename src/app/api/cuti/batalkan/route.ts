import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWIBDateString } from '@/lib/wib';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    const body = await request.json();
    const { pengajuanId } = body;

    if (!pengajuanId) {
      return NextResponse.json({ success: false, message: 'ID pengajuan diperlukan.' }, { status: 400 });
    }

    // Ambil data pengajuan
    const { data: pengajuan, error: pError } = await supabase
      .from('pengajuan_cuti')
      .select('*')
      .eq('id', pengajuanId)
      .single();

    if (pError || !pengajuan) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
    }

    // Cek hak pembatalan (BR-10):
    // 1. Pemohon dapat membatalkan selama status 'diajukan' atau 'disetujui_atasan'
    // 2. Pengajuan yang sudah 'disetujui' hanya dapat dibatalkan oleh HRD, dan hanya sebelum tanggal mulai
    const isPemohon = pengajuan.karyawan_id === user.id;
    const isHrd = profile?.peran === 'hrd';

    if (['ditolak', 'dibatalkan'].includes(pengajuan.status)) {
      return NextResponse.json({ success: false, message: 'Pengajuan sudah dalam status akhir dan tidak dapat dibatalkan lagi.' }, { status: 400 });
    }

    const todayWIB = getWIBDateString();

    if (pengajuan.status === 'disetujui') {
      if (!isHrd) {
        return NextResponse.json({
          success: false,
          message: 'Pengajuan yang sudah disetujui hanya dapat dibatalkan oleh HRD (BR-10).'
        }, { status: 403 });
      }
      if (todayWIB >= pengajuan.tanggal_mulai) {
        return NextResponse.json({
          success: false,
          message: 'Pengajuan yang sudah disetujui hanya dapat dibatalkan sebelum tanggal mulai (BR-10).'
        }, { status: 400 });
      }
    } else {
      // Status 'diajukan' atau 'disetujui_atasan'
      if (!isPemohon && !isHrd) {
        return NextResponse.json({
          success: false,
          message: 'Hanya pemohon atau HRD yang dapat membatalkan pengajuan ini (BR-10).'
        }, { status: 403 });
      }
    }

    // Simpan data lama untuk audit
    const oldPengajuan = { ...pengajuan };

    // Update status menjadi dibatalkan
    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await supabase
      .from('pengajuan_cuti')
      .update({
        status: 'dibatalkan',
        dibatalkan_oleh: user.id,
        dibatalkan_pada: now
      })
      .eq('id', pengajuan.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, message: updateErr.message }, { status: 500 });
    }

    // Jika cuti tahunan, kembalikan kuota cuti (BR-06)
    if (pengajuan.jenis === 'cuti_tahunan') {
      const tahun = new Date(pengajuan.tanggal_mulai).getFullYear();
      const { data: kuota } = await supabase
        .from('kuota_cuti')
        .select('id, terpakai_hari')
        .eq('karyawan_id', pengajuan.karyawan_id)
        .eq('tahun', tahun)
        .single();

      if (kuota) {
        const newTerpakai = Math.max(0, kuota.terpakai_hari - pengajuan.jumlah_hari);
        await supabase
          .from('kuota_cuti')
          .update({ terpakai_hari: newTerpakai })
          .eq('id', kuota.id);
      }
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'cuti_update',
      nama_tabel: 'pengajuan_cuti',
      data_id: pengajuan.id,
      nilai_sebelum: { status: oldPengajuan.status },
      nilai_sesudah: { status: 'dibatalkan', dibatalkan_oleh: user.id }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Pengajuan berhasil dibatalkan dan kuota cuti telah dikembalikan.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
