'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Ban,
  Eye,
  X,
  Search,
  Filter,
  Calendar,
  FileCheck
} from 'lucide-react';
import { PengajuanCuti, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, getWIBDateString } from '@/lib/wib';

export default function PersetujuanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'antrean' | 'riwayat'>('antrean');

  const [pengajuanList, setPengajuanList] = useState<PengajuanCuti[]>([]);
  const [kuotaMap, setKuotaMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('semua');
  const [filterJenis, setFilterJenis] = useState('semua');

  // Modal Penolakan (Wajib min. 10 karakter)
  const [rejectingItem, setRejectingItem] = useState<PengajuanCuti | null>(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Modal Lihat Surat Dokter
  const [viewDocPath, setViewDocPath] = useState<string | null>(null);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const supabase = createClient();
  const [todayWIB, setTodayWIB] = useState('');

  useEffect(() => {
    setTodayWIB(getWIBDateString());
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*, divisi:divisi_id(id, nama, manajer_id)')
        .eq('id', user.id)
        .single();

      if (!prof) return;
      setProfile(prof as Profile);

      // Ambil seluruh pengajuan dengan relasi lengkap
      const { data: list, error } = await supabase
        .from('pengajuan_cuti')
        .select('*, karyawan:karyawan_id(id, nama_lengkap, nik_karyawan, jabatan, divisi_id, divisi:divisi_id(nama)), disetujui_atasan:disetujui_atasan_oleh(nama_lengkap), diputuskan_hrd:diputuskan_hrd_oleh(nama_lengkap)')
        .order('dibuat_pada', { ascending: false });

      if (error) console.error('Error fetching approvals:', error.message);

      const allList = (list || []) as PengajuanCuti[];

      // Ambil sisa kuota untuk setiap pemohon
      const pemohonIds = Array.from(new Set(allList.map(item => item.karyawan_id)));
      if (pemohonIds.length > 0) {
        const { data: kuotas } = await supabase
          .from('kuota_cuti')
          .select('karyawan_id, jatah_hari, terpakai_hari')
          .in('karyawan_id', pemohonIds)
          .eq('tahun', 2026);

        const map: Record<string, number> = {};
        (kuotas || []).forEach(k => {
          map[k.karyawan_id] = Math.max(0, k.jatah_hari - k.terpakai_hari);
        });
        setKuotaMap(map);
      }

      setPengajuanList(allList);
    } catch (err) {
      console.error('Error load persetujuan data:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle open document modal
  const handleOpenDoc = async (path: string) => {
    setViewDocPath(path);
    try {
      const { data } = supabase.storage.from('surat-dokter').getPublicUrl(path);
      setDocUrl(data?.publicUrl || null);
    } catch {
      setDocUrl(null);
    }
  };

  // Filter antrean pengajuan yang menunggu keputusan akun login saat ini 
  const filterAntrean = useCallback((item: PengajuanCuti) => {
    if (!profile) return false;
    // Tidak boleh memutuskan pengajuan sendiri 
    if (item.karyawan_id === profile.id) return false;

    if (profile.peran === 'atasan') {
      // Atasan hanya memutuskan pengajuan anggotanya yang berstatus 'diajukan' dan perlu_atasan = true
      return item.status === 'diajukan' &&
        item.perlu_atasan &&
        item.karyawan?.divisi_id === profile.divisi_id;
    }

    if (profile.peran === 'hrd') {
      // HRD memutuskan:
      // 1. Pengajuan yang sudah disetujui atasan ('disetujui_atasan')
      // 2. Pengajuan yang tanpa atasan ('diajukan' & perlu_atasan = false)
      const menungguHrd = item.status === 'disetujui_atasan' || (item.status === 'diajukan' && !item.perlu_atasan);
      return menungguHrd;
    }

    return false;
  }, [profile]);

  const antreanItems = useMemo(() => pengajuanList.filter(filterAntrean), [pengajuanList, filterAntrean]);
  const riwayatItems = useMemo(() => pengajuanList.filter(item => !filterAntrean(item)), [pengajuanList, filterAntrean]);

  // Filtered List berdasarkan Search & Filter Bar
  const displayedList = useMemo(() => {
    const source = activeTab === 'antrean' ? antreanItems : riwayatItems;
    return source.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        item.karyawan?.nama_lengkap.toLowerCase().includes(q) ||
        item.karyawan?.nik_karyawan.toLowerCase().includes(q) ||
        item.alasan.toLowerCase().includes(q);

      const matchDivisi = filterDivisi === 'semua' || item.karyawan?.divisi?.nama === filterDivisi;
      const matchJenis = filterJenis === 'semua' || item.jenis === filterJenis;

      return matchQuery && matchDivisi && matchJenis;
    });
  }, [activeTab, antreanItems, riwayatItems, searchQuery, filterDivisi, filterJenis]);

  const handleAction = async (pengajuanId: string, tindakan: 'setujui' | 'tolak' | 'batalkan_hrd', alasan: string = '') => {
    setSubmittingAction(true);
    setNotification(null);

    try {
      const res = await fetch('/api/cuti/persetujuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pengajuanId,
          tindakan,
          alasanPenolakan: alasan
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setNotification({ type: 'error', message: resData.message });
      } else {
        setNotification({ type: 'success', message: resData.message });
        setRejectingItem(null);
        setAlasanPenolakan('');
        loadData();
      }
    } catch {
      setNotification({ type: 'error', message: 'Gagal menghubungi server.' });
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui':
        return <span className="badge badge-success">Disetujui</span>;
      case 'disetujui_atasan':
        return <span className="badge badge-info">Disetujui Atasan</span>;
      case 'diajukan':
        return <span className="badge badge-warning">Menunggu</span>;
      case 'ditolak':
        return <span className="badge badge-danger">Ditolak</span>;
      case 'dibatalkan':
        return <span className="badge badge-neutral">Dibatalkan</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const uniqueDivisions = useMemo(() => {
    const divs = new Set<string>();
    pengajuanList.forEach(item => {
      if (item.karyawan?.divisi?.nama) divs.add(item.karyawan.divisi.nama);
    });
    return Array.from(divs);
  }, [pengajuanList]);

  return (
    <AppShell title="Persetujuan Cuti & Izin">
      {/* Header Halaman */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Persetujuan Cuti Berjenjang</h1>
        <p className="page-subtitle">
          Verifikasi permohonan ketidakhadiran karyawan sesuai alur kerja bertingkat.
        </p>
      </div>

      {notification && (
        <div className={`enterprise-alert enterprise-alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div>{notification.message}</div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          padding: '0 16px'
        }}>
          <button
            className={`tab-btn ${activeTab === 'antrean' ? 'active' : ''}`}
            onClick={() => setActiveTab('antrean')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Menunggu Keputusan Saya</span>
            <span style={{
              backgroundColor: antreanItems.length > 0 ? '#dc2626' : '#e2e8f0',
              color: antreanItems.length > 0 ? '#ffffff' : '#64748b',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: '9999px'
            }}>
              {antreanItems.length}
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'riwayat' ? 'active' : ''}`}
            onClick={() => setActiveTab('riwayat')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Semua Riwayat Pengajuan</span>
            <span style={{
              backgroundColor: '#e2e8f0',
              color: '#475569',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '1px 7px',
              borderRadius: '9999px'
            }}>
              {riwayatItems.length}
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 320px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIK, alasan..."
                className="form-control"
                style={{ paddingLeft: '34px', height: '36px', fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Divisi */}
            <select
              className="form-control"
              style={{ width: 'auto', height: '36px', fontSize: '0.825rem' }}
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
            >
              <option value="semua">Semua Divisi</option>
              {uniqueDivisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>

            {/* Filter Jenis */}
            <select
              className="form-control"
              style={{ width: 'auto', height: '36px', fontSize: '0.825rem' }}
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="semua">Semua Jenis</option>
              <option value="cuti_tahunan">Cuti Tahunan</option>
              <option value="sakit">Sakit</option>
              <option value="izin">Izin</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Menampilkan <strong>{displayedList.length}</strong> data
          </div>
        </div>

        {/* Table View dengan Lebar Kolom Terstruktur & Presisi */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '980px', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Pemohon & Divisi</th>
                <th style={{ width: '15%' }}>Jenis & Lampiran</th>
                <th style={{ width: '18%' }}>Jadwal Cuti</th>
                <th style={{ width: '11%', textAlign: 'center' }}>Sisa Kuota</th>
                <th style={{ width: '18%' }}>Keterangan / Alasan</th>
                <th style={{ width: '16%', textAlign: 'center' }}>Aksi / Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    Memuat data persetujuan...
                  </td>
                </tr>
              ) : displayedList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      {activeTab === 'antrean'
                        ? 'Tidak ada pengajuan yang menunggu keputusan Anda'
                        : 'Tidak ada data pengajuan dalam riwayat'}
                    </div>
                    <div style={{ fontSize: '0.8rem' }}>
                      {searchQuery || filterDivisi !== 'semua' || filterJenis !== 'semua'
                        ? 'Coba sesuaikan kata kunci atau filter pencarian Anda.'
                        : 'Seluruh permohonan telah diproses atau belum ada pengajuan baru.'}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedList.map(item => {
                  const sisa = kuotaMap[item.karyawan_id] !== undefined ? kuotaMap[item.karyawan_id] : '-';
                  const isWaitingForMe = filterAntrean(item);
                  const canHrdCancel = profile?.peran === 'hrd' && item.status === 'disetujui' && todayWIB < item.tanggal_mulai;

                  return (
                    <tr key={item.id}>
                      {/* 1. Pemohon & Divisi */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                          {item.karyawan?.nama_lengkap || '-'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          NIK: <code className="tabular-nums">{item.karyawan?.nik_karyawan}</code> • {item.karyawan?.divisi?.nama || '-'}
                        </div>
                      </td>

                      {/* 2. Jenis & Lampiran Dokumen */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: item.jenis === 'cuti_tahunan' ? '#eff6ff' : item.jenis === 'sakit' ? '#fef2f2' : '#f8fafc',
                            color: item.jenis === 'cuti_tahunan' ? '#1d4ed8' : item.jenis === 'sakit' ? '#b91c1c' : '#475569',
                            border: `1px solid ${item.jenis === 'cuti_tahunan' ? '#bfdbfe' : item.jenis === 'sakit' ? '#fecdd3' : '#e2e8f0'}`,
                            textTransform: 'capitalize'
                          }}>
                            {item.jenis.replace('_', ' ')}
                          </span>

                          {item.lampiran_path && (
                            <button
                              type="button"
                              onClick={() => handleOpenDoc(item.lampiran_path!)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563eb',
                                fontSize: '0.72rem',
                                padding: 0,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                textDecoration: 'underline'
                              }}
                            >
                              <FileText size={12} />
                              <span>Lihat Surat Dokter</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 3. Jadwal Cuti & Durasi */}
                      <td>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                          {formatTanggalIndo(item.tanggal_mulai)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          s/d {formatTanggalIndo(item.tanggal_selesai)} • <strong style={{ color: '#0f172a' }}>{item.jumlah_hari} hari</strong>
                        </div>
                      </td>

                      {/* 4. Sisa Kuota Cuti Tahunan */}
                      <td style={{ textAlign: 'center' }}>
                        {item.jenis === 'cuti_tahunan' ? (
                          <div className="tabular-nums" style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: typeof sisa === 'number' && sisa > 0 ? '#15803d' : '#dc2626'
                          }}>
                            {sisa} hari
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>

                      {/* 5. Alasan / Keterangan */}
                      <td>
                        <div
                          style={{
                            fontSize: '0.825rem',
                            color: '#334155',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={item.alasan}
                        >
                          {item.alasan}
                        </div>
                      </td>

                      {/* 6. Aksi Keputusan / Status Tahap */}
                      <td style={{ textAlign: 'center' }}>
                        {isWaitingForMe ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleAction(item.id, 'setujui')}
                              className="btn btn-sm btn-success"
                              disabled={submittingAction}
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              title="Setujui permohonan ini"
                            >
                              <CheckCircle2 size={14} />
                              <span>Setujui</span>
                            </button>

                            <button
                              onClick={() => {
                                setRejectingItem(item);
                                setAlasanPenolakan('');
                              }}
                              className="btn btn-sm btn-outline-danger"
                              disabled={submittingAction}
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                              title="Tolak permohonan ini dengan alasan wajib minimal 10 karakter"
                            >
                              <XCircle size={14} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : canHrdCancel ? (
                          <button
                            onClick={() => {
                              if (confirm('Batalkan pengajuan yang sudah disetujui ini? Kuota cuti akan dikembalikan ke karyawan.')) {
                                handleAction(item.id, 'batalkan_hrd');
                              }
                            }}
                            className="btn btn-sm btn-outline-danger"
                            disabled={submittingAction}
                            style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                            title="Batalkan cuti yang sudah disetujui sebelum tanggal mulai "
                          >
                            <Ban size={13} />
                            <span>Batalkan (HRD)</span>
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            {getStatusBadge(item.status)}
                            {item.karyawan_id === profile?.id ? (
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                                Pengajuan Sendiri
                              </span>
                            ) : item.status === 'diajukan' && item.perlu_atasan ? (
                              <span style={{ fontSize: '0.7rem', color: '#b45309' }}>
                                Menunggu Atasan
                              </span>
                            ) : item.disetujui_atasan ? (
                              <span style={{ fontSize: '0.7rem', color: '#0369a1' }}>
                                Atasan: {item.disetujui_atasan.nama_lengkap}
                              </span>
                            ) : null}
                          </div>
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

      {/* Modal Penolakan (Wajib alasan minimal 10 karakter) */}
      {rejectingItem && (
        <div className="modal-overlay" onClick={() => setRejectingItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#dc2626' }}>
                Tolak Pengajuan Cuti
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Pemohon:</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{rejectingItem.karyawan?.nama_lengkap}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  {rejectingItem.jenis.replace('_', ' ').toUpperCase()} • {rejectingItem.jumlah_hari} hari kerja ({formatTanggalIndo(rejectingItem.tanggal_mulai)} s/d {formatTanggalIndo(rejectingItem.tanggal_selesai)})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Alasan Penolakan <span style={{ color: '#dc2626' }}>* (Wajib minimal 10 karakter)</span>
                </label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '90px' }}
                  placeholder="Tuliskan alasan penolakan secara jelas dan profesional..."
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  required
                />
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: alasanPenolakan.trim().length >= 10 ? '#16a34a' : '#dc2626',
                  marginTop: '5px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{alasanPenolakan.trim().length >= 10 ? '✓ Panjang karakter terpenuhi' : 'Karakter belum mencukupi'}</span>
                  <span>{alasanPenolakan.trim().length} / 10 karakter minimum</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRejectingItem(null)}
                disabled={submittingAction}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={submittingAction || alasanPenolakan.trim().length < 10}
                onClick={() => handleAction(rejectingItem.id, 'tolak', alasanPenolakan.trim())}
              >
                {submittingAction ? 'Memproses...' : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Surat Dokter */}
      {viewDocPath && (
        <div className="modal-overlay" onClick={() => setViewDocPath(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                Lampiran Surat Dokter
              </h3>
              <button
                onClick={() => setViewDocPath(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ textAlign: 'center', backgroundColor: '#f8fafc', padding: '24px' }}>
              {docUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={docUrl}
                    alt="Lampiran Surat Dokter"
                    style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Buka File Asli di Tab Baru ↗
                  </a>
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  Berkas surat dokter: <code>{viewDocPath}</code>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setViewDocPath(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
