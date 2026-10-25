import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWIBDateString, getWIBTimeParts, tentukanStatusCheckIn } from '@/lib/wib';

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

    // Cek hari kerja: Senin (1) sampai Jumat (5)
    // Gunakan tanggal WIB untuk menentukan hari dalam seminggu
    const wibDateObj = new Date(todayWIB + 'T12:00:00+07:00');
    const dayOfWeek = wibDateObj.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({
        success: false,
        message: 'Check-in hanya bisa dilakukan pada hari kerja (Senin sampai Jumat) (BR-02).'
      }, { status: 400 });
    }

    // Cek apakah hari libur (BR-02)
    const { data: libur } = await supabase
      .from('hari_libur')
      .select('keterangan')
      .eq('tanggal', todayWIB)
      .single();

    if (libur) {
      return NextResponse.json({
        success: false,
        message: `Hari ini adalah hari libur: ${libur.keterangan}. Check-in tidak dapat dilakukan (BR-02).`
      }, { status: 400 });
    }

    // Cek jam check-in: Antara pukul 06.00 dan 12.00 WIB (BR-02)
    if (jam < 6 || jam >= 12) {
      return NextResponse.json({
        success: false,
        message: 'Check-in hanya dapat dilakukan antara pukul 06.00 dan 12.00 WIB (BR-02).'
      }, { status: 400 });
    }

    // Cek apakah karyawan sedang cuti, sakit, atau izin yang disetujui (BR-02)
    const { data: activeLeave } = await supabase
      .from('pengajuan_cuti')
      .select('id, jenis')
      .eq('karyawan_id', user.id)
      .eq('status', 'disetujui')
      .lte('tanggal_mulai', todayWIB)
      .gte('tanggal_selesai', todayWIB)
      .maybeSingle();

    if (activeLeave) {
      return NextResponse.json({
        success: false,
        message: `Check-in ditolak karena Anda sedang dalam status ${activeLeave.jenis.replace('_', ' ')} yang telah disetujui (BR-02).`
      }, { status: 400 });
    }

    // Cek apakah sudah check-in hari ini
    const { data: existingAbsen } = await supabase
      .from('absensi')
      .select('id')
      .eq('karyawan_id', user.id)
      .eq('tanggal', todayWIB)
      .maybeSingle();

    if (existingAbsen) {
      return NextResponse.json({
        success: false,
        message: 'Anda sudah melakukan check-in untuk hari ini (BR-02).'
      }, { status: 400 });
    }

    // Tentukan status: lewat 08.15.00 terlambat, <= 08.15.00 hadir (BR-03)
    const status = tentukanStatusCheckIn(now.toISOString());

    // Insert absensi
    const { data: inserted, error: insertError } = await supabase
      .from('absensi')
      .insert({
        karyawan_id: user.id,
        tanggal: todayWIB,
        jam_masuk: now.toISOString(),
        status: status
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ success: false, message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: inserted,
      message: `Check-in berhasil tercatat pada ${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')} WIB dengan status ${status.toUpperCase()}.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
