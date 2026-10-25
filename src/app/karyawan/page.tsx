'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Users, Plus, Search, Filter, Edit, CheckCircle2, AlertCircle, X, Shield, Phone, Mail, Calendar } from 'lucide-react';
import { Profile, Divisi } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo } from '@/lib/wib';

export default function KaryawanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [karyawanList, setKaryawanList] = useState<Profile[]>([]);
  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDivisi, setFilterDivisi] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<Profile | null>(null);

  // Add Form state
  const [addNik, setAddNik] = useState('');
  const [addNama, setAddNama] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addNomorHp, setAddNomorHp] = useState('');
  const [addPeran, setAddPeran] = useState<'karyawan' | 'atasan' | 'hrd'>('karyawan');
  const [addDivisiId, setAddDivisiId] = useState('');
  const [addJabatan, setAddJabatan] = useState('');
  const [addStatusKerja, setAddStatusKerja] = useState<'tetap' | 'kontrak'>('tetap');
  const [addTanggalMasuk, setAddTanggalMasuk] = useState('');

  // Edit Form state
  const [editPeran, setEditPeran] = useState<'karyawan' | 'atasan' | 'hrd'>('karyawan');
  const [editDivisiId, setEditDivisiId] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editStatusKerja, setEditStatusKerja] = useState<'tetap' | 'kontrak'>('tetap');
  const [editAktif, setEditAktif] = useState(true);

  const [modalLoading, setModalLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

      // Load divisi
      const { data: divs } = await supabase.from('divisi').select('*').order('nama');
      setDivisiList((divs || []) as Divisi[]);

      // Query data karyawan
      let query = supabase
        .from('profiles')
        .select('*, divisi:divisi_id(id, nama)')
        .order('nik_karyawan');

      // Jika Atasan: hanya divisi sendiri 
      if (prof.peran === 'atasan') {
        query = query.eq('divisi_id', prof.divisi_id);
      }

      const { data: list, error } = await query;
      if (error) console.error('Error fetching karyawan:', error.message);
      setKaryawanList((list || []) as Profile[]);

    } catch (err) {
      console.error('Error load karyawan:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateKaryawan = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/karyawan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nik: addNik.trim(),
          nama: addNama.trim(),
          email: addEmail.trim(),
          nomorHp: addNomorHp.trim() || null,
          peran: addPeran,
          divisiId: addDivisiId || null,
          jabatan: addJabatan.trim(),
          statusKerja: addStatusKerja,
          tanggalMasuk: addTanggalMasuk,
          kataSandi: 'Latihan#2026'
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: 'Karyawan baru berhasil ditambahkan!' });
        setTimeout(() => {
          setShowAddModal(false);
          setAddNik('');
          setAddNama('');
          setAddEmail('');
          setAddNomorHp('');
          setAddJabatan('');
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateKaryawan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKaryawan) return;

    setModalLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/karyawan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKaryawan.id,
          peran: editPeran,
          divisiId: editDivisiId || null,
          jabatan: editJabatan.trim(),
          statusKerja: editStatusKerja,
          aktif: editAktif
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: 'Data karyawan berhasil diperbarui!' });
        setTimeout(() => {
          setEditingKaryawan(null);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (k: Profile) => {
    setEditingKaryawan(k);
    setEditPeran(k.peran);
    setEditDivisiId(k.divisi_id || '');
    setEditJabatan(k.jabatan);
    setEditStatusKerja(k.status_kerja);
    setEditAktif(k.aktif);
    setMessage(null);
  };

  const filteredKaryawan = karyawanList.filter(k => {
    const matchSearch = k.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
      k.nik_karyawan.toLowerCase().includes(search.toLowerCase()) ||
      k.email.toLowerCase().includes(search.toLowerCase());
    const matchDivisi = filterDivisi === 'all' || k.divisi_id === filterDivisi;
    return matchSearch && matchDivisi;
  });

  return (
    <AppShell title="Data Karyawan">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Direktori Karyawan</h1>
          <p className="page-subtitle">
            {profile?.peran === 'hrd'
              ? 'Kelola data kepegawaian, peran akun, mutasi divisi, dan status aktif '
              : `Daftar anggota divisi ${profile?.divisi?.nama || ''}`}
          </p>
        </div>

        {profile?.peran === 'hrd' && (
          <button onClick={() => { setShowAddModal(true); setMessage(null); }} className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Karyawan Baru</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Cari berdasarkan nama, NIK, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {profile?.peran === 'hrd' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Divisi:</span>
              <select
                className="form-control"
                style={{ width: '200px' }}
                value={filterDivisi}
                onChange={(e) => setFilterDivisi(e.target.value)}
              >
                <option value="all">Semua Divisi</option>
                {divisiList.map(d => (
                  <option key={d.id} value={d.id}>{d.nama}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Karyawan */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIK</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Status Kerja</th>
              <th>Tanggal Masuk</th>
              <th>Status Akun</th>
              {profile?.peran === 'hrd' && <th style={{ textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Memuat data karyawan...
                </td>
              </tr>
            ) : filteredKaryawan.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Tidak ada karyawan yang sesuai dengan filter pencarian.
                </td>
              </tr>
            ) : (
              filteredKaryawan.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{k.nik_karyawan}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{k.nama_lengkap}</div>
                    {k.nomor_hp && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.nomor_hp}</div>}
                  </td>
                  <td>{k.email}</td>
                  <td>
                    <span className={`badge ${k.peran === 'hrd' ? 'badge-primary' : k.peran === 'atasan' ? 'badge-info' : 'badge-neutral'}`}>
                      {k.peran.toUpperCase()}
                    </span>
                  </td>
                  <td>{k.divisi?.nama || '-'}</td>
                  <td>{k.jabatan}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {k.status_kerja}
                    </span>
                  </td>
                  <td>{formatTanggalIndo(k.tanggal_masuk)}</td>
                  <td>
                    <span className={`badge ${k.aktif ? 'badge-success' : 'badge-danger'}`}>
                      {k.aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  {profile?.peran === 'hrd' && (
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => openEditModal(k)}
                        className="btn btn-secondary btn-sm"
                        title="Edit peran, divisi, atau status akun"
                      >
                        <Edit size={14} />
                        <span>Kelola</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Karyawan Baru */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Tambah Karyawan Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateKaryawan}>
              <div className="modal-body">
                {message && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}>
                    {message.text}
                  </div>
                )}

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">NIK Karyawan (Format: KLN-XXXX)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="KLN-0017"
                      value={addNik}
                      onChange={(e) => setAddNik(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nama lengkap..."
                      value={addNama}
                      onChange={(e) => setAddNama(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Perusahaan</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="nama@karsalintas.test"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor HP (Opsional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0812xxxxxxxx"
                      value={addNomorHp}
                      onChange={(e) => setAddNomorHp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Peran Akun </label>
                    <select
                      className="form-control"
                      value={addPeran}
                      onChange={(e) => setAddPeran(e.target.value as 'karyawan' | 'atasan' | 'hrd')}
                    >
                      <option value="karyawan">Karyawan</option>
                      <option value="atasan">Atasan (Manajer Divisi)</option>
                      <option value="hrd">HRD</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Divisi</label>
                    <select
                      className="form-control"
                      value={addDivisiId}
                      onChange={(e) => setAddDivisiId(e.target.value)}
                      required
                    >
                      <option value="">Pilih Divisi...</option>
                      {divisiList.map(d => (
                        <option key={d.id} value={d.id}>{d.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Nama Jabatan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Contoh: Staf Penjualan"
                      value={addJabatan}
                      onChange={(e) => setAddJabatan(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Kepegawaian</label>
                    <select
                      className="form-control"
                      value={addStatusKerja}
                      onChange={(e) => setAddStatusKerja(e.target.value as 'tetap' | 'kontrak')}
                    >
                      <option value="tetap">Karyawan Tetap</option>
                      <option value="kontrak">Karyawan Kontrak</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Mulai Bekerja</label>
                  <input
                    type="date"
                    className="form-control"
                    value={addTanggalMasuk}
                    onChange={(e) => setAddTanggalMasuk(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    *Dasar penetapan hak cuti 12 bulan
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={modalLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Karyawan (Edit Peran, Divisi, Nonaktifkan */}
      {editingKaryawan && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Kelola Data Karyawan</h3>
              <button
                onClick={() => setEditingKaryawan(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateKaryawan}>
              <div className="modal-body">
                {message && (
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    marginBottom: '16px',
                    fontSize: '0.85rem'
                  }}>
                    {message.text}
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    {editingKaryawan.nama_lengkap}
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    NIK: {editingKaryawan.nik_karyawan} • {editingKaryawan.email}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Peran Akun</label>
                  <select
                    className="form-control"
                    value={editPeran}
                    onChange={(e) => setEditPeran(e.target.value as 'karyawan' | 'atasan' | 'hrd')}
                    disabled={editingKaryawan.id === profile?.id}
                  >
                    <option value="karyawan">Karyawan</option>
                    <option value="atasan">Atasan (Manajer Divisi)</option>
                    <option value="hrd">HRD</option>
                  </select>
                  {editingKaryawan.id === profile?.id && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
                      *HRD tidak boleh mengubah peran akunnya sendiri.
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Divisi</label>
                  <select
                    className="form-control"
                    value={editDivisiId}
                    onChange={(e) => setEditDivisiId(e.target.value)}
                  >
                    <option value="">Pilih Divisi...</option>
                    {divisiList.map(d => (
                      <option key={d.id} value={d.id}>{d.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Jabatan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editJabatan}
                      onChange={(e) => setEditJabatan(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Kepegawaian</label>
                    <select
                      className="form-control"
                      value={editStatusKerja}
                      onChange={(e) => setEditStatusKerja(e.target.value as 'tetap' | 'kontrak')}
                    >
                      <option value="tetap">Karyawan Tetap</option>
                      <option value="kontrak">Karyawan Kontrak</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Akun </label>
                  <select
                    className="form-control"
                    value={editAktif ? 'true' : 'false'}
                    onChange={(e) => setEditAktif(e.target.value === 'true')}
                    disabled={editingKaryawan.id === profile?.id}
                  >
                    <option value="true">Aktif (Dapat Masuk ke Aplikasi)</option>
                    <option value="false">Nonaktif </option>
                  </select>
                  {editingKaryawan.id === profile?.id && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '4px' }}>
                      *HRD tidak boleh menonaktifkan akunnya sendiri.
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingKaryawan(null)}
                  disabled={modalLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
