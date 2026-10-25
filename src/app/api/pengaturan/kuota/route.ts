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
      return NextResponse.json({ success: false, message: 'Hanya HRD yang berwenang mengatur jatah cuti (BR-04).' }, { status: 403 });
    }

    const body = await request.json();
    const { kuotaId, jatahHari } = body;

    if (!kuotaId || jatahHari === undefined) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    const jatah = Number(jatahHari);
    if (isNaN(jatah) || jatah < 0 || jatah > 12) {
      return NextResponse.json({
        success: false,
        message: 'Jatah cuti tahunan harus antara 0 sampai paling banyak 12 hari kerja per tahun kalender (BR-04).'
      }, { status: 400 });
    }

    const { data: oldKuota } = await supabase
      .from('kuota_cuti')
      .select('*, karyawan:karyawan_id(nama_lengkap)')
      .eq('id', kuotaId)
      .single();

    if (!oldKuota) {
      return NextResponse.json({ success: false, message: 'Data kuota cuti tidak ditemukan.' }, { status: 404 });
    }

    if (jatah < oldKuota.terpakai_hari) {
      return NextResponse.json({
        success: false,
        message: `Jatah cuti baru (${jatah} hari) tidak boleh lebih kecil dari hari yang sudah terpakai (${oldKuota.terpakai_hari} hari).`
      }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('kuota_cuti')
      .update({
        jatah_hari: jatah
      })
      .eq('id', kuotaId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, message: updateError.message }, { status: 500 });
    }

    // Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'kuota_update',
      nama_tabel: 'kuota_cuti',
      data_id: kuotaId,
      nilai_sebelum: { jatah_hari: oldKuota.jatah_hari, terpakai_hari: oldKuota.terpakai_hari },
      nilai_sesudah: { jatah_hari: updated.jatah_hari, terpakai_hari: updated.terpakai_hari }
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Jatah cuti untuk ${oldKuota.karyawan?.nama_lengkap} berhasil diubah menjadi ${jatah} hari.`
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
