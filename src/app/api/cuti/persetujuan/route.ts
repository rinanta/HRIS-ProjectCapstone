import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWIBDateString } from '@/lib/wib';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*, divisi:divisi_id(id, nama)')
      .eq('id', user.id)
      .single();

    if (!currentProfile || currentProfile.peran === 'karyawan') {
      return NextResponse.json({ success: false, message: 'Hanya Atasan dan HRD yang dapat melakukan persetujuan (BR-09).' }, { status: 403 });
    }

    const body = await request.json();
    const { pengajuanId, tindakan, alasanPenolakan } = body; // tindakan: 'setujui' | 'tolak' | 'batalkan_hrd'

    if (!pengajuanId || !tindakan) {
      return NextResponse.json({ success: false, message: 'Parameter tidak lengkap.' }, { status: 400 });
    }

    // Ambil data pengajuan dan pemohon
    const { data: pengajuan, error: pError } = await supabase
      .from('pengajuan_cuti')
      .select('*, karyawan:karyawan_id(id, nama_lengkap, divisi_id)')
      .eq('id', pengajuanId)
      .single();

    if (pError || !pengajuan) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
    }

    // BR-09: Tidak ada yang boleh memutuskan pengajuannya sendiri
    if (pengajuan.karyawan_id === user.id) {
      return NextResponse.json({
        success: false,
        message: 'Anda tidak dapat memutuskan atau menyetujui pengajuan Anda sendiri (BR-09).'
      }, { status: 403 });
    }

    const oldPengajuan = { ...pengajuan };
    const now = new Date().toISOString();
    const todayWIB = getWIBDateString();

    // 1. TINDAKAN: SETUJUI
    if (tindakan === 'setujui') {
      if (pengajuan.status === 'diajukan') {
        if (pengajuan.perlu_atasan) {
          // Harus Atasan divisi pemohon (BR-09)
          if (currentProfile.peran !== 'atasan' || currentProfile.divisi_id !== pengajuan.karyawan.divisi_id) {
            return NextResponse.json({
              success: false,
              message: 'Hanya Atasan dari divisi pemohon yang dapat menyetujui tahap pertama (BR-09).'
            }, { status: 403 });
          }

          // Atasan menyetujui tahap 1
          await supabase
            .from('pengajuan_cuti')
            .update({
              status: 'disetujui_atasan',
              disetujui_atasan_oleh: user.id,
              disetujui_atasan_pada: now
            })
            .eq('id', pengajuan.id);

          // Audit log (BR-12)
          await supabase.from('audit_log').insert({
            pelaku_id: user.id,
            aksi: 'cuti_update',
            nama_tabel: 'pengajuan_cuti',
            data_id: pengajuan.id,
            nilai_sebelum: { status: 'diajukan' },
            nilai_sesudah: { status: 'disetujui_atasan', disetujui_atasan_oleh: user.id }
          });

          return NextResponse.json({
            success: true,
            message: 'Pengajuan berhasil disetujui untuk tahap Atasan. Menunggu keputusan akhir HRD.'
          });

        } else {
          // Pengajuan tidak butuh atasan (langsung diputuskan HRD)
          if (currentProfile.peran !== 'hrd') {
            return NextResponse.json({
              success: false,
              message: 'Pengajuan ini langsung memerlukan keputusan akhir oleh HRD (BR-09).'
            }, { status: 403 });
          }

          // HRD memberi keputusan akhir
          await supabase
            .from('pengajuan_cuti')
            .update({
              status: 'disetujui',
              diputuskan_hrd_oleh: user.id,
              diputuskan_hrd_pada: now
            })
            .eq('id', pengajuan.id);

          await supabase.from('audit_log').insert({
            pelaku_id: user.id,
            aksi: 'cuti_update',
            nama_tabel: 'pengajuan_cuti',
            data_id: pengajuan.id,
            nilai_sebelum: { status: 'diajukan' },
            nilai_sesudah: { status: 'disetujui', diputuskan_hrd_oleh: user.id }
          });

          return NextResponse.json({
            success: true,
            message: 'Pengajuan berhasil disetujui secara final oleh HRD.'
          });
        }

      } else if (pengajuan.status === 'disetujui_atasan') {
        // Hanya HRD yang dapat memberi keputusan akhir tahap 2 (BR-09)
        if (currentProfile.peran !== 'hrd') {
          return NextResponse.json({
            success: false,
            message: 'Hanya HRD yang berwenang memberikan keputusan akhir (BR-09).'
          }, { status: 403 });
        }

        await supabase
          .from('pengajuan_cuti')
          .update({
            status: 'disetujui',
            diputuskan_hrd_oleh: user.id,
            diputuskan_hrd_pada: now
          })
          .eq('id', pengajuan.id);

        await supabase.from('audit_log').insert({
          pelaku_id: user.id,
          aksi: 'cuti_update',
          nama_tabel: 'pengajuan_cuti',
          data_id: pengajuan.id,
          nilai_sebelum: { status: 'disetujui_atasan' },
          nilai_sesudah: { status: 'disetujui', diputuskan_hrd_oleh: user.id }
        });

        return NextResponse.json({
          success: true,
          message: 'Pengajuan berhasil disetujui secara final oleh HRD.'
        });
      } else {
        return NextResponse.json({ success: false, message: 'Status pengajuan tidak valid untuk disetujui.' }, { status: 400 });
      }

    // 2. TINDAKAN: TOLAK
    } else if (tindakan === 'tolak') {
      if (!alasanPenolakan || alasanPenolakan.trim().length < 10) {
        return NextResponse.json({
          success: false,
          message: 'Penolakan wajib disertai alasan minimal 10 karakter (BR-09).'
        }, { status: 400 });
      }

      // Validasi siapa yang berhak menolak
      if (pengajuan.status === 'diajukan') {
        if (pengajuan.perlu_atasan) {
          if (currentProfile.peran !== 'atasan' || currentProfile.divisi_id !== pengajuan.karyawan.divisi_id) {
            return NextResponse.json({
              success: false,
              message: 'Hanya Atasan divisi pemohon yang berhak menolak pada tahap pertama (BR-09).'
            }, { status: 403 });
          }
        } else {
          if (currentProfile.peran !== 'hrd') {
            return NextResponse.json({ success: false, message: 'Hanya HRD yang berhak menolak pengajuan ini (BR-09).' }, { status: 403 });
          }
        }
      } else if (pengajuan.status === 'disetujui_atasan') {
        if (currentProfile.peran !== 'hrd') {
          return NextResponse.json({ success: false, message: 'Hanya HRD yang berhak memberikan keputusan pada tahap ini (BR-09).' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ success: false, message: 'Status pengajuan tidak valid untuk ditolak.' }, { status: 400 });
      }

      // Update status menjadi ditolak
      await supabase
        .from('pengajuan_cuti')
        .update({
          status: 'ditolak',
          alasan_penolakan: alasanPenolakan.trim(),
          diputuskan_hrd_oleh: currentProfile.peran === 'hrd' ? user.id : pengajuan.diputuskan_hrd_oleh,
          diputuskan_hrd_pada: currentProfile.peran === 'hrd' ? now : pengajuan.diputuskan_hrd_pada
        })
        .eq('id', pengajuan.id);

      // Kembalikan kuota cuti tahunan (BR-06)
      if (pengajuan.jenis === 'cuti_tahunan') {
        const tahun = new Date(pengajuan.tanggal_mulai).getFullYear();
        const { data: kuota } = await supabase
          .from('kuota_cuti')
          .select('id, terpakai_hari')
          .eq('karyawan_id', pengajuan.karyawan_id)
          .eq('tahun', tahun)
          .single();

        if (kuota) {
          await supabase
            .from('kuota_cuti')
            .update({
              terpakai_hari: Math.max(0, kuota.terpakai_hari - pengajuan.jumlah_hari)
            })
            .eq('id', kuota.id);
        }
      }

      // Catat ke audit log (BR-12)
      await supabase.from('audit_log').insert({
        pelaku_id: user.id,
        aksi: 'cuti_update',
        nama_tabel: 'pengajuan_cuti',
        data_id: pengajuan.id,
        nilai_sebelum: { status: oldPengajuan.status },
        nilai_sesudah: { status: 'ditolak', alasan_penolakan: alasanPenolakan.trim(), pelaku_id: user.id }
      });

      return NextResponse.json({
        success: true,
        message: 'Pengajuan telah ditolak dan kuota cuti tahunan pemohon telah dikembalikan (BR-06).'
      });

    // 3. TINDAKAN: BATALKAN OLEH HRD (BR-10)
    } else if (tindakan === 'batalkan_hrd') {
      if (currentProfile.peran !== 'hrd') {
        return NextResponse.json({ success: false, message: 'Hanya HRD yang dapat membatalkan cuti yang sudah disetujui (BR-10).' }, { status: 403 });
      }

      if (todayWIB >= pengajuan.tanggal_mulai) {
        return NextResponse.json({
          success: false,
          message: 'Pengajuan yang sudah disetujui hanya dapat dibatalkan sebelum tanggal mulai (BR-10).'
        }, { status: 400 });
      }

      await supabase
        .from('pengajuan_cuti')
        .update({
          status: 'dibatalkan',
          dibatalkan_oleh: user.id,
          dibatalkan_pada: now
        })
        .eq('id', pengajuan.id);

      // Kembalikan kuota cuti jika cuti tahunan (BR-06)
      if (pengajuan.jenis === 'cuti_tahunan') {
        const tahun = new Date(pengajuan.tanggal_mulai).getFullYear();
        const { data: kuota } = await supabase
          .from('kuota_cuti')
          .select('id, terpakai_hari')
          .eq('karyawan_id', pengajuan.karyawan_id)
          .eq('tahun', tahun)
          .single();

        if (kuota) {
          await supabase
            .from('kuota_cuti')
            .update({
              terpakai_hari: Math.max(0, kuota.terpakai_hari - pengajuan.jumlah_hari)
            })
            .eq('id', kuota.id);
        }
      }

      await supabase.from('audit_log').insert({
        pelaku_id: user.id,
        aksi: 'cuti_update',
        nama_tabel: 'pengajuan_cuti',
        data_id: pengajuan.id,
        nilai_sebelum: { status: 'disetujui' },
        nilai_sesudah: { status: 'dibatalkan', dibatalkan_oleh: user.id }
      });

      return NextResponse.json({
        success: true,
        message: 'Pengajuan yang telah disetujui berhasil dibatalkan oleh HRD, kuota dikembalikan.'
      });
    }

    return NextResponse.json({ success: false, message: 'Tindakan tidak valid.' }, { status: 400 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
