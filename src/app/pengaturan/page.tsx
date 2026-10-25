'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import {
  Settings,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Search
} from 'lucide-react';
import { Divisi, Profile, HariLibur, KuotaCuti, AuditLog } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, formatJamWIB, formatRupiah } from '@/lib/wib';

export default function PengaturanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'divisi' | 'libur' | 'kuota' | 'audit'>('divisi');

  // Data states
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [atasanOptions, setAtasanOptions] = useState<Profile[]>([]);
  const [hariLiburList, setHariLiburList] = useState<HariLibur[]>([]);
  const [kuotaList, setKuotaList] = useState<(KuotaCuti & { karyawan?: Profile })[]>([]);
  const [auditLogs, setAuditLogs] = useState<(AuditLog & { pelaku?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  // Divisi Manager Edit Modal
  const [editingDivisi, setEditingDivisi] = useState<Divisi | null>(null);
  const [selectedManajerId, setSelectedManajerId] = useState('');

  // Add Hari Libur Modal
  const [showAddLibur, setShowAddLibur] = useState(false);
  const [liburTanggal, setLiburTanggal] = useState('');
  const [liburKeterangan, setLiburKeterangan] = useState('');
  const [liburJenis, setLiburJenis] = useState<'nasional' | 'cuti_bersama' | 'perusahaan'>('nasional');

  // Edit Kuota Modal
  const [editingKuota, setEditingKuota] = useState<(KuotaCuti & { karyawan?: Profile }) | null>(null);
  const [newJatahHari, setNewJatahHari] = useState<number>(12);

  // Audit Log Filters & Detail Modal
  const [auditAksiFilter, setAuditAksiFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<(AuditLog & { pelaku?: Profile }) | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const [modalLoading, setModalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!prof || prof.peran !== 'hrd') return;
      setProfile(prof as Profile);

      // 1. Load Divisi dengan manajer
      const { data: divs } = await supabase
        .from('divisi')
        .select('*, manajer:manajer_id(id, nama_lengkap)')
        .order('nama');
      setDivisiList((divs || []) as Divisi[]);

      // Load kandidat Atasan (peran = 'atasan' & aktif = true)
      const { data: atasans } = await supabase
        .from('profiles')
        .select('*')
        .eq('peran', 'atasan')
        .eq('aktif', true);
      setAtasanOptions((atasans || []) as Profile[]);

      // 2. Load Hari Libur
      const { data: hl } = await supabase.from('hari_libur').select('*').order('tanggal');
      setHariLiburList((hl || []) as HariLibur[]);

      // 3. Load Kuota Cuti
      const { data: kc } = await supabase
        .from('kuota_cuti')
        .select('*, karyawan:karyawan_id(id, nama_lengkap, nik_karyawan, jabatan, divisi:divisi_id(nama))')
        .eq('tahun', 2026)
        .order('id');
      setKuotaList((kc || []) as (KuotaCuti & { karyawan?: Profile })[]);

      // 4. Load Audit Log (Seksi 7 & BR-12)
      const { data: logs } = await supabase
        .from('audit_log')
        .select('*, pelaku:pelaku_id(id, nama_lengkap, nik_karyawan)')
        .order('dibuat_pada', { ascending: false })
        .limit(100);
      setAuditLogs((logs || []) as (AuditLog & { pelaku?: Profile })[]);

    } catch (err) {
      console.error('Error load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateManajer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivisi) return;

    setModalLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/pengaturan/divisi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisiId: editingDivisi.id,
          manajerId: selectedManajerId || null
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: resData.message });
        setTimeout(() => {
          setEditingDivisi(null);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddLibur = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/pengaturan/libur', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: liburTanggal,
          keterangan: liburKeterangan.trim(),
          jenis: liburJenis
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: resData.message });
        setTimeout(() => {
          setShowAddLibur(false);
          setLiburTanggal('');
          setLiburKeterangan('');
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateKuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKuota) return;

    setModalLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/pengaturan/kuota', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kuotaId: editingKuota.id,
          jatahHari: newJatahHari
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: resData.message });
        setTimeout(() => {
          setEditingKuota(null);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setModalLoading(false);
    }
  };

  // Filter Audit Log
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchAksi = auditAksiFilter === 'all' || log.aksi === auditAksiFilter;
    const matchSearch = log.aksi.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.nama_tabel.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.pelaku?.nama_lengkap || '').toLowerCase().includes(auditSearch.toLowerCase());
    return matchAksi && matchSearch;
  });

  // Helper Formatter Audit Log (Human-Readable Enterprise Standard)
  const getIndonesianAksiLabel = (aksi: string): string => {
    const map: Record<string, string> = {
      cuti_update: 'Pembaruan Cuti',
      cuti_insert: 'Pengajuan Cuti Baru',
      slip_terbit: 'Penerbitan Slip Gaji',
      slip_update: 'Pembaruan Slip Gaji',
      koreksi_absensi_insert: 'Pengajuan Koreksi Absensi',
      koreksi_absensi_update: 'Persetujuan Koreksi Absensi',
      karyawan_update: 'Pembaruan Data Karyawan',
      kuota_update: 'Pembaruan Jatah Cuti',
      divisi_update: 'Pembaruan Manajer Divisi',
      libur_insert: 'Penambahan Hari Libur',
      libur_delete: 'Penghapusan Hari Libur',
    };
    return map[aksi] || aksi.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIndonesianTabelLabel = (namaTabel: string): string => {
    const map: Record<string, string> = {
      pengajuan_cuti: 'Pengajuan Cuti',
      slip_gaji: 'Slip Gaji',
      kuota_cuti: 'Kuota Cuti',
      absensi: 'Presensi Harian',
      koreksi_absensi: 'Koreksi Presensi',
      profiles: 'Profil Karyawan',
      hari_libur: 'Hari Libur',
      divisi: 'Divisi Perusahaan',
    };
    return map[namaTabel] || namaTabel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderTabelBadge = (namaTabel: string): React.ReactNode => {
    const colorMap: Record<string, { bg: string; color: string; border: string }> = {
      pengajuan_cuti: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
      slip_gaji: { bg: '#eef2ff', color: '#3730a3', border: '#c7d2fe' },
      kuota_cuti: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      absensi: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
      koreksi_absensi: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
      profiles: { bg: '#f8fafc', color: '#334155', border: '#cbd5e1' },
      hari_libur: { bg: '#fdf2f8', color: '#9d174d', border: '#fbcfe8' },
      divisi: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
    };

    const style = colorMap[namaTabel] || { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };

    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          whiteSpace: 'nowrap'
        }}>
          {getIndonesianTabelLabel(namaTabel)}
        </span>
        <span style={{ fontSize: '0.675rem', color: '#94a3b8', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          {namaTabel}
        </span>
      </div>
    );
  };

  const getIndonesianKeyLabel = (key: string): string => {
    const map: Record<string, string> = {
      status: 'Status',
      jatah_hari: 'Jatah Cuti Tahunan',
      terpakai_hari: 'Hari Cuti Terpakai',
      nomor_slip: 'Nomor Slip Resmi',
      gaji_pokok: 'Gaji Pokok',
      tunjangan: 'Tunjangan',
      potongan: 'Potongan',
      total_diterima: 'Total Diterima',
      catatan_atasan: 'Catatan Atasan',
      catatan_hrd: 'Catatan HRD',
      alasan: 'Alasan Pengajuan',
      alasan_tolak: 'Alasan Penolakan',
      keterangan: 'Keterangan',
      tanggal: 'Tanggal',
      tanggal_mulai: 'Tanggal Mulai',
      tanggal_selesai: 'Tanggal Selesai',
      jam_masuk: 'Jam Masuk',
      jam_pulang: 'Jam Pulang',
      peran: 'Peran Akun',
      aktif: 'Status Akun Aktif',
      jabatan: 'Jabatan',
      divisi_id: 'ID Divisi',
      manajer_id: 'ID Manajer Divisi',
      karyawan_id: 'ID Karyawan',
      pelaku_id: 'ID Pelaku',
      tahun: 'Tahun',
      jumlah_hari: 'Jumlah Hari Kerja',
      periode: 'Periode Gaji',
      jenis: 'Jenis Cuti/Libur',
      diputuskan_hrd_oleh: 'Diputuskan Oleh HRD',
      disetujui_atasan_oleh: 'Diverifikasi Oleh Atasan'
    };
    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAuditValue = (val: unknown, key?: string): React.ReactNode => {
    if (val === null || val === undefined) {
      return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Kosong</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <span className={`badge ${val ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>
          {val ? 'Aktif' : 'Nonaktif'}
        </span>
      );
    }
    if (typeof val === 'number') {
      const k = (key || '').toLowerCase();
      if (k.includes('gaji') || k.includes('tunjangan') || k.includes('potongan') || k.includes('total_diterima') || k.includes('nominal')) {
        return <strong>{formatRupiah(val)}</strong>;
      }
      if (k.includes('hari')) {
        return <strong>{val} Hari</strong>;
      }
      return <span style={{ fontWeight: 600 }}>{val}</span>;
    }
    if (typeof val === 'string') {
      const statusMap: Record<string, { label: string; badge: string }> = {
        diajukan: { label: 'Diajukan', badge: 'badge-neutral' },
        disetujui_atasan: { label: 'Disetujui Atasan (Tahap 1)', badge: 'badge-warning' },
        disetujui: { label: 'Disetujui Resmi HRD', badge: 'badge-success' },
        ditolak: { label: 'Ditolak', badge: 'badge-danger' },
        draf: { label: 'Draf', badge: 'badge-neutral' },
        terbit: { label: 'Terbit Resmi', badge: 'badge-success' },
        hadir: { label: 'Hadir Tepat Waktu', badge: 'badge-success' },
        terlambat: { label: 'Terlambat', badge: 'badge-warning' },
        cuti: { label: 'Cuti Resmi', badge: 'badge-info' },
        cuti_tahunan: { label: 'Cuti Tahunan', badge: 'badge-info' },
        sakit: { label: 'Sakit', badge: 'badge-warning' },
        izin: { label: 'Izin', badge: 'badge-neutral' },
        nasional: { label: 'Libur Nasional', badge: 'badge-neutral' },
        cuti_bersama: { label: 'Cuti Bersama', badge: 'badge-info' },
        perusahaan: { label: 'Libur Perusahaan', badge: 'badge-primary' }
      };
      if (statusMap[val]) {
        return (
          <span className={`badge ${statusMap[val].badge}`} style={{ fontWeight: 700 }}>
            {statusMap[val].label}
          </span>
        );
      }
      if (val.length === 36 && val.includes('-')) {
        return <code style={{ fontSize: '0.75rem', color: '#64748b' }}>{val.substring(0, 8)}...</code>;
      }
      return <span style={{ fontWeight: 500 }}>{val}</span>;
    }
    if (typeof val === 'object') {
      return <code style={{ fontSize: '0.75rem' }}>{JSON.stringify(val)}</code>;
    }
    return String(val);
  };

  const renderAuditSummaryInTable = (log: AuditLog & { pelaku?: Profile }): React.ReactNode => {
    const sesudah = log.nilai_sesudah as Record<string, unknown> | null;
    const sebelum = log.nilai_sebelum as Record<string, unknown> | null;

    if (!sesudah || Object.keys(sesudah).length === 0) {
      return <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Tidak ada nilai spesifik</span>;
    }

    // 1. Cuti Update (Status transition)
    if (log.aksi === 'cuti_update' || (sesudah.status && !sesudah.nomor_slip)) {
      const stSebelum = String(sebelum?.status || '');
      const stSesudah = String(sesudah.status || '');
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {stSebelum && (
            <>
              {formatAuditValue(stSebelum, 'status')}
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
            </>
          )}
          {formatAuditValue(stSesudah, 'status')}
          {Boolean(sesudah.catatan_hrd) && (
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>
              ({String(sesudah.catatan_hrd)})
            </span>
          )}
        </div>
      );
    }

    // 2. Slip Terbit / Update
    if (log.aksi === 'slip_terbit' || log.aksi === 'slip_update' || sesudah.nomor_slip) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span className="badge badge-success" style={{ fontWeight: 700 }}>
            Terbit Resmi: {String(sesudah.nomor_slip || 'SG-Resmi')}
          </span>
          {sesudah.total_diterima !== undefined && (
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>
              {formatRupiah(Number(sesudah.total_diterima))}
            </span>
          )}
        </div>
      );
    }

    // 3. Kuota Update
    if (log.aksi === 'kuota_update' || sesudah.jatah_hari !== undefined) {
      const jatahSebelum = sebelum?.jatah_hari;
      const jatahSesudah = sesudah.jatah_hari;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Jatah Cuti:</span>
          {jatahSebelum !== undefined && (
            <>
              <strong>{String(jatahSebelum)} Hari</strong>
              <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
            </>
          )}
          <span className="badge badge-info" style={{ fontWeight: 700 }}>
            {String(jatahSesudah)} Hari Kerja
          </span>
        </div>
      );
    }

    // 4. Koreksi Absensi
    if (log.aksi.includes('koreksi')) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {Boolean(sesudah.status) && formatAuditValue(sesudah.status, 'status')}
          {Boolean(sesudah.alasan) && (
            <span style={{ fontSize: '0.8rem', color: '#334155' }}>
              {String(sesudah.alasan)}
            </span>
          )}
        </div>
      );
    }

    // 5. Default generic clean summary
    const entries = Object.entries(sesudah).filter(([k]) => k !== 'id' && !k.endsWith('_id'));
    if (entries.length === 0) {
      return (
        <div style={{ fontSize: '0.775rem', color: '#475569' }}>
          {Object.keys(sesudah).length} atribut diperbarui
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {entries.slice(0, 2).map(([k, v]) => (
          <span key={k} style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #e2e8f0'
          }}>
            <strong>{getIndonesianKeyLabel(k)}:</strong> {typeof v === 'object' ? '...' : String(v)}
          </span>
        ))}
        {entries.length > 2 && (
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{entries.length - 2} lainnya</span>
        )}
      </div>
    );
  };

  return (
    <AppShell title="Pengaturan Sistem (HRD)">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Pengaturan Perusahaan & Audit Log</h1>
        <p className="page-subtitle">
          Kelola divisi & atasan, hari libur, kuota cuti tahunan, dan audit log jejak
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'divisi' ? 'active' : ''}`}
          onClick={() => setActiveTab('divisi')}
        >
          Divisi & Atasan
        </button>
        <button
          className={`tab-btn ${activeTab === 'libur' ? 'active' : ''}`}
          onClick={() => setActiveTab('libur')}
        >
          Daftar Hari Libur ({hariLiburList.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'kuota' ? 'active' : ''}`}
          onClick={() => setActiveTab('kuota')}
        >
          Jatah Cuti Karyawan
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Log
        </button>
      </div>

      {/* TAB 1: DIVISI & MANAJER */}
      {activeTab === 'divisi' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Daftar Divisi dan Manajer (Atasan)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Setiap divisi dipimpin paling banyak satu Atasan, dan satu Atasan hanya memimpin satu divisi
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Divisi</th>
                  <th>Manajer (Atasan) Divisi</th>
                  <th>Status Kepemimpinan</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {divisiList.map(d => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>{d.nama}</td>
                    <td>
                      {d.manajer ? (
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{d.manajer.nama_lengkap}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Belum ada atasan (langsung HRD)</span>
                      )}
                    </td>
                    <td>
                      {d.manajer ? (
                        <span className="badge badge-success">Aktif Memimpin</span>
                      ) : (
                        <span className="badge badge-neutral">Kosong (Tahap 1 Dilewati)</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingDivisi(d);
                          setSelectedManajerId(d.manajer_id || '');
                          setMessage(null);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit size={14} />
                        <span>Pilih Atasan</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DAFTAR HARI LIBUR */}
      {activeTab === 'libur' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Daftar Hari Libur Resmi</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tanggal yang dilewati saat menghitung hari kerja cuti dan absensi
              </p>
            </div>
            <button
              onClick={() => { setShowAddLibur(true); setMessage(null); }}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} />
              <span>Tambah Hari Libur</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan Hari Libur</th>
                  <th>Jenis Libur</th>
                </tr>
              </thead>
              <tbody>
                {hariLiburList.map(h => (
                  <tr key={h.tanggal}>
                    <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{formatTanggalIndo(h.tanggal)}</td>
                    <td style={{ fontWeight: 600 }}>{h.keterangan}</td>
                    <td>
                      <span className={`badge ${h.jenis === 'nasional' ? 'badge-primary' : h.jenis === 'cuti_bersama' ? 'badge-info' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                        {h.jenis.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JATAH KUOTA CUTI KARYAWAN */}
      {activeTab === 'kuota' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Jatah Cuti Karyawan Tahun 2026</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Setiap karyawan mendapat jatah cuti tahunan paling banyak 12 hari kerja per tahun kalender
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>Divisi</th>
                  <th>Jabatan</th>
                  <th>Jatah Hari</th>
                  <th>Terpakai</th>
                  <th>Sisa Kuota</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kuotaList.map(k => {
                  const sisa = Math.max(0, k.jatah_hari - k.terpakai_hari);
                  return (
                    <tr key={k.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{k.karyawan?.nama_lengkap}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.karyawan?.nik_karyawan}</div>
                      </td>
                      <td>{k.karyawan?.divisi?.nama || '-'}</td>
                      <td>{k.karyawan?.jabatan}</td>
                      <td>
                        <strong>{k.jatah_hari} Hari</strong>
                      </td>
                      <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {k.terpakai_hari} Hari
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: sisa > 0 ? '#4f46e5' : '#dc2626' }}>
                          {sisa} Hari
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setEditingKuota(k);
                            setNewJatahHari(k.jatah_hari);
                            setMessage(null);
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit size={14} />
                          <span>Ubah Jatah</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Jejak Aksi Sensitif (Audit Log)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Audit log tidak bisa diubah atau dihapus oleh siapa pun lewat aplikasi
              </p>
            </div>
            <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>Read-Only & Tamper-Proof</span>
            </span>
          </div>

          {/* Audit Filters */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '32px' }}
                placeholder="Cari aksi, tabel, atau nama pelaku..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '260px' }}
              value={auditAksiFilter}
              onChange={(e) => setAuditAksiFilter(e.target.value)}
            >
              <option value="all">Semua Jenis Aksi</option>
              <option value="cuti_update">Pembaruan Cuti (cuti_update)</option>
              <option value="slip_terbit">Penerbitan Slip Gaji (slip_terbit)</option>
              <option value="koreksi_absensi_insert">Pengajuan Koreksi (koreksi_absensi)</option>
              <option value="karyawan_update">Pembaruan Karyawan (karyawan_update)</option>
              <option value="kuota_update">Pembaruan Jatah Cuti (kuota_update)</option>
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Waktu Aksi (WIB)</th>
                  <th>Pelaku</th>
                  <th>Nama Aksi</th>
                  <th>Objek Data Sasaran</th>
                  <th>Rincian Perubahan Data</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      Tidak ada log yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedAuditLog(log)}
                      style={{ cursor: 'pointer' }}
                      title="Klik untuk melihat rincian komparasi nilai data"
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>#{log.id}</td>
                      <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{formatJamWIB(log.dibuat_pada)}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{formatTanggalIndo(log.dibuat_pada)}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{log.pelaku?.nama_lengkap || 'Sistem Otomatis'}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                          {getIndonesianAksiLabel(log.aksi)}
                        </span>
                      </td>
                      <td>
                        {renderTabelBadge(log.nama_tabel)}
                      </td>
                      <td>
                        {renderAuditSummaryInTable(log)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAuditLog(log);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 700, padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          Rincian →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Manajer Divisi */}
      {editingDivisi && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Pilih Atasan Divisi {editingDivisi.nama}</h3>
              <button onClick={() => setEditingDivisi(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateManajer}>
              <div className="modal-body">
                {message && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {message.text}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Pilih Manajer:</label>
                  <select
                    className="form-control"
                    value={selectedManajerId}
                    onChange={(e) => setSelectedManajerId(e.target.value)}
                  >
                    <option value="">-- Kosongkan Manajer (Tanpa Atasan) --</option>
                    {atasanOptions.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nama_lengkap} ({a.nik_karyawan})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingDivisi(null)} disabled={modalLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Menyimpan...' : 'Simpan Manajer Divisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Hari Libur */}
      {showAddLibur && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tambah Hari Libur Baru</h3>
              <button onClick={() => setShowAddLibur(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddLibur}>
              <div className="modal-body">
                {message && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {message.text}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tanggal Libur</label>
                  <input
                    type="date"
                    className="form-control"
                    value={liburTanggal}
                    onChange={(e) => setLiburTanggal(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Keterangan Hari Libur</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Hari Ulang Tahun Perusahaan"
                    value={liburKeterangan}
                    onChange={(e) => setLiburKeterangan(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Jenis Libur</label>
                  <select
                    className="form-control"
                    value={liburJenis}
                    onChange={(e) => setLiburJenis(e.target.value as 'nasional' | 'cuti_bersama' | 'perusahaan')}
                  >
                    <option value="nasional">Nasional</option>
                    <option value="cuti_bersama">Cuti Bersama</option>
                    <option value="perusahaan">Libur Perusahaan</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLibur(false)} disabled={modalLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Menyimpan...' : 'Simpan Hari Libur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Jatah Cuti */}
      {editingKuota && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Ubah Jatah Cuti Tahunan</h3>
              <button onClick={() => setEditingKuota(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateKuota}>
              <div className="modal-body">
                {message && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {message.text}
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{editingKuota.karyawan?.nama_lengkap}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Hari Terpakai Saat Ini: {editingKuota.terpakai_hari} hari
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Jatah Hari Cuti Baru
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    className="form-control"
                    value={newJatahHari}
                    onChange={(e) => setNewJatahHari(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingKuota(null)} disabled={modalLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading ? 'Menyimpan...' : 'Simpan Perubahan & Catat Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Jejak Audit Log (Human-Readable Enterprise Standard) */}
      {selectedAuditLog && (
        <div className="modal-overlay" onClick={() => setSelectedAuditLog(null)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Rincian Perubahan Data Audit Log #{selectedAuditLog.id}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Pencatatan resmi aksi sensitif sistem (read-only & tamper-proof)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Ringkasan Metadata Aksi */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                padding: '14px 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Waktu Pencatatan:</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {formatJamWIB(selectedAuditLog.dibuat_pada)} - {formatTanggalIndo(selectedAuditLog.dibuat_pada)}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Pelaku Aksi:</span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {selectedAuditLog.pelaku?.nama_lengkap || 'Sistem / Otomatis'}
                    {Boolean(selectedAuditLog.pelaku?.jabatan) && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                        ({selectedAuditLog.pelaku?.jabatan})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Nama Aksi:</span>
                  <div style={{ marginTop: '2px' }}>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                      {getIndonesianAksiLabel(selectedAuditLog.aksi)}
                    </span>
                    <code style={{ fontSize: '0.725rem', color: '#64748b', marginLeft: '6px' }}>
                      ({selectedAuditLog.aksi})
                    </code>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Objek Data & Tabel Target:</span>
                  <div style={{ fontSize: '0.825rem', color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {getIndonesianTabelLabel(selectedAuditLog.nama_tabel)}
                    </span>
                    <code>{selectedAuditLog.nama_tabel}</code>
                    {selectedAuditLog.data_id && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }} title={selectedAuditLog.data_id}>
                        [ID: {selectedAuditLog.data_id.substring(0, 8)}...]
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Komparasi Nilai Data: Sebelum vs Sesudah */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', color: '#1e293b' }}>
                  Komparasi Nilai Data (Sebelum vs Sesudah)
                </h4>

                <div className="grid-2" style={{ gap: '14px' }}>
                  {/* Nilai Sebelum */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '10px',
                      paddingBottom: '6px',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      Nilai Sebelum Perubahan
                    </div>

                    {!selectedAuditLog.nilai_sebelum || Object.keys(selectedAuditLog.nilai_sebelum).length === 0 ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.825rem', padding: '12px 0' }}>
                        Tidak ada nilai sebelumnya (Entri Baru dibuat)
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(selectedAuditLog.nilai_sebelum).map(([k, v]) => (
                          <div key={k} style={{
                            padding: '6px 8px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '6px',
                            border: '1px solid #f1f5f9'
                          }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                              {getIndonesianKeyLabel(k)}
                            </div>
                            <div style={{ marginTop: '2px', fontSize: '0.85rem' }}>
                              {formatAuditValue(v, k)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nilai Sesudah */}
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '14px'
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#166534',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '10px',
                      paddingBottom: '6px',
                      borderBottom: '1px solid #dcfce7'
                    }}>
                      Nilai Sesudah Perubahan (Tercatat)
                    </div>

                    {!selectedAuditLog.nilai_sesudah || Object.keys(selectedAuditLog.nilai_sesudah).length === 0 ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.825rem', padding: '12px 0' }}>
                        Tidak ada rincian data sesudah
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.entries(selectedAuditLog.nilai_sesudah).map(([k, v]) => {
                          const isChanged = selectedAuditLog.nilai_sebelum && selectedAuditLog.nilai_sebelum[k] !== v;
                          return (
                            <div key={k} style={{
                              padding: '6px 8px',
                              backgroundColor: isChanged ? '#dcfce7' : '#ffffff',
                              borderRadius: '6px',
                              border: isChanged ? '1px solid #86efac' : '1px solid #e2e8f0'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>
                                  {getIndonesianKeyLabel(k)}
                                </span>
                                {isChanged && (
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                                    Diperbarui
                                  </span>
                                )}
                              </div>
                              <div style={{ marginTop: '2px', fontSize: '0.85rem' }}>
                                {formatAuditValue(v, k)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Format Mentah Teknis (JSON) - Expandable */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowRawJson(!showRawJson)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showRawJson ? '▲ Sembunyikan Format Kode Mentah (JSON)' : '▼ Tampilkan Format Kode Mentah (JSON)'}
                </button>

                {showRawJson && (
                  <pre style={{
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {JSON.stringify(
                      {
                        sebelum: selectedAuditLog.nilai_sebelum,
                        sesudah: selectedAuditLog.nilai_sesudah
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedAuditLog(null)}
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
