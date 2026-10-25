'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Clock, Filter, Edit3, CheckCircle2, AlertCircle, X, Search } from 'lucide-react';
import { Absensi, Profile, Divisi } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, formatJamWIB } from '@/lib/wib';

export default function AbsensiPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'sendiri' | 'tim' | 'semua'>('sendiri');

  // Filter states
  const [selectedBulan, setSelectedBulan] = useState('2026-10'); // Default bulan data contoh
  const [selectedDivisi, setSelectedDivisi] = useState('all');
  const [searchNama, setSearchNama] = useState('');

  // Data states
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [absensiList, setAbsensiList] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Koreksi (HRD)
  const [selectedAbsen, setSelectedAbsen] = useState<Absensi | null>(null);
  const [koreksiJamMasuk, setKoreksiJamMasuk] = useState('');
  const [koreksiJamPulang, setKoreksiJamPulang] = useState('');
  const [koreksiStatus, setKoreksiStatus] = useState<'hadir' | 'terlambat'>('hadir');
  const [alasanKoreksi, setAlasanKoreksi] = useState('');
  const [savingKoreksi, setSavingKoreksi] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClient();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*, divisi:divisi_id(id, nama)')
        .eq('id', user.id)
        .single();

      if (!prof) return;
      setProfile(prof as Profile);

      // Load Divisi list untuk filter
      const { data: divs } = await supabase.from('divisi').select('*').order('nama');
      setDivisiList((divs || []) as Divisi[]);

      // Query data absensi berdasarkan tab aktif
      const startOfMonth = `${selectedBulan}-01`;
      const endOfMonth = `${selectedBulan}-31`;

      let query = supabase
        .from('absensi')
        .select('*, karyawan:karyawan_id(id, nama_lengkap, nik_karyawan, jabatan, divisi_id, divisi:divisi_id(nama)), dikoreksi:dikoreksi_oleh(nama_lengkap)')
        .gte('tanggal', startOfMonth)
        .lte('tanggal', endOfMonth)
        .order('tanggal', { ascending: false });

      if (activeTab === 'sendiri') {
        query = query.eq('karyawan_id', user.id);
      } else if (activeTab === 'tim') {
        // Hanya anggota divisi atasan
        if (prof.divisi_id) {
          const { data: teamProfs } = await supabase
            .from('profiles')
            .select('id')
            .eq('divisi_id', prof.divisi_id);
          const teamIds = (teamProfs || []).map(p => p.id);
          query = query.in('karyawan_id', teamIds);
        }
      } else if (activeTab === 'semua' && prof.peran === 'hrd') {
        // Semua karyawan, filter divisi jika dipilih
        if (selectedDivisi !== 'all') {
          const { data: divProfs } = await supabase
            .from('profiles')
            .select('id')
            .eq('divisi_id', selectedDivisi);
          const divIds = (divProfs || []).map(p => p.id);
          query = query.in('karyawan_id', divIds);
        }
      }

      const { data: results, error } = await query;
      if (error) console.error('Error fetching absensi:', error.message);
      setAbsensiList((results || []) as Absensi[]);

    } catch (err) {
      console.error('Error load absensi page:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedBulan, selectedDivisi, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openKoreksiModal = (absen: Absensi) => {
    setSelectedAbsen(absen);
    // Format ISO string to time format HH:mm:ss for input
    const getLocalTime = (iso: string | null) => {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toTimeString().split(' ')[0];
    };
    setKoreksiJamMasuk(getLocalTime(absen.jam_masuk));
    setKoreksiJamPulang(getLocalTime(absen.jam_pulang));
    setKoreksiStatus(absen.status);
    setAlasanKoreksi(absen.alasan_koreksi || '');
    setModalMessage(null);
  };

  const handleSimpanKoreksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsen) return;

    if (alasanKoreksi.trim().length < 10) {
      setModalMessage({ type: 'error', text: 'Alasan koreksi wajib minimal 10 karakter' });
      return;
    }

    setSavingKoreksi(true);
    setModalMessage(null);

    try {
      // Rekonstruksi ISO timestamp dengan tanggal absensi + waktu koreksi WIB
      const isoMasuk = `${selectedAbsen.tanggal}T${koreksiJamMasuk}+07:00`;
      const isoPulang = koreksiJamPulang ? `${selectedAbsen.tanggal}T${koreksiJamPulang}+07:00` : null;

      const res = await fetch('/api/absensi/koreksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          absensiId: selectedAbsen.id,
          jamMasuk: new Date(isoMasuk).toISOString(),
          jamPulang: isoPulang ? new Date(isoPulang).toISOString() : null,
          status: koreksiStatus,
          alasanKoreksi: alasanKoreksi.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setModalMessage({ type: 'error', text: data.message });
      } else {
        setModalMessage({ type: 'success', text: 'Koreksi berhasil disimpan!' });
        setTimeout(() => {
          setSelectedAbsen(null);
          loadData();
        }, 1200);
      }
    } catch {
      setModalMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setSavingKoreksi(false);
    }
  };

  // Filter pencarian nama karyawan
  const filteredAbsensi = absensiList.filter(a => {
    if (!searchNama) return true;
    const nama = a.karyawan?.nama_lengkap?.toLowerCase() || '';
    const nik = a.karyawan?.nik_karyawan?.toLowerCase() || '';
    const q = searchNama.toLowerCase();
    return nama.includes(q) || nik.includes(q);
  });

  return (
    <AppShell title="Absensi Karyawan">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Rekapitulasi Kehadiran</h1>
        <p className="page-subtitle">
          Catatan check-in dan check-out harian berbasis jam server WIB
        </p>
      </div>

      {/* Navigation Tabs Berdasarkan Peran */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'sendiri' ? 'active' : ''}`}
          onClick={() => setActiveTab('sendiri')}
        >
          Presensi Saya
        </button>

        {profile?.peran && ['atasan', 'hrd'].includes(profile.peran) && (
          <button
            className={`tab-btn ${activeTab === 'tim' ? 'active' : ''}`}
            onClick={() => setActiveTab('tim')}
          >
            Presensi Tim Divisi
          </button>
        )}

        {profile?.peran === 'hrd' && (
          <button
            className={`tab-btn ${activeTab === 'semua' ? 'active' : ''}`}
            onClick={() => setActiveTab('semua')}
          >
            Semua Karyawan (Kelola HRD)
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Filter Bulan */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Periode:</span>
            <input
              type="month"
              className="form-control"
              style={{ width: '160px', padding: '6px 12px' }}
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
            />
          </div>

          {/* Filter Divisi (Khusus HRD di tab Semua) */}
          {activeTab === 'semua' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Divisi:</span>
              <select
                className="form-control"
                style={{ width: '200px', padding: '6px 12px' }}
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
              >
                <option value="all">Semua Divisi</option>
                {divisiList.map(d => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>
          )}

          {/* Pencarian Nama Karyawan */}
          {activeTab !== 'sendiri' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '32px', padding: '6px 12px 6px 32px' }}
                  placeholder="Cari nama atau NIK karyawan..."
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Data Absensi */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {activeTab !== 'sendiri' && <th>Karyawan</th>}
              {activeTab !== 'sendiri' && <th>Divisi</th>}
              <th>Tanggal</th>
              <th>Jam Masuk</th>
              <th>Jam Pulang</th>
              <th>Status</th>
              <th>Koreksi HRD</th>
              {profile?.peran === 'hrd' && <th style={{ textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Memuat data absensi...
                </td>
              </tr>
            ) : filteredAbsensi.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Tidak ada catatan absensi untuk kriteria yang dipilih.
                </td>
              </tr>
            ) : (
              filteredAbsensi.map(absen => (
                <tr key={absen.id}>
                  {activeTab !== 'sendiri' && (
                    <td>
                      <div style={{ fontWeight: 600 }}>{absen.karyawan?.nama_lengkap || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{absen.karyawan?.nik_karyawan}</div>
                    </td>
                  )}
                  {activeTab !== 'sendiri' && (
                    <td>{absen.karyawan?.divisi?.nama || '-'}</td>
                  )}
                  <td style={{ fontWeight: 600 }}>{formatTanggalIndo(absen.tanggal)}</td>
                  <td>{formatJamWIB(absen.jam_masuk)}</td>
                  <td>{formatJamWIB(absen.jam_pulang)}</td>
                  <td>
                    <span className={`badge ${absen.status === 'hadir' ? 'badge-success' : 'badge-warning'}`}>
                      {absen.status === 'hadir' ? 'Hadir' : 'Terlambat'}
                    </span>
                  </td>
                  <td>
                    {absen.dikoreksi_oleh ? (
                      <div>
                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>Hasil Koreksi</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }} title={absen.alasan_koreksi || ''}>
                          {absen.alasan_koreksi || 'Alasan tercatat'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>
                    )}
                  </td>
                  {profile?.peran === 'hrd' && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openKoreksiModal(absen)}
                        className="btn btn-secondary btn-sm"
                        title="Koreksi data absensi ini"
                      >
                        <Edit3 size={14} />
                        <span>Koreksi</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Koreksi Absensi */}
      {selectedAbsen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Koreksi Absensi (HRD)
              </h3>
              <button
                onClick={() => setSelectedAbsen(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSimpanKoreksi}>
              <div className="modal-body">
                {modalMessage && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: modalMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: modalMessage.type === 'success' ? '#065f46' : '#991b1b',
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {modalMessage.text}
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Karyawan:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedAbsen.karyawan?.nama_lengkap}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Tanggal: {formatTanggalIndo(selectedAbsen.tanggal)}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Jam Masuk (WIB)</label>
                    <input
                      type="time"
                      step="1"
                      className="form-control"
                      value={koreksiJamMasuk}
                      onChange={(e) => setKoreksiJamMasuk(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jam Pulang (WIB)</label>
                    <input
                      type="time"
                      step="1"
                      className="form-control"
                      value={koreksiJamPulang}
                      onChange={(e) => setKoreksiJamPulang(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Kehadiran</label>
                  <select
                    className="form-control"
                    value={koreksiStatus}
                    onChange={(e) => setKoreksiStatus(e.target.value as 'hadir' | 'terlambat')}
                  >
                    <option value="hadir">Hadir (Tepat Waktu)</option>
                    <option value="terlambat">Terlambat</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Alasan Koreksi <span style={{ color: 'var(--danger)' }}>* (Wajib minimal 10 karakter)</span>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Contoh: Gangguan jaringan internet saat absensi pagi, dikonfirmasi atasan divisi."
                    value={alasanKoreksi}
                    onChange={(e) => setAlasanKoreksi(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: alasanKoreksi.trim().length >= 10 ? 'var(--success)' : 'var(--text-muted)', marginTop: '4px' }}>
                    {alasanKoreksi.trim().length} / 10 karakter minimum
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedAbsen(null)}
                  disabled={savingKoreksi}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingKoreksi || alasanKoreksi.trim().length < 10}
                >
                  {savingKoreksi ? 'Menyimpan...' : 'Simpan Koreksi & Catat Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
