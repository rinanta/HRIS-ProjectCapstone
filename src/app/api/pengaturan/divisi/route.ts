import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
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
      return NextResponse.json({ success: false, message: 'Hanya HRD yang berwenang mengatur divisi (BR-01).' }, { status: 403 });
    }

    const body = await request.json();
    const { divisiId, manajerId } = body;

    if (!divisiId) {
      return NextResponse.json({ success: false, message: 'ID divisi diperlukan.' }, { status: 400 });
    }

    // Jika manajerId diisi, validasi BR-01:
    // 1. Manajer harus akun aktif berperan 'atasan'
    // 2. Satu Atasan hanya memimpin satu divisi (UK pada manajer_id)
    if (manajerId) {
      const { data: candidate } = await supabase
        .from('profiles')
        .select('peran, aktif, nama_lengkap')
        .eq('id', manajerId)
        .single();

      if (!candidate || !candidate.aktif) {
        return NextResponse.json({ success: false, message: 'Akun manajer harus aktif.' }, { status: 400 });
      }

      if (candidate.peran !== 'atasan') {
        return NextResponse.json({ success: false, message: 'Akun yang dipilih harus memiliki peran Atasan (BR-01).' }, { status: 400 });
      }

      // Cek apakah atasan tersebut sudah memimpin divisi lain
      const { data: existingDiv } = await supabase
        .from('divisi')
        .select('id, nama')
        .eq('manajer_id', manajerId)
        .neq('id', divisiId)
        .maybeSingle();

      if (existingDiv) {
        return NextResponse.json({
          success: false,
          message: `Atasan tersebut sudah memimpin divisi ${existingDiv.nama}. Satu Atasan hanya memimpin satu divisi (BR-01).`
        }, { status: 400 });
      }
    }

    // Ambil data divisi sebelum update
    const { data: oldDivisi } = await supabase.from('divisi').select('*').eq('id', divisiId).single();

    const { data: updated, error: updateError } = await supabase
      .from('divisi')
      .update({
        manajer_id: manajerId || null
      })
      .eq('id', divisiId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'divisi_update',
      nama_tabel: 'divisi',
      data_id: divisiId,
      nilai_sebelum: oldDivisi,
      nilai_sesudah: updated
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Manajer divisi berhasil diperbarui.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
