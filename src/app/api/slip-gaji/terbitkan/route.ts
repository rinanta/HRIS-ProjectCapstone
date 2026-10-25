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
      return NextResponse.json({ success: false, message: 'Hanya HRD yang dapat menerbitkan slip gaji (BR-12).' }, { status: 403 });
    }

    const body = await request.json();
    const { slipId } = body;

    if (!slipId) {
      return NextResponse.json({ success: false, message: 'ID slip diperlukan.' }, { status: 400 });
    }

    const { data: oldSlip, error: sError } = await supabase
      .from('slip_gaji')
      .select('*')
      .eq('id', slipId)
      .single();

    if (sError || !oldSlip) {
      return NextResponse.json({ success: false, message: 'Slip gaji tidak ditemukan.' }, { status: 404 });
    }

    if (oldSlip.status === 'terbit') {
      return NextResponse.json({ success: false, message: 'Slip gaji ini sudah berstatus terbit.' }, { status: 400 });
    }

    // Format nomor slip: SG-TTTTBB-NNN
    // Hitung jumlah slip yang sudah terbit pada periode yang sama
    const periodeStr = oldSlip.periode; // 'YYYY-MM-01'
    const periodeClean = periodeStr.substring(0, 7).replace('-', ''); // 'YYYYMM'
    const prefix = `SG-${periodeClean}-`;

    const { count: terbitCount } = await supabase
      .from('slip_gaji')
      .select('*', { count: 'exact', head: true })
      .eq('periode', periodeStr)
      .not('nomor_slip', 'is', null);

    const nextSeq = ((terbitCount || 0) + 1).toString().padStart(3, '0');
    const nomorSlipBaru = `${prefix}${nextSeq}`;

    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('slip_gaji')
      .update({
        status: 'terbit',
        nomor_slip: nomorSlipBaru,
        diterbitkan_oleh: user.id,
        diterbitkan_pada: now
      })
      .eq('id', slipId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'slip_terbit',
      nama_tabel: 'slip_gaji',
      data_id: slipId,
      nilai_sebelum: { status: 'draf' },
      nilai_sesudah: { status: 'terbit', nomor_slip: nomorSlipBaru }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Slip gaji berhasil diterbitkan dengan nomor ${nomorSlipBaru}.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
