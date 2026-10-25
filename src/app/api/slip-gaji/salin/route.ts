import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    if (profile?.peran !== 'hrd') {
      return NextResponse.json({ success: false, message: 'Hanya HRD yang berwenang menyalin draf slip gaji.' }, { status: 403 });
    }

    const body = await request.json();
    const { periodeAsal, periodeTujuan } = body; // format: 'YYYY-MM'

    if (!periodeAsal || !periodeTujuan) {
      return NextResponse.json({ success: false, message: 'Periode asal dan tujuan diperlukan.' }, { status: 400 });
    }

    const formattedAsal = `${periodeAsal}-01`;
    const formattedTujuan = `${periodeTujuan}-01`;

    // Ambil semua slip dari periode asal
    const { data: sourceSlips } = await supabase
      .from('slip_gaji')
      .select('*')
      .eq('periode', formattedAsal);

    if (!sourceSlips || sourceSlips.length === 0) {
      return NextResponse.json({ success: false, message: `Tidak ada slip gaji yang ditemukan pada periode ${periodeAsal}.` }, { status: 404 });
    }

    // Ambil slip yang sudah ada pada periode tujuan untuk mencegah duplikasi
    const { data: targetSlips } = await supabase
      .from('slip_gaji')
      .select('karyawan_id')
      .eq('periode', formattedTujuan);

    const existingKaryawanIds = new Set((targetSlips || []).map(s => s.karyawan_id));

    let countCopied = 0;
    for (const src of sourceSlips) {
      if (!existingKaryawanIds.has(src.karyawan_id)) {
        await supabase.from('slip_gaji').insert({
          karyawan_id: src.karyawan_id,
          periode: formattedTujuan,
          gaji_pokok: src.gaji_pokok,
          tunjangan: src.tunjangan,
          potongan: src.potongan,
          total_diterima: src.total_diterima,
          catatan: src.catatan,
          status: 'draf',
          dibuat_oleh: user.id
        });
        countCopied++;
      }
    }

    // Catat ke audit log (BR-12)
    if (countCopied > 0) {
      await supabase.from('audit_log').insert({
        pelaku_id: user.id,
        aksi: 'slip_salin_periode',
        nama_tabel: 'slip_gaji',
        data_id: formattedTujuan,
        nilai_sesudah: { periodeAsal: formattedAsal, periodeTujuan: formattedTujuan, jumlahSlip: countCopied }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil menyalin ${countCopied} draf slip gaji dari periode ${periodeAsal} ke ${periodeTujuan}.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
