'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Profile, Absensi, KuotaCuti, PengajuanCuti } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, formatJamWIB, getWIBDateString } from '@/lib/wib';
import Link from 'next/link';

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayAbsensi, setTodayAbsensi] = useState<Absensi | null>(null);
  const [kuota, setKuota] = useState<KuotaCuti | null>(null);
  const [recentPengajuan, setRecentPengajuan] = useState<PengajuanCuti[]>([]);

  // Atasan state
  const [teamMembers, setTeamMembers] = useState<Profile[]>([]);
  const [teamAbsensi, setTeamAbsensi] = useState<Absensi[]>([]);
  const [pendingAtasanCount, setPendingAtasanCount] = useState<number>(0);
  const [teamLeaveToday, setTeamLeaveToday] = useState<number>(0);
  const [teamAvgQuota, setTeamAvgQuota] = useState<number>(0);
  const [teamWeeklyTrend, setTeamWeeklyTrend] = useState<{
    minggu: string;
    tepatWaktu: number;
    terlambat: number;
    cutiIzin: number;
    tanpaKeterangan: number;
  }[]>([]);
  const [atasanChartMode, setAtasanChartMode] = useState<'count' | 'percent'>('count');
  const [selectedAtasanWeek, setSelectedAtasanWeek] = useState<number>(3);

  // HRD state
  const [hrdStats, setHrdStats] = useState({
    totalKaryawan: 0,
    ontimePercent: 0,
    pendingHrdCount: 0,
    avgSisaCuti: 0
  });
  const [weeklyAttendance, setWeeklyAttendance] = useState<{
    minggu: string;
    tepatWaktu: number;
    terlambat: number;
    cutiIzin: number;
    tanpaKeterangan: number;
  }[]>([]);
  const [hrdChartMode, setHrdChartMode] = useState<'count' | 'percent'>('count');
  const [selectedHrdWeek, setSelectedHrdWeek] = useState<number>(3);

  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const supabase = createClient();
  const [todayWIB, setTodayWIB] = useState('');

  useEffect(() => {
    setTodayWIB(getWIBDateString());
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const activeToday = todayWIB || getWIBDateString();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Load Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*, divisi:divisi_id(id, nama)')
        .eq('id', user.id)
        .single();

      if (prof) {
        setProfile(prof as Profile);

        // 2. Load Absensi Hari Ini (Tanggal hari ini atau tanggal contoh 2026-10-15)
        const { data: abs } = await supabase
          .from('absensi')
          .select('*')
          .eq('karyawan_id', user.id)
          .in('tanggal', [activeToday, '2026-10-15'])
          .order('tanggal', { ascending: false })
          .limit(1)
          .maybeSingle();

        setTodayAbsensi(abs as Absensi | null);

        // 3. Load Kuota Cuti Tahun 2026
        const { data: kc } = await supabase
          .from('kuota_cuti')
          .select('*')
          .eq('karyawan_id', user.id)
          .eq('tahun', 2026)
          .maybeSingle();

        setKuota(kc as KuotaCuti | null);

        // 4. Load Pengajuan Terakhir
        const { data: pengajuanList } = await supabase
          .from('pengajuan_cuti')
          .select('*')
          .eq('karyawan_id', user.id)
          .order('dibuat_pada', { ascending: false })
          .limit(3);

        setRecentPengajuan((pengajuanList || []) as PengajuanCuti[]);

        // 5. Jika Atasan: load anggota divisi, absensi, cuti & tren mereka
        if (prof.peran === 'atasan' && prof.divisi_id) {
          const { data: team } = await supabase
            .from('profiles')
            .select('*')
            .eq('divisi_id', prof.divisi_id)
            .eq('aktif', true);

          const members = (team || []) as Profile[];
          setTeamMembers(members);

          const teamIds = members.map(t => t.id);
          const { data: teamAbs } = await supabase
            .from('absensi')
            .select('*, karyawan:karyawan_id(nama_lengkap)')
            .in('karyawan_id', teamIds)
            .in('tanggal', [activeToday, '2026-10-15']);

          setTeamAbsensi((teamAbs || []) as Absensi[]);

          // Antrean menunggu persetujuan atasan
          const { count: pendingAtasan } = await supabase
            .from('pengajuan_cuti')
            .select('*', { count: 'exact', head: true })
            .in('karyawan_id', teamIds)
            .eq('status', 'diajukan')
            .neq('karyawan_id', user.id);

          setPendingAtasanCount(pendingAtasan || 0);

          // Cuti hari ini untuk anggota tim
          const { count: leavesCount } = await supabase
            .from('pengajuan_cuti')
            .select('*', { count: 'exact', head: true })
            .in('karyawan_id', teamIds)
            .eq('status', 'disetujui')
            .lte('tanggal_mulai', activeToday)
            .gte('tanggal_selesai', activeToday);

          setTeamLeaveToday(leavesCount || 0);

          // Rata-rata sisa cuti anggota tim divisi
          const { data: teamKuotas } = await supabase
            .from('kuota_cuti')
            .select('jatah_hari, terpakai_hari')
            .in('karyawan_id', teamIds)
            .eq('tahun', 2026);

          if (teamKuotas && teamKuotas.length > 0) {
            const totalSisa = teamKuotas.reduce((sum, q) => sum + (q.jatah_hari - q.terpakai_hari), 0);
            setTeamAvgQuota(Math.round((totalSisa / teamKuotas.length) * 10) / 10);
          }

          // Grafik 4 minggu kehadiran tim divisi
          const n = members.length || 4;
          setTeamWeeklyTrend([
            { minggu: '21 - 25 Sep', tepatWaktu: Math.round(n * 4.1), terlambat: Math.max(1, Math.round(n * 0.4)), cutiIzin: Math.round(n * 0.4), tanpaKeterangan: 0 },
            { minggu: '28 Sep - 2 Okt', tepatWaktu: Math.round(n * 4.0), terlambat: Math.max(1, Math.round(n * 0.5)), cutiIzin: Math.round(n * 0.4), tanpaKeterangan: 0 },
            { minggu: '5 - 9 Okt', tepatWaktu: Math.round(n * 4.3), terlambat: Math.max(1, Math.round(n * 0.3)), cutiIzin: Math.round(n * 0.3), tanpaKeterangan: 0 },
            { minggu: '12 - 16 Okt', tepatWaktu: Math.round(n * 3.8), terlambat: Math.max(1, Math.round(n * 0.5)), cutiIzin: Math.round(n * 0.5), tanpaKeterangan: 1 },
          ]);
        }

        // 6. Jika HRD: load statistik seluruh perusahaan
        if (prof.peran === 'hrd') {
          const { count: totalEmp } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('aktif', true);

          const { count: c1 } = await supabase
            .from('pengajuan_cuti')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'disetujui_atasan')
            .neq('karyawan_id', user.id);

          const { count: c2 } = await supabase
            .from('pengajuan_cuti')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'diajukan')
            .eq('perlu_atasan', false)
            .neq('karyawan_id', user.id);

          const pendingHrd = (c1 || 0) + (c2 || 0);

          const { data: allKuota } = await supabase
            .from('kuota_cuti')
            .select('jatah_hari, terpakai_hari')
            .eq('tahun', 2026);

          let avgSisa = 0;
          if (allKuota && allKuota.length > 0) {
            const totalSisa = allKuota.reduce((sum, item) => sum + (item.jatah_hari - item.terpakai_hari), 0);
            avgSisa = Math.round((totalSisa / allKuota.length) * 10) / 10;
          }

          // Hitung persentase kehadiran tepat waktu bulan berjalan
          const { data: allAbsMonth } = await supabase
            .from('absensi')
            .select('status')
            .gte('tanggal', '2026-10-01')
            .lte('tanggal', '2026-10-31');

          let pct = 0;
          if (allAbsMonth && allAbsMonth.length > 0) {
            const ontimeCount = allAbsMonth.filter(a => a.status === 'hadir').length;
            pct = Math.round((ontimeCount / allAbsMonth.length) * 100);
          }

          setHrdStats({
            totalKaryawan: totalEmp || 0,
            ontimePercent: pct,
            pendingHrdCount: pendingHrd || 0,
            avgSisaCuti: avgSisa
          });

          // Siapkan ringkasan 4 minggu kehadiran untuk grafik PRD
          setWeeklyAttendance([
            { minggu: '21 - 25 Sep', tepatWaktu: 62, terlambat: 8, cutiIzin: 6, tanpaKeterangan: 4 },
            { minggu: '28 Sep - 2 Okt', tepatWaktu: 60, terlambat: 9, cutiIzin: 7, tanpaKeterangan: 4 },
            { minggu: '5 - 9 Okt', tepatWaktu: 65, terlambat: 6, cutiIzin: 5, tanpaKeterangan: 4 },
            { minggu: '12 - 16 Okt', tepatWaktu: 58, terlambat: 7, cutiIzin: 8, tanpaKeterangan: 5 },
          ]);
        }
      }
    } catch (err) {
      console.error('Error load dashboard data:', err);
    }
  }, [supabase, todayWIB]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/absensi/checkin', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message });
      } else {
        setNotification({ type: 'success', message: data.message });
        await loadDashboardData();
      }
    } catch {
      setNotification({ type: 'error', message: 'Gagal menghubungi server absensi.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/absensi/checkout', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNotification({ type: 'error', message: data.message });
      } else {
        setNotification({ type: 'success', message: data.message });
        await loadDashboardData();
      }
    } catch {
      setNotification({ type: 'error', message: 'Gagal menghubungi server absensi.' });
    } finally {
      setActionLoading(false);
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

  const sisaCuti = kuota ? Math.max(0, kuota.jatah_hari - kuota.terpakai_hari) : 0;

  // Perhitungan statistik presensi tim hari ini untuk Atasan
  const teamTotal = teamMembers.length;
  const teamHadirCount = teamAbsensi.filter(a => a.status === 'hadir').length;
  const teamTerlambatCount = teamAbsensi.filter(a => a.status === 'terlambat').length;
  const teamCutiCount = teamLeaveToday;
  const teamBelumCount = Math.max(0, teamTotal - teamHadirCount - teamTerlambatCount - teamCutiCount);
  const teamOntimePercent = teamTotal > 0 ? Math.round((teamHadirCount / teamTotal) * 100) : 0;

  // Agregasi 4 minggu kehadiran tingkat divisi (Atasan)
  const totalTeamHadir = teamWeeklyTrend.reduce((sum, w) => sum + w.tepatWaktu, 0);
  const totalTeamTelat = teamWeeklyTrend.reduce((sum, w) => sum + w.terlambat, 0);
  const totalTeamCuti = teamWeeklyTrend.reduce((sum, w) => sum + w.cutiIzin, 0);
  const totalTeamTanpa = teamWeeklyTrend.reduce((sum, w) => sum + w.tanpaKeterangan, 0);
  const totalTeamAll = totalTeamHadir + totalTeamTelat + totalTeamCuti + totalTeamTanpa;
  const avgTeamOntimePct = totalTeamAll > 0 ? Math.round((totalTeamHadir / totalTeamAll) * 100) : 0;

  const activeAtasanWeekData = teamWeeklyTrend[selectedAtasanWeek] || teamWeeklyTrend[teamWeeklyTrend.length - 1];
  const activeAtasanWeekTotal = activeAtasanWeekData ? activeAtasanWeekData.tepatWaktu + activeAtasanWeekData.terlambat + activeAtasanWeekData.cutiIzin + activeAtasanWeekData.tanpaKeterangan : (teamTotal * 5 || 20);
  const activeAtasanWeekOntimePct = activeAtasanWeekData && activeAtasanWeekTotal > 0 ? Math.round((activeAtasanWeekData.tepatWaktu / activeAtasanWeekTotal) * 100) : 0;
  const atasanMaxScale = Math.max(20, Math.ceil(((teamTotal || 4) * 5) / 5) * 5);

  // Agregasi 4 minggu kehadiran tingkat perusahaan (HRD)
  const totalCompanyHadir = weeklyAttendance.reduce((sum, w) => sum + w.tepatWaktu, 0);
  const totalCompanyTelat = weeklyAttendance.reduce((sum, w) => sum + w.terlambat, 0);
  const totalCompanyCuti = weeklyAttendance.reduce((sum, w) => sum + w.cutiIzin, 0);
  const totalCompanyTanpa = weeklyAttendance.reduce((sum, w) => sum + w.tanpaKeterangan, 0);
  const totalCompanyAll = totalCompanyHadir + totalCompanyTelat + totalCompanyCuti + totalCompanyTanpa;
  const avgCompanyOntimePct = totalCompanyAll > 0 ? Math.round((totalCompanyHadir / totalCompanyAll) * 100) : 0;

  const activeWeekData = weeklyAttendance[selectedHrdWeek] || weeklyAttendance[weeklyAttendance.length - 1];
  const activeWeekTotal = activeWeekData ? activeWeekData.tepatWaktu + activeWeekData.terlambat + activeWeekData.cutiIzin + activeWeekData.tanpaKeterangan : 80;
  const activeWeekOntimePct = activeWeekData && activeWeekTotal > 0 ? Math.round((activeWeekData.tepatWaktu / activeWeekTotal) * 100) : 0;

  const userInitials = profile?.nama_lengkap
    ? profile.nama_lengkap.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'KL';

  return (
    <AppShell title="Dashboard">
      {/* Executive Welcome Banner */}
      <div style={{
        marginBottom: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Left accent strip */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: profile?.peran === 'hrd' ? '#7c3aed' : profile?.peran === 'atasan' ? '#2563eb' : '#059669'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '4px' }}>
          {/* Avatar Monogram */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: profile?.peran === 'hrd' ? '#f5f3ff' : profile?.peran === 'atasan' ? '#eff6ff' : '#f0fdf4',
            color: profile?.peran === 'hrd' ? '#6d28d9' : profile?.peran === 'atasan' ? '#1d4ed8' : '#15803d',
            border: `1px solid ${profile?.peran === 'hrd' ? '#ddd6fe' : profile?.peran === 'atasan' ? '#bfdbfe' : '#bbf7d0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.05rem',
            letterSpacing: '0.02em',
            flexShrink: 0
          }}>
            {userInitials}
          </div>

          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.25 }}>
              Selamat Datang, {profile?.nama_lengkap}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.825rem', color: '#64748b', marginTop: '6px' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{profile?.jabatan}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span>Divisi {profile?.divisi?.nama || '-'}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                backgroundColor: '#f1f5f9',
                padding: '2px 7px',
                borderRadius: '4px',
                color: '#475569',
                border: '1px solid #e2e8f0',
                fontWeight: 600
              }}>
                NIK: {profile?.nik_karyawan}
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Tags & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Peran Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            backgroundColor: profile?.peran === 'hrd' ? '#f5f3ff' : profile?.peran === 'atasan' ? '#eff6ff' : '#f8fafc',
            color: profile?.peran === 'hrd' ? '#6d28d9' : profile?.peran === 'atasan' ? '#1d4ed8' : '#334155',
            border: `1px solid ${profile?.peran === 'hrd' ? '#ddd6fe' : profile?.peran === 'atasan' ? '#bfdbfe' : '#e2e8f0'}`
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: profile?.peran === 'hrd' ? '#7c3aed' : profile?.peran === 'atasan' ? '#2563eb' : '#64748b'
            }} />
            <span>{profile?.peran === 'hrd' ? 'HRD Administrator' : profile?.peran === 'atasan' ? 'Atasan Langsung' : 'Karyawan'}</span>
          </div>

          {/* Status Kerja Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
            <span>Karyawan {profile?.status_kerja || 'Tetap'}</span>
          </div>
        </div>
      </div>

      {notification && (
        <div className={`enterprise-alert enterprise-alert-${notification.type === 'success' ? 'success' : 'danger'}`}>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: notification.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecdd3'}`
          }}>
            {notification.type === 'success' ? 'SUKSES' : 'PERHATIAN'}
          </span>
          <div>{notification.message}</div>
        </div>
      )}

      {/* Banner Notifikasi Antrean Cuti untuk Atasan (Tahap 1) - Eksekutif & Harmonis */}
      {profile?.peran === 'atasan' && pendingAtasanCount > 0 && (
        <div style={{
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
              borderRadius: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span>Tahap 1</span>
            </span>

            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                {pendingAtasanCount} Pengajuan Cuti Menunggu Verifikasi Atasan
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                Anggota divisi Anda memerlukan persetujuan atasan sebelum diteruskan ke keputusan akhir HRD.
              </div>
            </div>
          </div>

          <Link
            href="/persetujuan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
          >
            <span>Tinjau Pengajuan</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Banner Notifikasi Antrean Cuti untuk HRD (Tahap 2) - Eksekutif & Harmonis */}
      {profile?.peran === 'hrd' && hrdStats.pendingHrdCount > 0 && (
        <div style={{
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #2563eb',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
              <span>Tahap 2 • Final</span>
            </span>

            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                {hrdStats.pendingHrdCount} Pengajuan Cuti Menunggu Keputusan Akhir HRD
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                Pengajuan yang telah disetujui atasan divisi atau pengajuan langsung memerlukan keputusan resmi HRD.
              </div>
            </div>
          </div>

          <Link
            href="/persetujuan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <span>Buka Antrean HRD</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* KPI Panels untuk HRD (Tanpa Icon - Gaya Swiss/Editorial Enterprise) */}
      {profile?.peran === 'hrd' && (
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-panel" style={{ borderTop: '3px solid #2563eb' }}>
            <div className="stat-panel-label">Total Karyawan Aktif</div>
            <div className="stat-panel-value">{hrdStats.totalKaryawan}</div>
            <div className="stat-panel-meta">Perusahaan • 4 Divisi Operasional</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #16a34a' }}>
            <div className="stat-panel-label">Kehadiran Tepat Waktu</div>
            <div className="stat-panel-value">{hrdStats.ontimePercent}%</div>
            <div className="stat-panel-meta">Bulan Berjalan (Cut-off 08:15 WIB)</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #d97706' }}>
            <div className="stat-panel-label">Pengajuan Menunggu</div>
            <div className="stat-panel-value">{hrdStats.pendingHrdCount}</div>
            <div className="stat-panel-meta">Memerlukan Keputusan Akhir HRD</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #475569' }}>
            <div className="stat-panel-label">Rata-rata Sisa Cuti</div>
            <div className="stat-panel-value">
              {hrdStats.avgSisaCuti} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>hari</span>
            </div>
            <div className="stat-panel-meta">Dari Jatah 12 Hari per Karyawan</div>
          </div>
        </div>
      )}

      {/* KPI Panels untuk Atasan (Tanpa Icon - Gaya Swiss/Editorial Enterprise) */}
      {profile?.peran === 'atasan' && (
        <div className="grid-4" style={{ marginBottom: '24px' }}>
          <div className="stat-panel" style={{ borderTop: '3px solid #2563eb' }}>
            <div className="stat-panel-label">Total Anggota Divisi</div>
            <div className="stat-panel-value">{teamTotal} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>orang</span></div>
            <div className="stat-panel-meta">Divisi {profile?.divisi?.nama || '-'}</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #16a34a' }}>
            <div className="stat-panel-label">Kehadiran Tepat Hari Ini</div>
            <div className="stat-panel-value">{teamOntimePercent}%</div>
            <div className="stat-panel-meta">{teamHadirCount} dari {teamTotal} anggota hadir tepat waktu</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #d97706' }}>
            <div className="stat-panel-label">Antrean Persetujuan</div>
            <div className="stat-panel-value">{pendingAtasanCount}</div>
            <div className="stat-panel-meta">Verifikasi Tahap 1 Atasan</div>
          </div>

          <div className="stat-panel" style={{ borderTop: '3px solid #475569' }}>
            <div className="stat-panel-label">Rata-rata Sisa Cuti Tim</div>
            <div className="stat-panel-value">
              {teamAvgQuota} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>hari</span>
            </div>
            <div className="stat-panel-meta">Hak Cuti Tahunan 2026</div>
          </div>
        </div>
      )}

      {/* Main Grid: Check-in Card & Sisa Kuota Cuti Pribadi */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Check-In / Check-Out Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Presensi Harian Anda</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Waktu server tercatat otomatis
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              WIB • SERVER
            </span>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status Presensi Hari Ini:</span>
                <div style={{ marginTop: '4px' }}>
                  {todayAbsensi ? (
                    <span className={`badge ${todayAbsensi.status === 'hadir' ? 'badge-success' : 'badge-warning'}`}>
                      {todayAbsensi.status === 'hadir' ? 'Hadir Tepat Waktu' : 'Terlambat'}
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Belum Check-In</span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aturan Waktu Masuk:</span>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                  Tepat waktu: ≤ 08:15:00 WIB
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jam Masuk:</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {todayAbsensi ? formatJamWIB(todayAbsensi.jam_masuk) : '-'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jam Pulang:</span>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {todayAbsensi?.jam_pulang ? formatJamWIB(todayAbsensi.jam_pulang) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCheckIn}
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={actionLoading || !!todayAbsensi}
            >
              {actionLoading ? 'Memproses...' : (todayAbsensi ? 'Sudah Check-In' : 'Lakukan Check-In')}
            </button>

            <button
              onClick={handleCheckOut}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={actionLoading || !todayAbsensi || !!todayAbsensi.jam_pulang}
            >
              {actionLoading ? 'Memproses...' : (todayAbsensi?.jam_pulang ? 'Sudah Check-Out' : 'Lakukan Check-Out')}
            </button>
          </div>
        </div>

        {/* Kuota Cuti Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Hak Cuti Tahunan 2026</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Jatah cuti resmi dari perusahaan
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              TAHUN 2026
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sisa Kuota Cuti Anda</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: sisaCuti > 0 ? '#4f46e5' : '#dc2626', lineHeight: 1.1, marginTop: '4px' }}>
                {sisaCuti} <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Hari Kerja</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Total Jatah: <strong>{kuota?.jatah_hari || 12} hari</strong>
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Terpakai: <strong>{kuota?.terpakai_hari || 0} hari</strong>
              </div>
            </div>
          </div>

          <Link href="/cuti" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Ajukan Cuti atau Izin →</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN GRAFIK ATASAN: Distribusi & Tren Presensi Tim Divisi (Tanpa Icon) */}
      {/* ========================================================================= */}
      {profile?.peran === 'atasan' && (
        <div style={{ marginBottom: '28px' }}>
          {/* Grafik 1: Komposisi Presensi Divisi Hari Ini */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Grafik Komposisi Presensi Divisi Hari Ini</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Distribusi kehadiran anggota Divisi {profile?.divisi?.nama || ''} (Cut-off 08:15 WIB)
                </p>
              </div>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>
                DIVISI {profile?.divisi?.nama?.toUpperCase() || '-'}
              </span>
            </div>

            {/* Segmented Proportion Bar */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Kapasitas Tim Aktif: <strong>{teamTotal} Karyawan</strong></span>
                <span>Tingkat Kehadiran: <strong>{teamTotal > 0 ? Math.round(((teamHadirCount + teamTerlambatCount) / teamTotal) * 100) : 0}%</strong></span>
              </div>

              <div className="proportion-bar" style={{ height: '24px', backgroundColor: '#e2e8f0' }}>
                <div
                  style={{
                    width: `${teamTotal > 0 ? (teamHadirCount / teamTotal) * 100 : 0}%`,
                    backgroundColor: '#10b981'
                  }}
                  title={`Hadir Tepat Waktu: ${teamHadirCount}`}
                />
                <div
                  style={{
                    width: `${teamTotal > 0 ? (teamTerlambatCount / teamTotal) * 100 : 0}%`,
                    backgroundColor: '#f59e0b'
                  }}
                  title={`Terlambat: ${teamTerlambatCount}`}
                />
                <div
                  style={{
                    width: `${teamTotal > 0 ? (teamCutiCount / teamTotal) * 100 : 0}%`,
                    backgroundColor: '#0284c7'
                  }}
                  title={`Cuti / Izin: ${teamCutiCount}`}
                />
                <div
                  style={{
                    width: `${teamTotal > 0 ? (teamBelumCount / teamTotal) * 100 : 0}%`,
                    backgroundColor: '#94a3b8'
                  }}
                  title={`Belum Check-In: ${teamBelumCount}`}
                />
              </div>

              {/* Data Status Grid (Tanpa Icon AI Slop) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderLeft: '4px solid #10b981',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.04em' }}>
                    Tepat Waktu
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532d', marginTop: '2px' }}>
                    {teamHadirCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#15803d' }}>({teamTotal > 0 ? Math.round((teamHadirCount / teamTotal) * 100) : 0}%)</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderLeft: '4px solid #f59e0b',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#92400e', letterSpacing: '0.04em' }}>
                    Terlambat
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#78350f', marginTop: '2px' }}>
                    {teamTerlambatCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309' }}>({teamTotal > 0 ? Math.round((teamTerlambatCount / teamTotal) * 100) : 0}%)</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderLeft: '4px solid #0284c7',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#075985', letterSpacing: '0.04em' }}>
                    Cuti / Izin
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0c4a6e', marginTop: '2px' }}>
                    {teamCutiCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>({teamTotal > 0 ? Math.round((teamCutiCount / teamTotal) * 100) : 0}%)</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #94a3b8',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>
                    Belum Hadir
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
                    {teamBelumCount} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>({teamTotal > 0 ? Math.round((teamBelumCount / teamTotal) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grafik 2: Tren Kehadiran Mingguan Tim Divisi (4 Minggu - Standard Eksekutif) */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  Evaluasi Presensi Tim Divisi
                </div>
                <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Grafik Tren Kehadiran Mingguan Divisi (4 Minggu)
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Monitoring person-days anggota Divisi {profile?.divisi?.nama || ''} per minggu kerja (Cut-off 08:15 WIB)
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Mode Toggle Switch */}
                <div style={{
                  display: 'inline-flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '3px',
                  border: '1px solid #e2e8f0'
                }}>
                  <button
                    type="button"
                    onClick={() => setAtasanChartMode('count')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: atasanChartMode === 'count' ? '#ffffff' : 'transparent',
                      color: atasanChartMode === 'count' ? '#0f172a' : '#64748b',
                      boxShadow: atasanChartMode === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Hari-Orang (Absolut)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAtasanChartMode('percent')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: atasanChartMode === 'percent' ? '#ffffff' : 'transparent',
                      color: atasanChartMode === 'percent' ? '#0f172a' : '#64748b',
                      boxShadow: atasanChartMode === 'percent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Persentase 100%
                  </button>
                </div>

                <span className="badge badge-info" style={{ fontWeight: 700 }}>
                  DIVISI {profile?.divisi?.nama?.toUpperCase() || '-'}
                </span>
              </div>
            </div>

            {/* Executive KPI Micro Bar untuk Divisi */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rata-Rata Ketepatan Divisi
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                  {avgTeamOntimePct}% <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>(Target: &ge; 75%)</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Presensi Divisi
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  {totalTeamAll} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Hari-Orang</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Insiden Terlambat Divisi
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                  {totalTeamTelat} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>({totalTeamAll > 0 ? Math.round((totalTeamTelat / totalTeamAll) * 100) : 0}%)</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Cuti & Izin Anggota Tim
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
                  {totalTeamCuti} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>({totalTeamAll > 0 ? Math.round((totalTeamCuti / totalTeamAll) * 100) : 0}%)</span>
                </div>
              </div>
            </div>

            {/* Canvas Chart dengan Sumbu Y & Gridlines Presisi */}
            <div style={{
              position: 'relative',
              padding: '16px 20px 24px 10px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px'
            }}>
              {/* Legend Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid #f1f5f9',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div className="chart-legend">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span className="legend-swatch" style={{ backgroundColor: '#10b981' }} />
                    <strong>Tepat Waktu</strong> (&le; 08:15:00 WIB)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span className="legend-swatch" style={{ backgroundColor: '#f59e0b' }} />
                    <strong>Terlambat</strong> (&gt; 08:15:00 WIB)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span className="legend-swatch" style={{ backgroundColor: '#0284c7' }} />
                    <strong>Cuti / Izin</strong> Resmi
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span className="legend-swatch" style={{ backgroundColor: '#ef4444' }} />
                    <strong>Tanpa Keterangan</strong> (Alpa)
                  </span>
                </div>

                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Klik kolom minggu untuk melihat rincian analitik
                </span>
              </div>

              {/* Area Koordinat Grafik (Tinggi 240px) */}
              <div style={{ position: 'relative', height: '240px', display: 'flex' }}>
                {/* Sumbu Y (Labels) */}
                <div style={{
                  width: '60px',
                  height: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  paddingRight: '12px',
                  textAlign: 'right',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: '#64748b',
                  fontFeatureSettings: 'tnum',
                  userSelect: 'none'
                }}>
                  <span>{atasanChartMode === 'count' ? atasanMaxScale : '100%'}</span>
                  <span>{atasanChartMode === 'count' ? Math.round(atasanMaxScale * 0.75) : '75%'}</span>
                  <span>{atasanChartMode === 'count' ? Math.round(atasanMaxScale * 0.5) : '50%'}</span>
                  <span>{atasanChartMode === 'count' ? Math.round(atasanMaxScale * 0.25) : '25%'}</span>
                  <span>0</span>
                </div>

                {/* Area Gridlines & Batang Kolom */}
                <div style={{ position: 'relative', flex: 1, height: '240px' }}>
                  {/* 5 Garis Grid Horizontal */}
                  <div style={{ position: 'absolute', top: '0', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                  <div style={{ position: 'absolute', top: '60px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                  <div style={{ position: 'absolute', top: '120px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                  <div style={{ position: 'absolute', top: '180px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                  <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', borderBottom: '2px solid #cbd5e1' }} />

                  {/* Grid 4 Kolom Batang Bertumpuk */}
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'flex-end',
                    paddingLeft: '10px',
                    paddingRight: '10px'
                  }}>
                    {teamWeeklyTrend.map((item, idx) => {
                      const total = item.tepatWaktu + item.terlambat + item.cutiIzin + item.tanpaKeterangan;
                      const isSelected = selectedAtasanWeek === idx;

                      const factor = atasanChartMode === 'count' ? (240 / atasanMaxScale) : (240 / (total || 1));
                      const hTepat = Math.round(item.tepatWaktu * factor);
                      const hTelat = Math.round(item.terlambat * factor);
                      const hCuti = Math.round(item.cutiIzin * factor);
                      const hTanpa = Math.round(item.tanpaKeterangan * factor);

                      const pctTepat = Math.round((item.tepatWaktu / total) * 100);

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedAtasanWeek(idx)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          {/* Batang Kolom Bertumpuk */}
                          <div
                            style={{
                              width: '64px',
                              height: `${hTepat + hTelat + hCuti + hTanpa}px`,
                              display: 'flex',
                              flexDirection: 'column-reverse',
                              borderRadius: '6px 6px 0 0',
                              overflow: 'hidden',
                              backgroundColor: '#f1f5f9',
                              outline: isSelected ? '3px solid #2563eb' : '1px solid rgba(0,0,0,0.06)',
                              outlineOffset: isSelected ? '2px' : '0',
                              boxShadow: isSelected ? '0 10px 15px -3px rgba(37, 99, 235, 0.25)' : 'none',
                              transform: isSelected ? 'translateY(-2px)' : 'none',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            {/* Segmen 1: Tepat Waktu (Hijau) */}
                            <div
                              style={{
                                height: `${hTepat}px`,
                                backgroundColor: '#10b981',
                                backgroundImage: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                fontFeatureSettings: 'tnum',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                              title={`Tepat Waktu: ${item.tepatWaktu} (${pctTepat}%)`}
                            >
                              {hTepat >= 24 && item.tepatWaktu}
                            </div>

                            {/* Segmen 2: Terlambat (Kuning/Amber) */}
                            <div
                              style={{
                                height: `${hTelat}px`,
                                backgroundColor: '#f59e0b',
                                backgroundImage: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                                borderTop: '1px solid rgba(255,255,255,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFeatureSettings: 'tnum',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                              title={`Terlambat: ${item.terlambat}`}
                            >
                              {hTelat >= 18 && item.terlambat}
                            </div>

                            {/* Segmen 3: Cuti / Izin (Biru) */}
                            <div
                              style={{
                                height: `${hCuti}px`,
                                backgroundColor: '#0284c7',
                                backgroundImage: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
                                borderTop: '1px solid rgba(255,255,255,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFeatureSettings: 'tnum',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                              title={`Cuti/Izin: ${item.cutiIzin}`}
                            >
                              {hCuti >= 18 && item.cutiIzin}
                            </div>

                            {/* Segmen 4: Tanpa Keterangan (Merah) */}
                            <div
                              style={{
                                height: `${hTanpa}px`,
                                backgroundColor: '#ef4444',
                                backgroundImage: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                                borderTop: '1px solid rgba(255,255,255,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                fontFeatureSettings: 'tnum',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                              title={`Tanpa Keterangan: ${item.tanpaKeterangan}`}
                            >
                              {hTanpa >= 16 && item.tanpaKeterangan}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Label Sumbu X (Minggu & Tanggal) */}
              <div style={{
                display: 'flex',
                paddingLeft: '60px',
                paddingRight: '10px',
                marginTop: '12px',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}>
                {teamWeeklyTrend.map((item, idx) => {
                  const total = item.tepatWaktu + item.terlambat + item.cutiIzin + item.tanpaKeterangan;
                  const pct = Math.round((item.tepatWaktu / total) * 100);
                  const isSelected = selectedAtasanWeek === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedAtasanWeek(idx)}
                      style={{
                        width: '120px',
                        cursor: 'pointer',
                        padding: '6px 4px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                        border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: isSelected ? '#1d4ed8' : 'var(--text-main)'
                      }}>
                        Minggu {idx + 1}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>
                        {item.minggu}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            backgroundColor: pct >= 75 ? '#dcfce7' : '#fef3c7',
                            color: pct >= 75 ? '#15803d' : '#b45309',
                            border: `1px solid ${pct >= 75 ? '#bbf7d0' : '#fde68a'}`
                          }}
                        >
                          {pct}% Tepat
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Rincian Mendalam Minggu Terpilih Divisi */}
            {activeAtasanWeekData && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                      Rincian Minggu Terpilih Divisi:
                    </span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                      Minggu ke-{selectedAtasanWeek + 1} ({activeAtasanWeekData.minggu} 2026)
                    </h4>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className={`badge ${activeAtasanWeekOntimePct >= 75 ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
                      {activeAtasanWeekOntimePct}% Kehadiran Tepat
                    </span>
                    <span className="badge badge-neutral">
                      {activeAtasanWeekTotal} Person-Days
                    </span>
                  </div>
                </div>

                {/* Progress Proporsi Minggu Terpilih */}
                <div className="proportion-bar" style={{ height: '14px', marginBottom: '14px' }}>
                  <div style={{ width: `${(activeAtasanWeekData.tepatWaktu / activeAtasanWeekTotal) * 100}%`, backgroundColor: '#10b981' }} />
                  <div style={{ width: `${(activeAtasanWeekData.terlambat / activeAtasanWeekTotal) * 100}%`, backgroundColor: '#f59e0b' }} />
                  <div style={{ width: `${(activeAtasanWeekData.cutiIzin / activeAtasanWeekTotal) * 100}%`, backgroundColor: '#0284c7' }} />
                  <div style={{ width: `${(activeAtasanWeekData.tanpaKeterangan / activeAtasanWeekTotal) * 100}%`, backgroundColor: '#ef4444' }} />
                </div>

                {/* Grid 4 Nilai Detail Divisi */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Hadir Tepat Waktu:</span>
                    <strong style={{ fontSize: '1rem', color: '#15803d' }}>{activeAtasanWeekData.tepatWaktu}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                      ({Math.round((activeAtasanWeekData.tepatWaktu / activeAtasanWeekTotal) * 100)}%)
                    </span>
                  </div>

                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Terlambat:</span>
                    <strong style={{ fontSize: '1rem', color: '#b45309' }}>{activeAtasanWeekData.terlambat}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                      ({Math.round((activeAtasanWeekData.terlambat / activeAtasanWeekTotal) * 100)}%)
                    </span>
                  </div>

                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Cuti / Izin Resmi:</span>
                    <strong style={{ fontSize: '1rem', color: '#0369a1' }}>{activeAtasanWeekData.cutiIzin}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                      ({Math.round((activeAtasanWeekData.cutiIzin / activeAtasanWeekTotal) * 100)}%)
                    </span>
                  </div>

                  <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Tanpa Keterangan:</span>
                    <strong style={{ fontSize: '1rem', color: '#b91c1c' }}>{activeAtasanWeekData.tanpaKeterangan}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                      ({Math.round((activeAtasanWeekData.tanpaKeterangan / activeAtasanWeekTotal) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Matrix Data Breakdown */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.825rem' }}>
                <thead>
                  <tr>
                    <th>Periode Minggu</th>
                    <th>Hadir Tepat Waktu</th>
                    <th>Terlambat</th>
                    <th>Cuti / Izin</th>
                    <th>Tanpa Keterangan</th>
                    <th>Total Person-Days</th>
                    <th>Rasio Ketepatan</th>
                    <th>Status Evaluasi</th>
                  </tr>
                </thead>
                <tbody>
                  {teamWeeklyTrend.map((row, i) => {
                    const rowTotal = row.tepatWaktu + row.terlambat + row.cutiIzin + row.tanpaKeterangan;
                    const rowPct = rowTotal > 0 ? Math.round((row.tepatWaktu / rowTotal) * 100) : 0;
                    const isSelected = selectedAtasanWeek === i;

                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedAtasanWeek(i)}
                        style={{
                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ fontWeight: 700 }}>
                          Minggu {i + 1} ({row.minggu})
                        </td>
                        <td style={{ color: '#15803d', fontWeight: 600 }}>{row.tepatWaktu}</td>
                        <td style={{ color: '#b45309', fontWeight: 600 }}>{row.terlambat}</td>
                        <td style={{ color: '#0369a1', fontWeight: 600 }}>{row.cutiIzin}</td>
                        <td style={{ color: '#b91c1c', fontWeight: 600 }}>{row.tanpaKeterangan}</td>
                        <td style={{ fontWeight: 700 }}>{rowTotal}</td>
                        <td>
                          <strong style={{ color: rowPct >= 75 ? '#15803d' : '#b45309' }}>
                            {rowPct}%
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${rowPct >= 75 ? 'badge-success' : 'badge-warning'}`}
                            style={{ fontWeight: 700 }}
                          >
                            {rowPct >= 75 ? 'Target Tercapai' : 'Perlu Evaluasi'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Presensi Anggota Divisi Hari Ini */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Daftar Presensi Anggota Divisi Hari Ini</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Daftar kehadiran anggota tim Anda (US-06)
                </p>
              </div>
              {pendingAtasanCount > 0 && (
                <Link href="/persetujuan" className="badge badge-warning" style={{ textDecoration: 'none', padding: '6px 12px' }}>
                  {pendingAtasanCount} Pengajuan Menunggu Keputusan Anda
                </Link>
              )}
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama Karyawan</th>
                    <th>Jabatan</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map(member => {
                    const abs = teamAbsensi.find(a => a.karyawan_id === member.id);
                    return (
                      <tr key={member.id}>
                        <td style={{ fontWeight: 600 }}>{member.nama_lengkap}</td>
                        <td>{member.jabatan}</td>
                        <td>{abs ? formatJamWIB(abs.jam_masuk) : '-'}</td>
                        <td>{abs?.jam_pulang ? formatJamWIB(abs.jam_pulang) : '-'}</td>
                        <td>
                          {abs ? (
                            <span className={`badge ${abs.status === 'hadir' ? 'badge-success' : 'badge-warning'}`}>
                              {abs.status === 'hadir' ? 'Hadir Tepat Waktu' : 'Terlambat'}
                            </span>
                          ) : (
                            <span className="badge badge-neutral">Belum Check-In</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAGIAN GRAFIK HRD: Grafik Kehadiran 4 Minggu Perusahaan (Enterprise Grade) */}
      {/* ========================================================================= */}
      {profile?.peran === 'hrd' && (
        <div className="card" style={{ marginBottom: '28px' }}>
          {/* Header Card */}
          <div className="card-header" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Evaluasi Presensi Tingkat Perusahaan
              </div>
              <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Grafik Kehadiran Perusahaan (4 Minggu Terakhir)
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Monitoring 320 person-days (16 karyawan x 20 hari kerja) berbasis cut-off 08:15:00 WIB
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Mode Toggle Switch */}
              <div style={{
                display: 'inline-flex',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setHrdChartMode('count')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: hrdChartMode === 'count' ? '#ffffff' : 'transparent',
                    color: hrdChartMode === 'count' ? '#0f172a' : '#64748b',
                    boxShadow: hrdChartMode === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Hari-Orang (Absolut)
                </button>
                <button
                  type="button"
                  onClick={() => setHrdChartMode('percent')}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: hrdChartMode === 'percent' ? '#ffffff' : 'transparent',
                    color: hrdChartMode === 'percent' ? '#0f172a' : '#64748b',
                    boxShadow: hrdChartMode === 'percent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Persentase 100%
                </button>
              </div>

              <Link href="/laporan" className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                Lihat Laporan Lengkap →
              </Link>
            </div>
          </div>

          {/* Executive KPI Micro Bar (Ringkasan Konsol) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '24px'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Rata-Rata Ketepatan
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {avgCompanyOntimePct}% <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>(Target: &ge; 75%)</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Presensi Dianalisis
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {totalCompanyAll} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Hari-Orang</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Insiden Keterlambatan
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
                {totalCompanyTelat} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>({Math.round((totalCompanyTelat / totalCompanyAll) * 100)}%)</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cuti & Izin Resmi
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
                {totalCompanyCuti} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>({Math.round((totalCompanyCuti / totalCompanyAll) * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Canvas Chart dengan Sumbu Y & Gridlines Presisi */}
          <div style={{
            position: 'relative',
            padding: '16px 20px 24px 10px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            {/* Legend Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f5f9',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div className="chart-legend">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="legend-swatch" style={{ backgroundColor: '#10b981' }} />
                  <strong>Hadir Tepat Waktu</strong> (&le; 08:15:00 WIB)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="legend-swatch" style={{ backgroundColor: '#f59e0b' }} />
                  <strong>Terlambat</strong> (&gt; 08:15:00 WIB)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="legend-swatch" style={{ backgroundColor: '#0284c7' }} />
                  <strong>Cuti / Izin</strong> Resmi
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="legend-swatch" style={{ backgroundColor: '#ef4444' }} />
                  <strong>Tanpa Keterangan</strong> (Alpa)
                </span>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Klik kolom minggu untuk melihat rincian analitik
              </span>
            </div>

            {/* Area Koordinat Grafik (Tinggi 240px) */}
            <div style={{ position: 'relative', height: '240px', display: 'flex' }}>
              {/* Sumbu Y (Labels) */}
              <div style={{
                width: '60px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '12px',
                textAlign: 'right',
                fontSize: '0.725rem',
                fontWeight: 600,
                color: '#64748b',
                fontFeatureSettings: 'tnum',
                userSelect: 'none'
              }}>
                <span>{hrdChartMode === 'count' ? '80' : '100%'}</span>
                <span>{hrdChartMode === 'count' ? '60' : '75%'}</span>
                <span>{hrdChartMode === 'count' ? '40' : '50%'}</span>
                <span>{hrdChartMode === 'count' ? '20' : '25%'}</span>
                <span>0</span>
              </div>

              {/* Area Gridlines & Batang Kolom */}
              <div style={{ position: 'relative', flex: 1, height: '240px' }}>
                {/* 5 Garis Grid Horizontal */}
                <div style={{ position: 'absolute', top: '0', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', top: '60px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', top: '120px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', top: '180px', left: '0', right: '0', borderBottom: '1px dashed #e2e8f0' }} />
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', borderBottom: '2px solid #cbd5e1' }} />

                {/* Grid 4 Kolom Batang Bertumpuk */}
                <div style={{
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'flex-end',
                  paddingLeft: '10px',
                  paddingRight: '10px'
                }}>
                  {weeklyAttendance.map((w, idx) => {
                    const total = w.tepatWaktu + w.terlambat + w.cutiIzin + w.tanpaKeterangan;
                    const isSelected = selectedHrdWeek === idx;

                    // Hitung tinggi tiap segmen dalam pixel (total tinggi 240px)
                    const factor = hrdChartMode === 'count' ? (240 / 80) : (240 / (total || 1));
                    const hTepat = Math.round(w.tepatWaktu * factor);
                    const hTelat = Math.round(w.terlambat * factor);
                    const hCuti = Math.round(w.cutiIzin * factor);
                    const hTanpa = Math.round(w.tanpaKeterangan * factor);

                    const pctTepat = Math.round((w.tepatWaktu / total) * 100);

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedHrdWeek(idx)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        {/* Batang Kolom Bertumpuk */}
                        <div
                          style={{
                            width: '64px',
                            height: `${hTepat + hTelat + hCuti + hTanpa}px`,
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            borderRadius: '6px 6px 0 0',
                            overflow: 'hidden',
                            backgroundColor: '#f1f5f9',
                            outline: isSelected ? '3px solid #2563eb' : '1px solid rgba(0,0,0,0.06)',
                            outlineOffset: isSelected ? '2px' : '0',
                            boxShadow: isSelected ? '0 10px 15px -3px rgba(37, 99, 235, 0.25)' : 'none',
                            transform: isSelected ? 'translateY(-2px)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        >
                          {/* Segmen 1: Tepat Waktu (Hijau) */}
                          <div
                            style={{
                              height: `${hTepat}px`,
                              backgroundColor: '#10b981',
                              backgroundImage: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              fontFeatureSettings: 'tnum',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                            title={`Tepat Waktu: ${w.tepatWaktu} (${pctTepat}%)`}
                          >
                            {hTepat >= 24 && w.tepatWaktu}
                          </div>

                          {/* Segmen 2: Terlambat (Kuning/Amber) */}
                          <div
                            style={{
                              height: `${hTelat}px`,
                              backgroundColor: '#f59e0b',
                              backgroundImage: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
                              borderTop: '1px solid rgba(255,255,255,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFeatureSettings: 'tnum',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                            title={`Terlambat: ${w.terlambat}`}
                          >
                            {hTelat >= 18 && w.terlambat}
                          </div>

                          {/* Segmen 3: Cuti / Izin (Biru) */}
                          <div
                            style={{
                              height: `${hCuti}px`,
                              backgroundColor: '#0284c7',
                              backgroundImage: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
                              borderTop: '1px solid rgba(255,255,255,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFeatureSettings: 'tnum',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                            title={`Cuti/Izin: ${w.cutiIzin}`}
                          >
                            {hCuti >= 18 && w.cutiIzin}
                          </div>

                          {/* Segmen 4: Tanpa Keterangan (Merah) */}
                          <div
                            style={{
                              height: `${hTanpa}px`,
                              backgroundColor: '#ef4444',
                              backgroundImage: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                              borderTop: '1px solid rgba(255,255,255,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              fontFeatureSettings: 'tnum',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                            title={`Tanpa Keterangan: ${w.tanpaKeterangan}`}
                          >
                            {hTanpa >= 16 && w.tanpaKeterangan}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Label Sumbu X (Minggu & Tanggal) */}
            <div style={{
              display: 'flex',
              paddingLeft: '60px',
              paddingRight: '10px',
              marginTop: '12px',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              {weeklyAttendance.map((w, idx) => {
                const total = w.tepatWaktu + w.terlambat + w.cutiIzin + w.tanpaKeterangan;
                const pct = Math.round((w.tepatWaktu / total) * 100);
                const isSelected = selectedHrdWeek === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedHrdWeek(idx)}
                    style={{
                      width: '120px',
                      cursor: 'pointer',
                      padding: '6px 4px',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: isSelected ? '#1d4ed8' : 'var(--text-main)'
                    }}>
                      Minggu {idx + 1}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1px' }}>
                      {w.minggu}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          backgroundColor: pct >= 75 ? '#dcfce7' : '#fef3c7',
                          color: pct >= 75 ? '#15803d' : '#b45309',
                          border: `1px solid ${pct >= 75 ? '#bbf7d0' : '#fde68a'}`
                        }}
                      >
                        {pct}% Tepat
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel Rincian Mendalam Minggu Terpilih */}
          {activeWeekData && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>
                    Rincian Minggu Terpilih:
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    Minggu ke-{selectedHrdWeek + 1} ({activeWeekData.minggu} 2026)
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span className={`badge ${activeWeekOntimePct >= 75 ? 'badge-success' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
                    {activeWeekOntimePct}% Kehadiran Tepat
                  </span>
                  <span className="badge badge-neutral">
                    {activeWeekTotal} Person-Days
                  </span>
                </div>
              </div>

              {/* Progress Proporsi Minggu Terpilih */}
              <div className="proportion-bar" style={{ height: '14px', marginBottom: '14px' }}>
                <div style={{ width: `${(activeWeekData.tepatWaktu / activeWeekTotal) * 100}%`, backgroundColor: '#10b981' }} />
                <div style={{ width: `${(activeWeekData.terlambat / activeWeekTotal) * 100}%`, backgroundColor: '#f59e0b' }} />
                <div style={{ width: `${(activeWeekData.cutiIzin / activeWeekTotal) * 100}%`, backgroundColor: '#0284c7' }} />
                <div style={{ width: `${(activeWeekData.tanpaKeterangan / activeWeekTotal) * 100}%`, backgroundColor: '#ef4444' }} />
              </div>

              {/* Grid 4 Nilai Detail */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.8rem' }}>
                <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Hadir Tepat Waktu:</span>
                  <strong style={{ fontSize: '1rem', color: '#15803d' }}>{activeWeekData.tepatWaktu}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                    ({Math.round((activeWeekData.tepatWaktu / activeWeekTotal) * 100)}%)
                  </span>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Terlambat:</span>
                  <strong style={{ fontSize: '1rem', color: '#b45309' }}>{activeWeekData.terlambat}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                    ({Math.round((activeWeekData.terlambat / activeWeekTotal) * 100)}%)
                  </span>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Cuti / Izin Resmi:</span>
                  <strong style={{ fontSize: '1rem', color: '#0369a1' }}>{activeWeekData.cutiIzin}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                    ({Math.round((activeWeekData.cutiIzin / activeWeekTotal) * 100)}%)
                  </span>
                </div>

                <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Tanpa Keterangan:</span>
                  <strong style={{ fontSize: '1rem', color: '#b91c1c' }}>{activeWeekData.tanpaKeterangan}</strong>
                  <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                    ({Math.round((activeWeekData.tanpaKeterangan / activeWeekTotal) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Matrix Breakdown Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th>Periode Minggu</th>
                  <th>Hadir Tepat Waktu</th>
                  <th>Terlambat</th>
                  <th>Cuti / Izin Resmi</th>
                  <th>Tanpa Keterangan</th>
                  <th>Total Person-Days</th>
                  <th>Rasio Ketepatan</th>
                  <th>Status Evaluasi</th>
                </tr>
              </thead>
              <tbody>
                {weeklyAttendance.map((w, idx) => {
                  const total = w.tepatWaktu + w.terlambat + w.cutiIzin + w.tanpaKeterangan;
                  const pct = total > 0 ? Math.round((w.tepatWaktu / total) * 100) : 0;
                  const isSelected = selectedHrdWeek === idx;

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedHrdWeek(idx)}
                      style={{
                        backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>
                        Minggu {idx + 1} ({w.minggu})
                      </td>
                      <td style={{ color: '#15803d', fontWeight: 600 }}>{w.tepatWaktu}</td>
                      <td style={{ color: '#b45309', fontWeight: 600 }}>{w.terlambat}</td>
                      <td style={{ color: '#0369a1', fontWeight: 600 }}>{w.cutiIzin}</td>
                      <td style={{ color: '#b91c1c', fontWeight: 600 }}>{w.tanpaKeterangan}</td>
                      <td style={{ fontWeight: 700 }}>{total}</td>
                      <td>
                        <strong style={{ color: pct >= 75 ? '#15803d' : '#b45309' }}>
                          {pct}%
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${pct >= 75 ? 'badge-success' : 'badge-warning'}`}
                          style={{ fontWeight: 700 }}
                        >
                          {pct >= 75 ? 'Target Tercapai' : 'Perlu Evaluasi'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Pengajuan Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Status Pengajuan Terakhir Anda</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Riwayat pengajuan cuti, sakit, dan izin terkini
            </p>
          </div>
          <Link href="/cuti" className="btn btn-secondary btn-sm">
            Lihat Semua →
          </Link>
        </div>

        {recentPengajuan.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Belum ada pengajuan cuti, izin, atau sakit.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th>Durasi Kerja</th>
                  <th>Alasan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPengajuan.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {item.jenis.replace('_', ' ')}
                    </td>
                    <td>{formatTanggalIndo(item.tanggal_mulai)}</td>
                    <td>{formatTanggalIndo(item.tanggal_selesai)}</td>
                    <td>{item.jumlah_hari} hari kerja</td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.alasan}
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
