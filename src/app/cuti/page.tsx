'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Calendar, Plus, AlertCircle, CheckCircle2, Clock, FileText, UploadCloud, X, Ban } from 'lucide-react';
import { KuotaCuti, PengajuanCuti, HariLibur, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, hitungHariKerja, getWIBDateString } from '@/lib/wib';

export default function CutiPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kuota, setKuota] = useState<KuotaCuti | null>(null);
  const [hariLibur, setHariLibur] = useState<HariLibur[]>([]);
  const [myPengajuan, setMyPengajuan] = useState<PengajuanCuti[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [jenis, setJenis] = useState<'cuti_tahunan' | 'sakit' | 'izin'>('cuti_tahunan');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [alasan, setAlasan] = useState('');
  const [fileDokter, setFileDokter] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Cancel action state
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Profil
      const { data: prof } = await supabase
        .from('profiles')
        .select('*, divisi:divisi_id(id, nama, manajer_id)')
        .eq('id', user.id)
        .single();
      setProfile(prof as Profile);

      // 2. Kuota Cuti 2026
      const { data: kc } = await supabase
        .from('kuota_cuti')
        .select('*')
        .eq('karyawan_id', user.id)
        .eq('tahun', 2026)
        .maybeSingle();
      setKuota(kc as KuotaCuti | null);

      // 3. Hari Libur
      const { data: hl } = await supabase.from('hari_libur').select('*');
      setHariLibur((hl || []) as HariLibur[]);

      // 4. Daftar Pengajuan Saya
      const { data: pengajuanList } = await supabase
        .from('pengajuan_cuti')
        .select('*')
        .eq('karyawan_id', user.id)
        .order('dibuat_pada', { ascending: false });
      setMyPengajuan((pengajuanList || []) as PengajuanCuti[]);

    } catch (err) {
      console.error('Error load cuti data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Kalkulasi hari kerja secara live saat form diisi
  const kalkulasi = hitungHariKerja(tanggalMulai, tanggalSelesai, hariLibur);
  const sisaKuota = kuota ? Math.max(0, kuota.jatah_hari - kuota.terpakai_hari) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (alasan.trim().length < 5) {
      setFormError('Alasan pengajuan wajib minimal 5 karakter.');
      return;
    }

    if (kalkulasi.jumlahHariKerja <= 0) {
      setFormError('Rentang tanggal tidak memiliki hari kerja (semua tanggal adalah Sabtu, Minggu, atau Hari Libur).');
      return;
    }

    if (jenis === 'izin' && kalkulasi.jumlahHariKerja > 2) {
      setFormError('Izin paling banyak 2 hari kerja per pengajuan (BR-08).');
      return;
    }

    if (jenis === 'sakit' && kalkulasi.jumlahHariKerja > 1 && !fileDokter) {
      setFormError('Sakit lebih dari 1 hari kerja wajib melampirkan surat dokter (BR-08).');
      return;
    }

    if (jenis === 'cuti_tahunan' && kalkulasi.jumlahHariKerja > sisaKuota) {
      setFormError(`Sisa kuota cuti Anda (${sisaKuota} hari) tidak mencukupi untuk ${kalkulasi.jumlahHariKerja} hari kerja (BR-06).`);
      return;
    }

    setSubmitting(true);
    let lampiranPath: string | null = null;

    try {
      // Upload surat dokter jika ada
      if (fileDokter) {
        if (fileDokter.size > 2 * 1024 * 1024) {
          setFormError('Ukuran file maksimal 2 MB (BR-08).');
          setSubmitting(false);
          return;
        }

        const ext = fileDokter.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
          setFormError('Format file hanya diperbolehkan PDF, JPG, atau PNG (BR-08).');
          setSubmitting(false);
          return;
        }

        const fileName = `${profile?.id}_${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('surat-dokter')
          .upload(fileName, fileDokter);

        if (uploadError) {
          console.error('Storage upload note:', uploadError.message);
          lampiranPath = `surat-dokter/${fileName}`;
        } else {
          lampiranPath = uploadData?.path || `surat-dokter/${fileName}`;
        }
      }

      // Kirim request ke backend API
      const res = await fetch('/api/cuti/ajukan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenis,
          tanggalMulai,
          tanggalSelesai,
          alasan,
          lampiranPath
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setFormError(resData.message);
      } else {
        setFormSuccess(resData.message);
        setTimeout(() => {
          setShowModal(false);
          setTanggalMulai('');
          setTanggalSelesai('');
          setAlasan('');
          setFileDokter(null);
          loadData();
        }, 1200);
      }
    } catch {
      setFormError('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatalkan = async (pengajuanId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pengajuan ini? Kuota cuti tahunan akan dikembalikan.')) {
      return;
    }

    setCancelLoadingId(pengajuanId);
    try {
      const res = await fetch('/api/cuti/batalkan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pengajuanId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message);
      } else {
        alert(data.message);
        loadData();
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setCancelLoadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <span className="badge badge-success">Disetujui</span>;
      case 'disetujui_atasan':
        return <span className="badge badge-info">Disetujui Atasan</span>;
      case 'diajukan':
        return <span className="badge badge-warning">Menunggu Keputusan</span>;
      case 'ditolak':
        return <span className="badge badge-danger">Ditolak</span>;
      case 'dibatalkan':
        return <span className="badge badge-neutral">Dibatalkan</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <AppShell title="Pengajuan Cuti dan Izin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Cuti, Sakit, dan Izin</h1>
          <p className="page-subtitle">
            Kelola permohonan ketidakhadiran kerja dengan perhitungan hari kerja otomatis (BR-04 s/d BR-08)
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(true);
            setFormError('');
            setFormSuccess('');
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Buat Pengajuan Baru</span>
        </button>
      </div>

      {/* Ringkasan Kuota Cuti Karyawan */}
      <div className="card" style={{ marginBottom: '24px', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Jatah Cuti Tahunan 2026
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
              {sisaKuota} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hari Tersisa</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Jatah</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {kuota?.jatah_hari || 12} hari
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terpakai / Sedang Diajukan</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f59e0b' }}>
                {kuota?.terpakai_hari || 0} hari
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hak Cuti Tahunan</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981', marginTop: '4px' }}>
                Masa kerja genap 12 bulan (BR-04)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Pengajuan Saya */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Riwayat Pengajuan Anda</h3>
          <span className="badge badge-neutral">{myPengajuan.length} Total Riwayat</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jenis</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Durasi</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Lampiran</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Memuat daftar pengajuan...
                  </td>
                </tr>
              ) : myPengajuan.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Belum ada pengajuan cuti, sakit, atau izin yang dibuat.
                  </td>
                </tr>
              ) : (
                myPengajuan.map(item => {
                  const canCancel = ['diajukan', 'disetujui_atasan'].includes(item.status);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {item.jenis.replace('_', ' ')}
                      </td>
                      <td>{formatTanggalIndo(item.tanggal_mulai)}</td>
                      <td>{formatTanggalIndo(item.tanggal_selesai)}</td>
                      <td>
                        <strong>{item.jumlah_hari} hari</strong>
                      </td>
                      <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.alasan}>
                        {item.alasan}
                      </td>
                      <td>
                        {getStatusBadge(item.status)}
                        {item.status === 'ditolak' && item.alasan_penolakan && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--danger-text)', marginTop: '3px' }} title={item.alasan_penolakan}>
                            Alasan: {item.alasan_penolakan}
                          </div>
                        )}
                      </td>
                      <td>
                        {item.lampiran_path ? (
                          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                            Surat Dokter
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {canCancel && (
                          <button
                            onClick={() => handleBatalkan(item.id)}
                            className="btn btn-outline-danger btn-sm"
                            disabled={cancelLoadingId === item.id}
                            title="Batalkan pengajuan ini (kuota akan dikembalikan)"
                          >
                            <Ban size={13} />
                            <span>{cancelLoadingId === item.id ? 'Memproses...' : 'Batalkan'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Formulir Pengajuan Baru */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Formulir Pengajuan Baru</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <div>{formError}</div>
                  </div>
                )}

                {formSuccess && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    <div>{formSuccess}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Jenis Permohonan</label>
                  <select
                    className="form-control"
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as 'cuti_tahunan' | 'sakit' | 'izin')}
                    required
                  >
                    <option value="cuti_tahunan">Cuti Tahunan (Mengurangi kuota, H-3)</option>
                    <option value="sakit">Sakit (Wajib surat dokter bila &gt; 1 hari)</option>
                    <option value="izin">Izin (Maksimal 2 hari kerja, H-1)</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tanggal Mulai</label>
                    <input
                      type="date"
                      className="form-control"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Selesai</label>
                    <input
                      type="date"
                      className="form-control"
                      value={tanggalSelesai}
                      min={tanggalMulai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Perhitungan Hari Kerja Otomatis Live (BR-05) */}
                {tanggalMulai && tanggalSelesai && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '18px',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#166534' }}>Total Hari Kerja yang Dihitung:</span>
                      <strong style={{ fontSize: '1.1rem', color: '#15803d' }}>
                        {kalkulasi.jumlahHariKerja} Hari Kerja
                      </strong>
                    </div>
                    {kalkulasi.liburDilewati.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '6px' }}>
                        *Melewati: {kalkulasi.liburDilewati.join(', ')}
                      </div>
                    )}
                    {jenis === 'cuti_tahunan' && (
                      <div style={{ fontSize: '0.75rem', color: kalkulasi.jumlahHariKerja <= sisaKuota ? '#166534' : '#b91c1c', marginTop: '4px' }}>
                        Sisa kuota setelah pengajuan: {Math.max(0, sisaKuota - kalkulasi.jumlahHariKerja)} hari
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Alasan Pengajuan <span style={{ color: 'var(--text-muted)' }}>(Wajib minimal 5 karakter)</span>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Jelaskan keperluan cuti, sakit, atau izin..."
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: alasan.trim().length >= 5 ? 'var(--success)' : 'var(--text-muted)', marginTop: '4px' }}>
                    {alasan.trim().length} / 5 karakter
                  </div>
                </div>

                {/* Upload Surat Dokter untuk Sakit > 1 Hari (BR-08) */}
                {jenis === 'sakit' && (
                  <div className="form-group">
                    <label className="form-label">
                      Surat Dokter {kalkulasi.jumlahHariKerja > 1 && <span style={{ color: 'var(--danger)' }}>*(Wajib untuk sakit &gt; 1 hari)</span>}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFileDokter(e.target.files ? e.target.files[0] : null)}
                      required={kalkulasi.jumlahHariKerja > 1}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Format: PDF, JPG, atau PNG (Maksimal 2 MB - BR-08)
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
