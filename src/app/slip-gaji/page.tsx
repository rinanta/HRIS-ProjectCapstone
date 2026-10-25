'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { 
  Receipt, 
  Plus, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Lock, 
  AlertCircle, 
  X, 
  Eye, 
  Edit3, 
  FileText,
  Building2
} from 'lucide-react';
import { SlipGaji, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, formatRupiah } from '@/lib/wib';

export default function SlipGajiPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPeriode, setSelectedPeriode] = useState('2026-10'); // Default periode
  const [slipList, setSlipList] = useState<SlipGaji[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Views
  const [previewSlip, setPreviewSlip] = useState<SlipGaji | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [editingSlip, setEditingSlip] = useState<SlipGaji | null>(null);

  // Form state
  const [karyawanOptions, setKaryawanOptions] = useState<Profile[]>([]);
  const [formKaryawanId, setFormKaryawanId] = useState('');
  const [formGajiPokok, setFormGajiPokok] = useState<number>(0);
  const [formTunjangan, setFormTunjangan] = useState<number>(0);
  const [formPotongan, setFormPotongan] = useState<number>(0);
  const [formCatatan, setFormCatatan] = useState('');

  // Copy modal state
  const [salinDari, setSalinDari] = useState('2026-09');

  const [actionLoading, setActionLoading] = useState(false);
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

      // Jika HRD, ambil daftar karyawan untuk dropdown draf
      if (prof.peran === 'hrd') {
        const { data: allEmp } = await supabase
          .from('profiles')
          .select('*, divisi:divisi_id(id, nama)')
          .eq('aktif', true)
          .order('nik_karyawan');
        setKaryawanOptions((allEmp || []) as unknown as Profile[]);
      }

      // Query slip gaji
      const formattedPeriode = `${selectedPeriode}-01`;
      let query = supabase
        .from('slip_gaji')
        .select('*, karyawan:karyawan_id(id, nama_lengkap, nik_karyawan, jabatan, divisi_id, divisi:divisi_id(nama)), diterbitkan:diterbitkan_oleh(nama_lengkap)')
        .order('dibuat_pada', { ascending: false });

      if (prof.peran !== 'hrd') {
        // Karyawan & Atasan: HANYA SLIP SENDIRI DAN SUDAH TERBIT (BR-11 & BR-12)
        query = query.eq('karyawan_id', user.id).eq('status', 'terbit');
      } else {
        // HRD: Filter periode yang dipilih
        query = query.eq('periode', formattedPeriode);
      }

      const { data: list, error } = await query;
      if (error) console.error('Error fetching slip gaji:', error.message);
      setSlipList((list || []) as SlipGaji[]);

    } catch (err) {
      console.error('Error load slip data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriode, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/slip-gaji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawanId: formKaryawanId,
          periode: selectedPeriode,
          gajiPokok: formGajiPokok,
          tunjangan: formTunjangan,
          potongan: formPotongan,
          catatan: formCatatan.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: 'Draf slip gaji berhasil disimpan!' });
        setTimeout(() => {
          setShowAddModal(false);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlip) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/slip-gaji', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSlip.id,
          gajiPokok: formGajiPokok,
          tunjangan: formTunjangan,
          potongan: formPotongan,
          catatan: formCatatan.trim()
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: 'Draf slip gaji berhasil diperbarui!' });
        setTimeout(() => {
          setEditingSlip(null);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerbitkan = async (slipId: string) => {
    if (!confirm('Terbitkan slip gaji ini? Slip yang terbit akan mendapat nomor resmi dan TERKUNCI (tidak dapat diubah atau dihapus lagi) (BR-12).')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/slip-gaji/terbitkan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slipId })
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
      setActionLoading(false);
    }
  };

  const handleSalinPeriode = async () => {
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/slip-gaji/salin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodeAsal: salinDari,
          periodeTujuan: selectedPeriode
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        setMessage({ type: 'error', text: resData.message });
      } else {
        setMessage({ type: 'success', text: resData.message });
        setTimeout(() => {
          setShowCopyModal(false);
          loadData();
        }, 1200);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (slip: SlipGaji) => {
    setEditingSlip(slip);
    setFormGajiPokok(slip.gaji_pokok);
    setFormTunjangan(slip.tunjangan);
    setFormPotongan(slip.potongan);
    setFormCatatan(slip.catatan || '');
    setMessage(null);
  };

  const totalDiterimaHitung = Math.max(0, Number(formGajiPokok) + Number(formTunjangan) - Number(formPotongan));

  return (
    <AppShell title="Slip Gaji">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Slip Gaji Bulanan</h1>
          <p className="page-subtitle">
            {profile?.peran === 'hrd' 
              ? 'Kelola pembuatan draf, salin periode, dan penerbitan nomor slip SG-TTTTBB-NNN (BR-11 & BR-12)' 
              : 'Daftar slip gaji resmi Anda yang telah terbit (BR-11)'}
          </p>
        </div>

        {profile?.peran === 'hrd' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => { setShowCopyModal(true); setMessage(null); }}
              className="btn btn-secondary"
            >
              <Copy size={16} />
              <span>Salin dari Periode Sebelumnya</span>
            </button>

            <button
              onClick={() => {
                setShowAddModal(true);
                setFormKaryawanId('');
                setFormGajiPokok(0);
                setFormTunjangan(0);
                setFormPotongan(0);
                setFormCatatan('');
                setMessage(null);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>Buat Draf Slip Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Periode (Khusus HRD) */}
      {profile?.peran === 'hrd' && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Pilih Periode Gaji:
            </span>
            <input
              type="month"
              className="form-control"
              style={{ width: '180px' }}
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Menampilkan seluruh slip karyawan pada periode {selectedPeriode}
            </span>
          </div>
        </div>
      )}

      {/* Ringkasan Gaji Terakhir untuk Karyawan (Ringkas & Proporsional) */}
      {profile?.peran !== 'hrd' && slipList.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div className="stat-panel" style={{ padding: '14px 18px', minHeight: 'auto' }}>
            <div className="stat-panel-label">Take Home Pay Terakhir</div>
            <div className="stat-panel-value" style={{ fontSize: '1.35rem', color: '#2563eb' }}>
              {formatRupiah(slipList[0]?.total_diterima || 0)}
            </div>
            <div className="stat-panel-meta">Periode {slipList[0]?.periode?.substring(0, 7)}</div>
          </div>

          <div className="stat-panel" style={{ padding: '14px 18px', minHeight: 'auto' }}>
            <div className="stat-panel-label">Gaji Pokok & Tunjangan</div>
            <div className="stat-panel-value" style={{ fontSize: '1.35rem' }}>
              {formatRupiah((slipList[0]?.gaji_pokok || 0) + (slipList[0]?.tunjangan || 0))}
            </div>
            <div className="stat-panel-meta">Potongan: {formatRupiah(slipList[0]?.potongan || 0)}</div>
          </div>

          <div className="stat-panel" style={{ padding: '14px 18px', minHeight: 'auto' }}>
            <div className="stat-panel-label">Nomor Slip Resmi</div>
            <div className="stat-panel-value" style={{ fontSize: '1.05rem', fontFamily: 'var(--font-mono)', color: '#4338ca' }}>
              {slipList[0]?.nomor_slip || 'Belum Terbit'}
            </div>
            <div className="stat-panel-meta">Status: Terverifikasi HRD</div>
          </div>
        </div>
      )}

      {/* Tabel Slip Gaji */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nomor Slip</th>
              {profile?.peran === 'hrd' && <th>Karyawan</th>}
              {profile?.peran === 'hrd' && <th>Divisi</th>}
              <th>Periode</th>
              <th>Gaji Pokok</th>
              <th>Tunjangan</th>
              <th>Potongan</th>
              <th>Total Diterima</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Memuat data slip gaji...
                </td>
              </tr>
            ) : slipList.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  {profile?.peran === 'hrd' 
                    ? `Belum ada slip gaji pada periode ${selectedPeriode}. Anda dapat membuat draf atau menyalin dari periode sebelumnya.`
                    : 'Belum ada slip gaji yang diterbitkan untuk Anda.'}
                </td>
              </tr>
            ) : (
              slipList.map(slip => {
                const isTerbit = slip.status === 'terbit';
                return (
                  <tr key={slip.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isTerbit ? '#4f46e5' : '#94a3b8' }}>
                      {slip.nomor_slip || '(Belum Terbit)'}
                    </td>
                    {profile?.peran === 'hrd' && (
                      <td>
                        <div style={{ fontWeight: 600 }}>{slip.karyawan?.nama_lengkap || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{slip.karyawan?.nik_karyawan}</div>
                      </td>
                    )}
                    {profile?.peran === 'hrd' && (
                      <td>{slip.karyawan?.divisi?.nama || '-'}</td>
                    )}
                    <td>{slip.periode.substring(0, 7)}</td>
                    <td>{formatRupiah(slip.gaji_pokok)}</td>
                    <td style={{ color: '#059669' }}>+{formatRupiah(slip.tunjangan)}</td>
                    <td style={{ color: '#dc2626' }}>-{formatRupiah(slip.potongan)}</td>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>
                      {formatRupiah(slip.total_diterima)}
                    </td>
                    <td>
                      <span className={`badge ${isTerbit ? 'badge-success' : 'badge-warning'}`}>
                        {isTerbit ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        {/* Tombol Lihat/Cetak Slip */}
                        <button
                          onClick={() => setPreviewSlip(slip)}
                          className="btn btn-secondary btn-sm"
                          title="Lihat rincian dan cetak slip gaji"
                        >
                          <Eye size={14} />
                          <span>Lihat / Cetak</span>
                        </button>

                        {/* Aksi Khusus HRD untuk Draf */}
                        {profile?.peran === 'hrd' && !isTerbit && (
                          <>
                            <button
                              onClick={() => openEditModal(slip)}
                              className="btn btn-secondary btn-sm"
                              title="Edit nominal draf slip"
                            >
                              <Edit3 size={14} />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleTerbitkan(slip.id)}
                              className="btn btn-primary btn-sm"
                              title="Terbitkan nomor resmi dan kunci slip gaji"
                              disabled={actionLoading}
                            >
                              <CheckCircle2 size={14} />
                              <span>Terbitkan</span>
                            </button>
                          </>
                        )}

                        {/* Status Terkunci jika sudah terbit */}
                        {profile?.peran === 'hrd' && isTerbit && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', padding: '4px 8px' }}>
                            <Lock size={12} />
                            <span>Terkunci</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Cetak / Pratinjau Resmi Slip Gaji (Ukuran Ringkas & Pas di Layar) */}
      {previewSlip && (
        <div className="modal-overlay" onClick={() => setPreviewSlip(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              padding: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Action Bar Modal */}
            <div className="no-print" style={{
              padding: '10px 18px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                Pratinjau Slip Gaji Resmi
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  <Printer size={14} />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewSlip(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Dokumen Fisik Slip Gaji (Ukuran Proporsional) */}
            <div style={{
              padding: '22px 24px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              maxHeight: '82vh',
              overflowY: 'auto'
            }}>
              {/* Header Slip Perusahaan */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #0f172a',
                paddingBottom: '12px',
                marginBottom: '14px'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                    PT KARSA LINTAS NUSANTARA
                  </h2>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                    Distribusi & Pergudangan • Jl. Ahmad Yani No. 88, Bekasi
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Email: hr@karsalintas.test
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.02em' }}>
                    SLIP GAJI KARYAWAN
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: '2px', color: '#334155' }}>
                    {previewSlip.nomor_slip || 'STATUS: DRAF (BELUM DITERBITKAN)'}
                  </div>
                </div>
              </div>

              {/* Data Karyawan (Ringkas) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px 12px',
                fontSize: '0.78rem',
                marginBottom: '14px',
                backgroundColor: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <div><span style={{ color: '#64748b' }}>NIK:</span> <strong>{previewSlip.karyawan?.nik_karyawan}</strong></div>
                  <div style={{ marginTop: '3px' }}><span style={{ color: '#64748b' }}>Nama:</span> <strong>{previewSlip.karyawan?.nama_lengkap}</strong></div>
                </div>
                <div>
                  <div><span style={{ color: '#64748b' }}>Jabatan:</span> <strong>{previewSlip.karyawan?.jabatan}</strong></div>
                  <div style={{ marginTop: '3px' }}><span style={{ color: '#64748b' }}>Divisi:</span> <strong>{previewSlip.karyawan?.divisi?.nama}</strong></div>
                  <div style={{ marginTop: '3px' }}><span style={{ color: '#64748b' }}>Periode:</span> <strong>{previewSlip.periode.substring(0, 7)}</strong></div>
                </div>
              </div>

              {/* Rincian Komponen Gaji */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', marginBottom: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                    <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: '0.72rem', textTransform: 'uppercase', color: '#475569' }}>
                      Deskripsi Pendapatan & Potongan
                    </th>
                    <th style={{ textAlign: 'right', padding: '6px 10px', fontSize: '0.72rem', textTransform: 'uppercase', color: '#475569' }}>
                      Nominal (Rp)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 10px' }}>Gaji Pokok</td>
                    <td style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 600 }}>
                      {formatRupiah(previewSlip.gaji_pokok)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 10px' }}>Tunjangan Karyawan</td>
                    <td style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 600, color: '#16a34a' }}>
                      +{formatRupiah(previewSlip.tunjangan)}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '7px 10px' }}>Potongan Gaji</td>
                    <td style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 600, color: '#dc2626' }}>
                      ({formatRupiah(previewSlip.potongan)})
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                    <td style={{ padding: '10px', fontWeight: 800, fontSize: '0.85rem' }}>
                      TOTAL GAJI DITERIMA (TAKE HOME PAY)
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px', fontWeight: 800, fontSize: '1rem', color: '#2563eb' }}>
                      {formatRupiah(previewSlip.total_diterima)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {previewSlip.catatan && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  marginBottom: '14px',
                  backgroundColor: '#fffbeb',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fef3c7'
                }}>
                  <strong>Catatan Slip:</strong> {previewSlip.catatan}
                </div>
              )}

              {/* Tanda Tangan */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px', fontSize: '0.75rem' }}>
                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{ color: '#64748b' }}>Penerima,</div>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ fontWeight: 700, borderTop: '1px solid #cbd5e1', paddingTop: '4px' }}>
                    {previewSlip.karyawan?.nama_lengkap}
                  </div>
                </div>

                <div style={{ textAlign: 'center', width: '160px' }}>
                  <div style={{ color: '#64748b' }}>Diterbitkan Oleh HRD,</div>
                  <div style={{ height: '36px' }}></div>
                  <div style={{ fontWeight: 700, borderTop: '1px solid #cbd5e1', paddingTop: '4px' }}>
                    {previewSlip.diterbitkan?.nama_lengkap || 'Rina Kusumawardani'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                    {previewSlip.diterbitkan_pada ? formatTanggalIndo(previewSlip.diterbitkan_pada) : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Draf Baru (HRD, BR-12) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Buat Draf Slip Gaji Baru</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDraft}>
              <div className="modal-body">
                {message && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {message.text}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Karyawan Penerima Gaji</label>
                  <select
                    className="form-control"
                    value={formKaryawanId}
                    onChange={(e) => setFormKaryawanId(e.target.value)}
                    required
                  >
                    <option value="">Pilih Karyawan...</option>
                    {karyawanOptions.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.nik_karyawan} - {k.nama_lengkap} ({k.jabatan})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formGajiPokok}
                    onChange={(e) => setFormGajiPokok(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tunjangan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formTunjangan}
                      onChange={(e) => setFormTunjangan(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Potongan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formPotongan}
                      onChange={(e) => setFormPotongan(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimasi Total Diterima:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                    {formatRupiah(totalDiterimaHitung)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Slip (Opsional)</label>
                  <textarea
                    className="form-control"
                    placeholder="Contoh: Termasuk insentif lembur dan potongan BPJS 4%"
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={actionLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading || !formKaryawanId}>
                  {actionLoading ? 'Menyimpan...' : 'Simpan Sebagai Draf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Draf Slip */}
      {editingSlip && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Edit Draf Slip Gaji</h3>
              <button onClick={() => setEditingSlip(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDraft}>
              <div className="modal-body">
                {message && (
                  <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                    {message.text}
                  </div>
                )}

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{editingSlip.karyawan?.nama_lengkap}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Periode: {editingSlip.periode.substring(0, 7)}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Gaji Pokok (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formGajiPokok}
                    onChange={(e) => setFormGajiPokok(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tunjangan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formTunjangan}
                      onChange={(e) => setFormTunjangan(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Potongan (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formPotongan}
                      onChange={(e) => setFormPotongan(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimasi Total Diterima:</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5' }}>
                    {formatRupiah(totalDiterimaHitung)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Catatan Slip (Opsional)</label>
                  <textarea
                    className="form-control"
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSlip(null)} disabled={actionLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Salin dari Periode Sebelumnya (HRD, Seksi 7) */}
      {showCopyModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Salin Draf dari Periode Sebelumnya</h3>
              <button onClick={() => setShowCopyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {message && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2', color: message.type === 'success' ? '#065f46' : '#991b1b', marginBottom: '14px', fontSize: '0.85rem' }}>
                  {message.text}
                </div>
              )}

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Fitur ini akan menyalin seluruh rincian nominal gaji dari periode sebelumnya ke periode saat ini ({selectedPeriode}) sebagai <strong>draf</strong> untuk karyawan yang belum memiliki slip pada periode ini.
              </p>

              <div className="form-group">
                <label className="form-label">Salin Dari Periode:</label>
                <input
                  type="month"
                  className="form-control"
                  value={salinDari}
                  onChange={(e) => setSalinDari(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ke Periode Target:</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedPeriode}
                  disabled
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCopyModal(false)} disabled={actionLoading}>
                Batal
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSalinPeriode} disabled={actionLoading}>
                {actionLoading ? 'Menyalin...' : 'Mulai Salin Draf'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
