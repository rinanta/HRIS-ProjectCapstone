import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Hanya HRD (BR-11 & BR-12)
    const { data: profile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    if (profile?.peran !== 'hrd') {
      return NextResponse.json({ success: false, message: 'Hanya HRD yang dapat mengelola slip gaji (BR-11).' }, { status: 403 });
    }

    const body = await request.json();
    const { karyawanId, periode, gajiPokok, tunjangan = 0, potongan = 0, catatan } = body;

    if (!karyawanId || !periode || gajiPokok === undefined) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Validasi tidak boleh negatif (BR-12)
    if (gajiPokok < 0 || tunjangan < 0 || potongan < 0) {
      return NextResponse.json({ success: false, message: 'Nominal gaji, tunjangan, dan potongan tidak boleh bernilai negatif (BR-12).' }, { status: 400 });
    }

    const totalDiterima = Number(gajiPokok) + Number(tunjangan) - Number(potongan);
    if (totalDiterima < 0) {
      return NextResponse.json({ success: false, message: 'Total gaji diterima tidak boleh di bawah nol (BR-12).' }, { status: 400 });
    }

    // Pastikan format periode adalah tanggal 1 bulan bersangkutan (YYYY-MM-01)
    const formattedPeriode = periode.length === 7 ? `${periode}-01` : periode;

    // Cek duplikasi slip pada periode yang sama (BR-12: Satu karyawan hanya memiliki satu slip per periode bulan)
    const { data: existing } = await supabase
      .from('slip_gaji')
      .select('id')
      .eq('karyawan_id', karyawanId)
      .eq('periode', formattedPeriode)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Slip gaji untuk karyawan tersebut pada periode ini sudah ada (BR-12).'
      }, { status: 400 });
    }

    // Insert slip baru sebagai 'draf'
    const { data: newSlip, error: insertError } = await supabase
      .from('slip_gaji')
      .insert({
        karyawan_id: karyawanId,
        periode: formattedPeriode,
        gaji_pokok: gajiPokok,
        tunjangan: tunjangan,
        potongan: potongan,
        total_diterima: totalDiterima,
        catatan: catatan || null,
        status: 'draf',
        dibuat_oleh: user.id
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, message: insertError.message }, { status: 500 });
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'slip_insert',
      nama_tabel: 'slip_gaji',
      data_id: newSlip.id,
      nilai_sesudah: newSlip
    });

    return NextResponse.json({
      success: true,
      data: newSlip,
      message: 'Draf slip gaji berhasil dibuat.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Hanya HRD
    const { data: profile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    if (profile?.peran !== 'hrd') {
      return NextResponse.json({ success: false, message: 'Hanya HRD yang dapat mengedit slip gaji.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, gajiPokok, tunjangan = 0, potongan = 0, catatan } = body;

    if (!id || gajiPokok === undefined) {
      return NextResponse.json({ success: false, message: 'ID dan gaji pokok diperlukan.' }, { status: 400 });
    }

    if (gajiPokok < 0 || tunjangan < 0 || potongan < 0) {
      return NextResponse.json({ success: false, message: 'Nominal tidak boleh negatif.' }, { status: 400 });
    }

    const totalDiterima = Number(gajiPokok) + Number(tunjangan) - Number(potongan);
    if (totalDiterima < 0) {
      return NextResponse.json({ success: false, message: 'Total gaji diterima tidak boleh di bawah nol.' }, { status: 400 });
    }

    // Cek apakah slip sudah terbit (BR-12: Slip yang sudah terbit tidak bisa diubah)
    const { data: oldSlip } = await supabase
      .from('slip_gaji')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldSlip) {
      return NextResponse.json({ success: false, message: 'Slip gaji tidak ditemukan.' }, { status: 404 });
    }

    if (oldSlip.status === 'terbit') {
      return NextResponse.json({
        success: false,
        message: 'Slip gaji yang sudah terbit terkunci dan tidak bisa diubah (BR-12).'
      }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('slip_gaji')
      .update({
        gaji_pokok: gajiPokok,
        tunjangan: tunjangan,
        potongan: potongan,
        total_diterima: totalDiterima,
        catatan: catatan || null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // Audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'slip_update',
      nama_tabel: 'slip_gaji',
      data_id: id,
      nilai_sebelum: oldSlip,
      nilai_sesudah: updated
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Draf slip gaji berhasil diperbarui.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
