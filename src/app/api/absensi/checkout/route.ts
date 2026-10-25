import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWIBDateString, getWIBTimeParts } from '@/lib/wib';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const now = new Date();
    const todayWIB = getWIBDateString(now);
    const { jam, menit, detik } = getWIBTimeParts(now);

    // Cek apakah sudah check-in hari ini (BR-02: Check-out hanya bisa dilakukan setelah check-in pada hari yang sama)
    const { data: existingAbsen } = await supabase
      .from('absensi')
      .select('id, jam_masuk, jam_pulang')
      .eq('karyawan_id', user.id)
      .eq('tanggal', todayWIB)
      .maybeSingle();

    if (!existingAbsen) {
      return NextResponse.json({
        success: false,
        message: 'Anda belum melakukan check-in hari ini. Check-out hanya bisa dilakukan setelah check-in (BR-02).'
      }, { status: 400 });
    }

    if (existingAbsen.jam_pulang) {
      return NextResponse.json({
        success: false,
        message: 'Anda sudah melakukan check-out hari ini.'
      }, { status: 400 });
    }

    // Update jam_pulang
    const { data: updated, error: updateError } = await supabase
      .from('absensi')
      .update({
        jam_pulang: now.toISOString()
      })
      .eq('id', existingAbsen.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Check-out berhasil tercatat pada ${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')} WIB.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
