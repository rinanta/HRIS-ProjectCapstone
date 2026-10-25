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
      return NextResponse.json({ success: false, message: 'Hanya HRD yang berwenang menambah hari libur.' }, { status: 403 });
    }

    const body = await request.json();
    const { tanggal, keterangan, jenis } = body;

    if (!tanggal || !keterangan || !jenis) {
      return NextResponse.json({ success: false, message: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    const { data: inserted, error: insertError } = await supabase
      .from('hari_libur')
      .insert({
        tanggal,
        keterangan: keterangan.trim(),
        jenis
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, message: insertError.message }, { status: 500 });
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'hari_libur_insert',
      nama_tabel: 'hari_libur',
      data_id: tanggal,
      nilai_sesudah: inserted
    });

    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Hari libur baru berhasil ditambahkan.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
