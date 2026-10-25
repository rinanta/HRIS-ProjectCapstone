import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Hanya HRD (BR-01)
    const { data: profile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    if (profile?.peran !== 'hrd') {
      return NextResponse.json({ success: false, message: 'Hanya HRD yang dapat menambah data karyawan (BR-01).' }, { status: 403 });
    }

    const body = await request.json();
    const { nik, nama, email, nomorHp, peran, divisiId, jabatan, statusKerja, tanggalMasuk, kataSandi } = body;

    if (!nik || !nama || !email || !peran || !jabatan || !statusKerja || !tanggalMasuk) {
      return NextResponse.json({ success: false, message: 'Semua kolom wajib diisi.' }, { status: 400 });
    }

    // Format NIK: KLN-0000
    if (!/^KLN-\d{4}$/.test(nik)) {
      return NextResponse.json({ success: false, message: 'Format NIK harus KLN-XXXX (contoh: KLN-0017).' }, { status: 400 });
    }

    // 1. Buat user di Auth
    // Gunakan password default Latihan#2026 jika tidak diisi
    const defaultPassword = kataSandi || 'Latihan#2026';
    const { data: newAuth, error: createAuthError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: defaultPassword
    });

    if (createAuthError || !newAuth.user) {
      return NextResponse.json({ success: false, message: createAuthError?.message || 'Gagal membuat akun autentikasi.' }, { status: 400 });
    }

    // 2. Buat profil
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newAuth.user.id,
        nik_karyawan: nik,
        nama_lengkap: nama.trim(),
        email: email.trim().toLowerCase(),
        nomor_hp: nomorHp || null,
        peran: peran,
        divisi_id: divisiId || null,
        jabatan: jabatan.trim(),
        status_kerja: statusKerja,
        tanggal_masuk: tanggalMasuk,
        aktif: true
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ success: false, message: profileError.message }, { status: 500 });
    }

    // 3. Buat kuota cuti tahunan awal (0 jika belum genap setahun, atau 12)
    const tahunSekarang = new Date().getFullYear();
    await supabase.from('kuota_cuti').insert({
      karyawan_id: newAuth.user.id,
      tahun: tahunSekarang,
      jatah_hari: 12,
      terpakai_hari: 0
    });

    // 4. Catat ke audit log (BR-12)
    await supabase.from('audit_log').insert({
      pelaku_id: user.id,
      aksi: 'karyawan_insert',
      nama_tabel: 'profiles',
      data_id: newAuth.user.id,
      nilai_sesudah: newProfile
    });

    return NextResponse.json({
      success: true,
      data: newProfile,
      message: 'Karyawan baru berhasil ditambahkan.'
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

    // Hanya HRD (BR-01)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('peran')
      .eq('id', user.id)
      .single();

    if (currentProfile?.peran !== 'hrd') {
      return NextResponse.json({ success: false, message: 'Hanya HRD yang berwenang mengubah data karyawan (BR-01).' }, { status: 403 });
    }

    const body = await request.json();
    const { id, peran, divisiId, jabatan, statusKerja, aktif } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID karyawan diperlukan.' }, { status: 400 });
    }

    // BR-01: HRD tidak boleh mengubah peran atau menonaktifkan akunnya sendiri
    if (id === user.id) {
      if (peran !== 'hrd' || aktif === false) {
        return NextResponse.json({
          success: false,
          message: 'HRD tidak diperbolehkan mengubah peran atau menonaktifkan akunnya sendiri (BR-01).'
        }, { status: 400 });
      }
    }

    // Ambil data sebelum update untuk audit log
    const { data: oldProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldProfile) {
      return NextResponse.json({ success: false, message: 'Karyawan tidak ditemukan.' }, { status: 404 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        peran: peran,
        divisi_id: divisiId || null,
        jabatan: jabatan,
        status_kerja: statusKerja,
        aktif: aktif
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
      aksi: 'karyawan_update',
      nama_tabel: 'profiles',
      data_id: id,
      nilai_sebelum: oldProfile,
      nilai_sesudah: updated
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data karyawan berhasil diperbarui.'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
