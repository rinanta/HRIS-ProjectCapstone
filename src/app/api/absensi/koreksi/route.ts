import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Cek apakah user adalah HRD (BR-03)
    const { data: profile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    if (profile?.peran !== 'hrd') {
      return NextResponse.json({
        success: false,
        message: 'Hanya HRD yang memiliki wewenang untuk mengoreksi absensi (BR-03).'
      }, { status: 403 });
    }

    const body = await request.json();
    const { absensiId, jamMasuk, jamPulang, status, alasanKoreksi } = body;

    if (!absensiId) {
      return NextResponse.json({ success: false, message: 'ID absensi diperlukan.' }, { status: 400 });
    }

    // Validasi alasan koreksi minimal 10 karakter (BR-03)
    if (!alasanKoreksi || alasanKoreksi.trim().length < 10) {
      return NextResponse.json({
        success: false,
        message: 'Alasan koreksi wajib diisi minimal 10 karakter (BR-03).'
      }, { status: 400 });
    }

    // Ambil data absensi sebelum diubah untuk audit_log (BR-12)
    const { data: oldAbsensi } = await supabase
      .from('absensi')
      .select('*')
      .eq('id', absensiId)
      .single();

    if (!oldAbsensi) {
      return NextResponse.json({ success: false, message: 'Data absensi tidak ditemukan.' }, { status: 404 });
    }

    // Update absensi
    const { data: updated, error: updateError } = await supabase
      .from('absensi')
      .update({
        jam_masuk: jamMasuk,
        jam_pulang: jamPulang || null,
        status: status,
        dikoreksi_oleh: user.id,
        alasan_koreksi: alasanKoreksi.trim()
      })
      .eq('id', absensiId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // Catat ke audit_log (BR-12)
    await supabase
      .from('audit_log')
      .insert({
        pelaku_id: user.id,
        aksi: 'koreksi_absensi_insert',
        nama_tabel: 'absensi',
        data_id: absensiId,
        nilai_sebelum: oldAbsensi,
        nilai_sesudah: updated
      });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Absensi berhasil dikoreksi dan dicatat di audit log.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
