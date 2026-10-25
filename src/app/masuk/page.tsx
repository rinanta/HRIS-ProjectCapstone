'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  X,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Latihan#2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoTab, setDemoTab] = useState<'karyawan' | 'atasan' | 'hrd'>('karyawan');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const err = searchParams.get('error');
    const errDesc = searchParams.get('error_description');
    if (err === 'nonaktif') {
      setErrorMessage('Akun Anda telah dinonaktifkan oleh HRD dan ditolak masuk ke sistem (Aturan Bisnis BR-01). Silakan hubungi bagian HRD.');
    } else if (err === 'auth_gagal') {
      setErrorMessage(errDesc ? decodeURIComponent(errDesc) : 'Autentikasi Google gagal atau dibatalkan. Silakan coba kembali.');
    } else if (err) {
      setErrorMessage('Terjadi kendala autentikasi. Silakan periksa kembali kredensial Anda.');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage('');

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        setErrorMessage(`Gagal memulai autentikasi Google: ${error.message}`);
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        // Pre-flight check agar jika provider di Supabase belum diaktifkan, tidak muncul layar putih error 400
        try {
          const testRes = await fetch(data.url);
          if (!testRes.ok) {
            const errJson = await testRes.json().catch(() => null);
            if (errJson?.msg?.includes('provider is not enabled')) {
              setErrorMessage('Layanan Google Sign-In belum diaktifkan di Supabase Dashboard (Authentication > Providers > Google). Silakan aktifkan provider dan masukkan Client ID di Supabase.');
              setGoogleLoading(false);
              return;
            }
          }
        } catch {
          // Lanjutkan jika pembacaan respons dicegah CORS
        }

        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungkan ke Google';
      setErrorMessage(message);
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (directEmail || email).trim().toLowerCase();

    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: password
      });

      if (error) {
        setErrorMessage('Email atau kata sandi tidak valid. Periksa kembali kredensial Anda.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Cek status aktif di profiles (BR-01)
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('aktif, nama_lengkap, peran')
          .eq('id', data.user.id)
          .single();

        if (profError || !profile || !profile.aktif) {
          await supabase.auth.signOut();
          setErrorMessage('Akun Anda dinonaktifkan oleh HRD dan tidak dapat masuk ke sistem (BR-01).');
          setLoading(false);
          return;
        }

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kendala jaringan';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Latihan#2026');
    setShowDemoModal(false);
    handleLogin(undefined, demoEmail);
  };

  const demoAccounts = {
    karyawan: [
      {
        nama: 'Andi Wijaya',
        email: 'andi.wijaya@karsalintas.test',
        jabatan: 'Staf Penjualan',
        divisi: 'Divisi Penjualan',
        desc: 'Uji absensi normal, pengajuan cuti tahunan, dan cetak slip gaji pribadi.'
      },
      {
        nama: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@karsalintas.test',
        jabatan: 'Staf Operasional',
        divisi: 'Operasional Gudang',
        desc: 'Memiliki pengajuan sakit yang membutuhkan persetujuan Atasan (Bayu Setiawan).'
      }
    ],
    atasan: [
      {
        nama: 'Bayu Setiawan',
        email: 'bayu.setiawan@karsalintas.test',
        jabatan: 'Manajer Operasional Gudang',
        divisi: 'Operasional Gudang',
        desc: 'Atasan langsung Siti Nurhaliza & Wulan Sari. Memproses Persetujuan Tahap 1.'
      },
      {
        nama: 'Maya Anggraini',
        email: 'maya.anggraini@karsalintas.test',
        jabatan: 'Manajer Penjualan',
        divisi: 'Divisi Penjualan',
        desc: 'Atasan langsung Andi Wijaya. Memantau absensi tim divisi penjualan.'
      }
    ],
    hrd: [
      {
        nama: 'Rina Kusumawardani',
        email: 'rina.kusumawardani@karsalintas.test',
        jabatan: 'Kepala HRD',
        divisi: 'Human Resources',
        desc: 'Persetujuan Tahap 2 (Final), koreksi absensi (audit log), kelola slip gaji & laporan.'
      },
      {
        nama: 'Dimas Pratama',
        email: 'dimas.pratama@karsalintas.test',
        jabatan: 'Staf HR & Payroll',
        divisi: 'Human Resources',
        desc: 'Sesama staf HRD yang dapat menyetujui pengajuan cuti Kepala HRD (Rina K.).'
      }
    ]
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#f8fafc',
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      padding: '20px 24px'
    }}>
      <style>{`
        .login-split-card {
          display: flex;
          flex-direction: row;
          width: 100%;
          max-width: 1040px;
          margin: auto;
          background-color: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
          overflow: hidden;
        }
        .login-left-panel {
          width: 46%;
          background: linear-gradient(145deg, #0b1329 0%, #0f172a 60%, #1e293b 100%);
          padding: 44px 40px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          border-right: 1px solid #1e293b;
        }
        .login-right-panel {
          width: 54%;
          padding: 44px 44px;
          display: flex;
          flex-direction: column;
          justifyContent: center;
          background-color: #ffffff;
        }
        @media (max-width: 880px) {
          .login-split-card {
            flex-direction: column;
            max-width: 480px;
          }
          .login-left-panel {
            width: 100%;
            padding: 28px 24px;
            border-right: none;
            border-bottom: 1px solid #1e293b;
          }
          .login-right-panel {
            width: 100%;
            padding: 32px 24px;
          }
        }
      `}</style>

      {/* Top Header Bar */}
      <header style={{
        maxWidth: '1040px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              PT KARSA LINTAS NUSANTARA
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
              Sistem Informasi Manajemen Sumber Daya Manusia (HRIS)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
          <span>Server WIB (UTC+7)</span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span style={{ color: '#64748b' }}>TLS 1.3 Terenkripsi</span>
        </div>
      </header>

      {/* Executive Split Container */}
      <main className="login-split-card">
        {/* Left Panel: Corporate Identity */}
        <section className="login-left-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>
              <span>PORTAL KEPEGAWAIAN</span>
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              letterSpacing: '-0.03em',
              marginBottom: '16px'
            }}>
              HRIS PT KARSA LINTAS NUSANTARA
            </h1>

            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '380px'
            }}>
              Sistem Informasi Manajemen Sumber Daya Manusia, Kehadiran, dan Penggajian Karyawan Terpadu.
            </p>
          </div>

          <div style={{
            paddingTop: '24px',
            marginTop: '40px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b'
          }}>
            <span>Versi Sistem: <strong>v2.4.0-Enterprise</strong></span>
            <span style={{ color: '#94a3b8' }}>PT Karsa Lintas Nusantara</span>
          </div>
        </section>

        {/* Right Panel: Clean Authentication Console */}
        <section className="login-right-panel">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Masuk ke Portal
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Masukkan kredensial akun perusahaan Anda untuk melanjutkan
            </p>
          </div>

          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#991b1b',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="email-input" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Perusahaan
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  id="email-input"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem', borderColor: '#cbd5e1', borderRadius: '6px' }}
                  placeholder="nama@karsalintas.test"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" htmlFor="password-input" style={{ margin: 0, fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => alert('Untuk bantuan reset kata sandi akun resmi, silakan hubungi Administrator HRD.')}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.78rem', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
                >
                  Lupa sandi?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '38px', paddingRight: '38px', height: '42px', fontSize: '0.9rem', borderColor: '#cbd5e1', borderRadius: '6px' }}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '42px', fontSize: '0.9rem', fontWeight: 700, borderRadius: '6px', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
              disabled={loading}
            >
              {loading ? 'Memverifikasi Kredensial...' : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Pemisah Elegan */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 14px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              atau masuk dengan
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Tombol Masuk dengan Akun Google (di atas Pilih Akun Uji Cepat) */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              color: '#1e293b',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
              opacity: googleLoading || loading ? 0.7 : 1,
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }
            }}
            onMouseLeave={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }
            }}
          >
            {googleLoading ? (
              <span>Menghubungkan ke Google...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Akun Google</span>
              </>
            )}
          </button>

          {/* Quick Evaluator Mode Button */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '6px',
                padding: '9px 14px',
                fontSize: '0.8rem',
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Sparkles size={14} color="#2563eb" />
              <span>Pilih Akun Uji Cepat (Evaluator Mode)</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer Legal & Security */}
      <footer style={{
        maxWidth: '1040px',
        width: '100%',
        margin: '0 auto',
        textAlign: 'center',
        padding: '16px 0',
        fontSize: '0.78rem',
        color: '#94a3b8',
        lineHeight: 1.6
      }}>
        <div>
          © 2026 PT Karsa Lintas Nusantara. Hak Cipta Dilindungi. Sistem Informasi Sumber Daya Manusia & Operasional.
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
          Akses terbatas hanya untuk pihak yang berwenang. Segala aktivitas dicatat dalam sistem audit log perusahaan.
        </div>
      </footer>

      {/* Modal Slide-Over Demo Accounts */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  Pilih Akun Pengujian PRD
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  Semua akun menggunakan kata sandi standar: <code>Latihan#2026</code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '18px 24px' }}>
              {/* Segmented Tabs */}
              <div style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '8px',
                gap: '4px',
                marginBottom: '16px'
              }}>
                {(['karyawan', 'atasan', 'hrd'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setDemoTab(tab)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      fontWeight: demoTab === tab ? 700 : 500,
                      borderRadius: '6px',
                      border: 'none',
                      background: demoTab === tab ? '#ffffff' : 'transparent',
                      color: demoTab === tab ? '#0f172a' : '#64748b',
                      boxShadow: demoTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Account list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {demoAccounts[demoTab].map(acc => (
                  <div
                    key={acc.email}
                    onClick={() => selectDemoAccount(acc.email)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{acc.nama}</strong>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {acc.jabatan}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {acc.divisi} • <code>{acc.email}</code>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
                        {acc.desc}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Pilih & Masuk →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 24px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDemoModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Memuat Portal Karyawan...</div>}>
      <LoginForm />
    </Suspense>
  );
}
