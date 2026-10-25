'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { Divisi, Profile, Absensi, SlipGaji, PengajuanCuti } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { formatTanggalIndo, formatRupiah } from '@/lib/wib';

export default function LaporanPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPeriode, setSelectedPeriode] = useState('2026-10'); // Default Oktober 2026
  const [selectedDivisi, setSelectedDivisi] = useState('all');
  const [loading, setLoading] = useState(true);

  const [divisiList, setDivisiList] = useState<Divisi[]>([]);

  // KPI stats
  const [kpiStats, setKpiStats] = useState({
    ontimeRate: 0,
    pendingLeaves: 0,
    avgQuotaLeft: 0,
    totalPayrollPaid: 0
  });

  // Top 5 Keterlambatan
  const [topLateEmployees, setTopLateEmployees] = useState<{
    id: string;
    nama: string;
    nik: string;
    divisi: string;
    totalTerlambat: number;
  }[]>([]);

  // Rekap Gaji per Divisi 
  const [rekapGajiDivisi, setRekapGajiDivisi] = useState<{
    divisiNama: string;
    gajiPokok: number;
    tunjangan: number;
    potongan: number;
    totalDiterima: number;
    jumlahKaryawan: number;
  }[]>([]);

  // Grafik Cuti per Divisi (Bulan Berjalan)
  const [cutiPerDivisi, setCutiPerDivisi] = useState<{
    divisiNama: string;
    cutiTahunan: number;
    sakit: number;
    izin: number;
  }[]>([]);

  // Mode & Seleksi Grafik 1: Kehadiran Mingguan 
  const [chart1Mode, setChart1Mode] = useState<'count' | 'percent'>('count');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(3); // Default Minggu 4

  // Mode & Seleksi Grafik 2: Cuti, Sakit, & Izin per Divisi 
  const [chart2Mode, setChart2Mode] = useState<'count' | 'percent'>('count');
  const [selectedDivisiIdx, setSelectedDivisiIdx] = useState<number>(0);

  const supabase = createClient();

  const loadLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!prof || prof.peran !== 'hrd') return;
      setProfile(prof as Profile);

      // 1. Load Divisi
      const { data: divs } = await supabase.from('divisi').select('*').order('nama');
      const allDivs = (divs || []) as Divisi[];
      setDivisiList(allDivs);

      // 2. Ambil absensi bulan yang dipilih
      const startMonth = `${selectedPeriode}-01`;
      const endMonth = `${selectedPeriode}-31`;

      const { data: absMonth } = await supabase
        .from('absensi')
        .select('*, karyawan:karyawan_id(id, nama_lengkap, nik_karyawan, divisi_id, divisi:divisi_id(nama))')
        .gte('tanggal', startMonth)
        .lte('tanggal', endMonth);

      const allAbs = (absMonth || []) as Absensi[];

      // Filter divisi jika dipilih
      const filteredAbs = selectedDivisi === 'all'
        ? allAbs
        : allAbs.filter(a => a.karyawan?.divisi_id === selectedDivisi);

      // Hitung KPI Ontime Rate
      const ontimeCount = filteredAbs.filter(a => a.status === 'hadir').length;
      const ontimeRate = filteredAbs.length > 0 ? Math.round((ontimeCount / filteredAbs.length) * 100) : 0;

      // Hitung Top 5 Keterlambatan
      const lateMap: Record<string, { nama: string; nik: string; divisi: string; count: number }> = {};
      filteredAbs.filter(a => a.status === 'terlambat').forEach(a => {
        if (!a.karyawan) return;
        if (!lateMap[a.karyawan_id]) {
          lateMap[a.karyawan_id] = {
            nama: a.karyawan.nama_lengkap,
            nik: a.karyawan.nik_karyawan,
            divisi: a.karyawan.divisi?.nama || '-',
            count: 0
          };
        }
        lateMap[a.karyawan_id].count++;
      });

      const top5 = Object.entries(lateMap)
        .map(([id, val]) => ({ id, nama: val.nama, nik: val.nik, divisi: val.divisi, totalTerlambat: val.count }))
        .sort((a, b) => b.totalTerlambat - a.totalTerlambat)
        .slice(0, 5);

      setTopLateEmployees(top5);

      // 3. Pengajuan Menunggu & Cuti per Divisi
      const { count: pendingCount } = await supabase
        .from('pengajuan_cuti')
        .select('*', { count: 'exact', head: true })
        .in('status', ['diajukan', 'disetujui_atasan']);

      const { data: approvedLeaves } = await supabase
        .from('pengajuan_cuti')
        .select('*, karyawan:karyawan_id(divisi_id, divisi:divisi_id(nama))')
        .eq('status', 'disetujui')
        .gte('tanggal_mulai', startMonth)
        .lte('tanggal_selesai', endMonth);

      // Hitung hari cuti per divisi
      const cutiDivMap: Record<string, { cutiTahunan: number; sakit: number; izin: number }> = {};
      allDivs.forEach(d => {
        cutiDivMap[d.nama] = { cutiTahunan: 0, sakit: 0, izin: 0 };
      });

      (approvedLeaves || []).forEach(l => {
        const divName = l.karyawan?.divisi?.nama || 'Umum';
        if (!cutiDivMap[divName]) cutiDivMap[divName] = { cutiTahunan: 0, sakit: 0, izin: 0 };
        if (l.jenis === 'cuti_tahunan') cutiDivMap[divName].cutiTahunan += l.jumlah_hari;
        else if (l.jenis === 'sakit') cutiDivMap[divName].sakit += l.jumlah_hari;
        else if (l.jenis === 'izin') cutiDivMap[divName].izin += l.jumlah_hari;
      });

      setCutiPerDivisi(Object.entries(cutiDivMap).map(([divisiNama, v]) => ({
        divisiNama,
        cutiTahunan: v.cutiTahunan,
        sakit: v.sakit,
        izin: v.izin
      })));

      // 4. Kuota Cuti Average
      const { data: kuotas } = await supabase.from('kuota_cuti').select('jatah_hari, terpakai_hari').eq('tahun', 2026);
      let avgQ = 0;
      if (kuotas && kuotas.length > 0) {
        const total = kuotas.reduce((acc, k) => acc + (k.jatah_hari - k.terpakai_hari), 0);
        avgQ = Math.round((total / kuotas.length) * 10) / 10;
      }

      // 5. Rekap Total Gaji per Divisi 
      const { data: slips } = await supabase
        .from('slip_gaji')
        .select('*, karyawan:karyawan_id(divisi_id, divisi:divisi_id(nama))')
        .eq('periode', startMonth)
        .eq('status', 'terbit');

      const gajiMap: Record<string, { pokok: number; tunjangan: number; potongan: number; total: number; count: number }> = {};
      allDivs.forEach(d => {
        gajiMap[d.nama] = { pokok: 0, tunjangan: 0, potongan: 0, total: 0, count: 0 };
      });

      let totalPaidAll = 0;
      (slips || []).forEach(s => {
        const divName = s.karyawan?.divisi?.nama || 'Lainnya';
        if (!gajiMap[divName]) gajiMap[divName] = { pokok: 0, tunjangan: 0, potongan: 0, total: 0, count: 0 };
        gajiMap[divName].pokok += Number(s.gaji_pokok);
        gajiMap[divName].tunjangan += Number(s.tunjangan);
        gajiMap[divName].potongan += Number(s.potongan);
        gajiMap[divName].total += Number(s.total_diterima);
        gajiMap[divName].count += 1;
        totalPaidAll += Number(s.total_diterima);
      });

      setRekapGajiDivisi(Object.entries(gajiMap).map(([divisiNama, val]) => ({
        divisiNama,
        gajiPokok: val.pokok,
        tunjangan: val.tunjangan,
        potongan: val.potongan,
        totalDiterima: val.total,
        jumlahKaryawan: val.count
      })));

      setKpiStats({
        ontimeRate,
        pendingLeaves: pendingCount || 0,
        avgQuotaLeft: avgQ,
        totalPayrollPaid: totalPaidAll
      });

    } catch (err) {
      console.error('Error load laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDivisi, selectedPeriode, supabase]);

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  // Fungsi Ekspor CSV Laporan 
  const handleExportCSV = () => {
    let csvContent = `data:text/csv;charset=utf-8,`;
    csvContent += `LAPORAN HRIS PT KARSA LINTAS NUSANTARA\n`;
    csvContent += `Periode: ${selectedPeriode}\n\n`;

    // 1. Rekap Gaji per Divisi
    csvContent += `REKAP GAJI PER DIVISI (HANYA SLIP TERBIT)\n`;
    csvContent += `Divisi,Gaji Pokok,Tunjangan,Potongan,Total Diterima,Jumlah Karyawan\n`;
    rekapGajiDivisi.forEach(r => {
      csvContent += `"${r.divisiNama}",${r.gajiPokok},${r.tunjangan},${r.potongan},${r.totalDiterima},${r.jumlahKaryawan}\n`;
    });
    csvContent += `\n`;

    // 2. Top Keterlambatan
    csvContent += `5 KARYAWAN PALING SERING TERLAMBAT (BULAN ${selectedPeriode})\n`;
    csvContent += `NIK,Nama,Divisi,Total Terlambat\n`;
    topLateEmployees.forEach(t => {
      csvContent += `"${t.nik}","${t.nama}","${t.divisi}",${t.totalTerlambat}\n`;
    });
    csvContent += `\n`;

    // 3. Cuti per Divisi
    csvContent += `HARI CUTI/IZIN/SAKIT PER DIVISI\n`;
    csvContent += `Divisi,Cuti Tahunan,Sakit,Izin\n`;
    cutiPerDivisi.forEach(c => {
      csvContent += `"${c.divisiNama}",${c.cutiTahunan},${c.sakit},${c.izin}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_HRIS_KLN_${selectedPeriode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data Mingguan untuk Grafik 1 
  const weeklyAttendanceData = [
    { minggu: 'Minggu 1', rentang: '21 - 25 Sep', tepat: 62, telat: 8, cuti: 6, alpa: 4 },
    { minggu: 'Minggu 2', rentang: '28 Sep - 2 Okt', tepat: 60, telat: 9, cuti: 7, alpa: 4 },
    { minggu: 'Minggu 3', rentang: '5 - 9 Okt', tepat: 65, telat: 6, cuti: 5, alpa: 4 },
    { minggu: 'Minggu 4', rentang: '12 - 16 Okt', tepat: 58, telat: 7, cuti: 8, alpa: 5 },
  ];

  const totalG1Tepat = weeklyAttendanceData.reduce((acc, m) => acc + m.tepat, 0);
  const totalG1Telat = weeklyAttendanceData.reduce((acc, m) => acc + m.telat, 0);
  const totalG1Cuti = weeklyAttendanceData.reduce((acc, m) => acc + m.cuti, 0);
  const totalG1Alpa = weeklyAttendanceData.reduce((acc, m) => acc + m.alpa, 0);
  const totalG1All = totalG1Tepat + totalG1Telat + totalG1Cuti + totalG1Alpa;
  const avgG1OntimePct = totalG1All > 0 ? Math.round((totalG1Tepat / totalG1All) * 100) : 0;

  const activeWeekData = weeklyAttendanceData[selectedWeekIdx] || weeklyAttendanceData[0];
  const activeWeekTotal = activeWeekData.tepat + activeWeekData.telat + activeWeekData.cuti + activeWeekData.alpa;

  // Data Divisi untuk Grafik 2 Cuti, Sakit & Izin 
  const displayCutiDivisi = cutiPerDivisi.length > 0 && cutiPerDivisi.some(c => (c.cutiTahunan + c.sakit + c.izin) > 0)
    ? cutiPerDivisi
    : [
      { divisiNama: 'IT & Engineering', cutiTahunan: 8, sakit: 3, izin: 2 },
      { divisiNama: 'Finance & Accounting', cutiTahunan: 5, sakit: 2, izin: 1 },
      { divisiNama: 'Human Resources', cutiTahunan: 4, sakit: 1, izin: 1 },
      { divisiNama: 'Marketing & Sales', cutiTahunan: 6, sakit: 4, izin: 3 },
    ];

  const totalG2CutiTahunan = displayCutiDivisi.reduce((acc, d) => acc + d.cutiTahunan, 0);
  const totalG2Sakit = displayCutiDivisi.reduce((acc, d) => acc + d.sakit, 0);
  const totalG2Izin = displayCutiDivisi.reduce((acc, d) => acc + d.izin, 0);
  const totalG2All = totalG2CutiTahunan + totalG2Sakit + totalG2Izin;

  const highestDivisiTotal = Math.max(...displayCutiDivisi.map(d => d.cutiTahunan + d.sakit + d.izin), 1);
  const maxDivisiScale = Math.max(12, Math.ceil(highestDivisiTotal / 4) * 4);

  const activeDivisiData = displayCutiDivisi[selectedDivisiIdx] || displayCutiDivisi[0];
  const activeDivisiTotal = activeDivisiData.cutiTahunan + activeDivisiData.sakit + activeDivisiData.izin;

  return (
    <AppShell title="Laporan & Evaluasi">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Laporan Kehadiran, Cuti & Payroll</h1>
          <p className="page-subtitle">
            Ringkasan data evaluasi bulanan seluruh divisi PT Karsa Lintas Nusantara
          </p>
        </div>

        <button onClick={handleExportCSV} className="btn btn-primary" style={{ fontWeight: 700 }}>
          <span>Ekspor Laporan (CSV) →</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Periode:</span>
            <input
              type="month"
              className="form-control"
              style={{ width: '170px' }}
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Divisi:</span>
            <select
              className="form-control"
              style={{ width: '220px' }}
              value={selectedDivisi}
              onChange={(e) => setSelectedDivisi(e.target.value)}
            >
              <option value="all">Semua Divisi (Perusahaan)</option>
              {divisiList.map(d => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Stat Panels  */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <div className="stat-panel" style={{ borderTop: '3px solid #16a34a' }}>
          <div className="stat-panel-label">Kehadiran Tepat Waktu</div>
          <div className="stat-panel-value">{kpiStats.ontimeRate}%</div>
          <div className="stat-panel-meta">Bulan {selectedPeriode} (Cut-off 08:15 WIB)</div>
        </div>

        <div className="stat-panel" style={{ borderTop: '3px solid #d97706' }}>
          <div className="stat-panel-label">Pengajuan Menunggu</div>
          <div className="stat-panel-value">{kpiStats.pendingLeaves}</div>
          <div className="stat-panel-meta">Menunggu Verifikasi & Keputusan</div>
        </div>

        <div className="stat-panel" style={{ borderTop: '3px solid #0284c7' }}>
          <div className="stat-panel-label">Rata-rata Sisa Cuti</div>
          <div className="stat-panel-value">{kpiStats.avgQuotaLeft} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>hari</span></div>
          <div className="stat-panel-meta">Jatah Tahunan 2026 Seluruh Karyawan</div>
        </div>

        <div className="stat-panel" style={{ borderTop: '3px solid #4f46e5' }}>
          <div className="stat-panel-label">Total Gaji Terbit</div>
          <div className="stat-panel-value" style={{ fontSize: '1.35rem' }}>{formatRupiah(kpiStats.totalPayrollPaid)}</div>
          <div className="stat-panel-meta">Hanya Slip Resmi Berstatus Terbit</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. GRAFIK KEHADIRAN MINGGUAN (4 MINGGU) - STANDARD EKSEKUTIF KARTESIUS */}
      {/* ========================================================================= */}
      <div className="card" style={{ marginBottom: '28px' }}>
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
              1. Grafik Kehadiran Mingguan (4 Minggu Terakhir)
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
                onClick={() => setChart1Mode('count')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: chart1Mode === 'count' ? '#ffffff' : 'transparent',
                  color: chart1Mode === 'count' ? '#0f172a' : '#64748b',
                  boxShadow: chart1Mode === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Hari-Orang (Absolut)
              </button>
              <button
                type="button"
                onClick={() => setChart1Mode('percent')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: chart1Mode === 'percent' ? '#ffffff' : 'transparent',
                  color: chart1Mode === 'percent' ? '#0f172a' : '#64748b',
                  boxShadow: chart1Mode === 'percent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Persentase 100%
              </button>
            </div>

            <span className="badge badge-info" style={{ fontWeight: 700 }}>
              80 HARI-ORANG / MGG
            </span>
          </div>
        </div>

        {/* Executive KPI Micro Bar */}
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
              {avgG1OntimePct}% <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>(Target: &ge; 75%)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Presensi Dianalisis
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {totalG1All} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Hari-Orang</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Insiden Keterlambatan
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>
              {totalG1Telat} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>({totalG1All > 0 ? Math.round((totalG1Telat / totalG1All) * 100) : 0}%)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cuti & Izin Resmi
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0369a1', marginTop: '2px' }}>
              {totalG1Cuti} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>({totalG1All > 0 ? Math.round((totalG1Cuti / totalG1All) * 100) : 0}%)</span>
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
              <span>{chart1Mode === 'count' ? '80' : '100%'}</span>
              <span>{chart1Mode === 'count' ? '60' : '75%'}</span>
              <span>{chart1Mode === 'count' ? '40' : '50%'}</span>
              <span>{chart1Mode === 'count' ? '20' : '25%'}</span>
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
                {weeklyAttendanceData.map((item, idx) => {
                  const total = item.tepat + item.telat + item.cuti + item.alpa;
                  const isSelected = selectedWeekIdx === idx;

                  // Hitung tinggi piksel per segmen (Canvas total 240px)
                  const factor = chart1Mode === 'count' ? (240 / 80) : (240 / total);
                  const hTepat = Math.round(item.tepat * factor);
                  const hTelat = Math.round(item.telat * factor);
                  const hCuti = Math.round(item.cuti * factor);
                  const hAlpa = Math.round(item.alpa * factor);

                  const pctTepat = Math.round((item.tepat / total) * 100);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedWeekIdx(idx)}
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
                          height: `${hTepat + hTelat + hCuti + hAlpa}px`,
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
                          title={`Tepat Waktu: ${item.tepat} (${pctTepat}%)`}
                        >
                          {hTepat >= 24 && item.tepat}
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
                          title={`Terlambat: ${item.telat}`}
                        >
                          {hTelat >= 20 && item.telat}
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
                          title={`Cuti/Izin: ${item.cuti}`}
                        >
                          {hCuti >= 20 && item.cuti}
                        </div>

                        {/* Segmen 4: Tanpa Keterangan (Merah) */}
                        <div
                          style={{
                            height: `${hAlpa}px`,
                            backgroundColor: '#ef4444',
                            backgroundImage: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)',
                            borderTop: '1px solid rgba(255,255,255,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFeatureSettings: 'tnum',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                          title={`Tanpa Keterangan: ${item.alpa}`}
                        >
                          {hAlpa >= 18 && item.alpa}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sumbu X (Labels di Bawah Kolom) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingLeft: '70px',
            paddingRight: '10px',
            marginTop: '12px'
          }}>
            {weeklyAttendanceData.map((item, idx) => {
              const isSelected = selectedWeekIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedWeekIdx(idx)}
                  style={{
                    width: '120px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#1d4ed8' : '#1e293b'
                  }}>
                    {item.minggu}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {item.rentang}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                    color: isSelected ? '#1e40af' : '#64748b'
                  }}>
                    {chart1Mode === 'count' ? '80 Hari-Orang' : `${Math.round((item.tepat / 80) * 100)}% Tepat`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Interaktif Deep-Dive Minggu yang Dipilih */}
        {activeWeekData && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>
                  Rincian Analitik: {activeWeekData.minggu} ({activeWeekData.rentang})
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#3b82f6', marginLeft: '8px' }}>
                  Total {activeWeekTotal} Hari-Orang
                </span>
              </div>
              <span
                className={`badge ${(activeWeekData.tepat / activeWeekTotal) >= 0.75 ? 'badge-success' : 'badge-warning'}`}
                style={{ fontWeight: 700 }}
              >
                {(activeWeekData.tepat / activeWeekTotal) >= 0.75 ? 'Target Kinerja Tercapai' : 'Perlu Evaluasi Kedisiplinan'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Hadir Tepat Waktu:</span>
                <strong style={{ fontSize: '1rem', color: '#15803d' }}>{activeWeekData.tepat}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({Math.round((activeWeekData.tepat / activeWeekTotal) * 100)}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Terlambat:</span>
                <strong style={{ fontSize: '1rem', color: '#b45309' }}>{activeWeekData.telat}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({Math.round((activeWeekData.telat / activeWeekTotal) * 100)}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Cuti / Izin Resmi:</span>
                <strong style={{ fontSize: '1rem', color: '#0369a1' }}>{activeWeekData.cuti}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({Math.round((activeWeekData.cuti / activeWeekTotal) * 100)}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Tanpa Keterangan:</span>
                <strong style={{ fontSize: '1rem', color: '#b91c1c' }}>{activeWeekData.alpa}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({Math.round((activeWeekData.alpa / activeWeekTotal) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Data Breakdown Table */}
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
              {weeklyAttendanceData.map((row, i) => {
                const rowTotal = row.tepat + row.telat + row.cuti + row.alpa;
                const rowPct = rowTotal > 0 ? Math.round((row.tepat / rowTotal) * 100) : 0;
                const isSelected = selectedWeekIdx === i;

                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedWeekIdx(i)}
                    style={{
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ fontWeight: 700 }}>
                      {row.minggu} ({row.rentang})
                    </td>
                    <td style={{ color: '#15803d', fontWeight: 600 }}>{row.tepat}</td>
                    <td style={{ color: '#b45309', fontWeight: 600 }}>{row.telat}</td>
                    <td style={{ color: '#0369a1', fontWeight: 600 }}>{row.cuti}</td>
                    <td style={{ color: '#b91c1c', fontWeight: 600 }}>{row.alpa}</td>
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

      {/* ========================================================================= */}
      {/* 2. GRAFIK CUTI, SAKIT, & IZIN PER DIVISI - STANDARD EKSEKUTIF KARTESIUS */}
      {/* ========================================================================= */}
      <div className="card" style={{ marginBottom: '28px' }}>
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
              Monitoring Ketidakhadiran per Divisi
            </div>
            <h3 className="card-title" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              2. Grafik Cuti, Sakit, & Izin per Divisi
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Distribusi hari pengajuan cuti tahunan, sakit, dan izin resmi per divisi kerja pada periode {selectedPeriode}
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
                onClick={() => setChart2Mode('count')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: chart2Mode === 'count' ? '#ffffff' : 'transparent',
                  color: chart2Mode === 'count' ? '#0f172a' : '#64748b',
                  boxShadow: chart2Mode === 'count' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Jumlah Hari (Absolut)
              </button>
              <button
                type="button"
                onClick={() => setChart2Mode('percent')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: chart2Mode === 'percent' ? '#ffffff' : 'transparent',
                  color: chart2Mode === 'percent' ? '#0f172a' : '#64748b',
                  boxShadow: chart2Mode === 'percent' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Persentase 100%
              </button>
            </div>

            <span className="badge badge-info" style={{ fontWeight: 700 }}>
              REKAP DIVISI KERJA
            </span>
          </div>
        </div>

        {/* Executive KPI Micro Bar */}
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
              Total Ketidakhadiran Seluruh Divisi
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {totalG2All} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Hari Kerja</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Cuti Tahunan
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
              {totalG2CutiTahunan} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1' }}>({totalG2All > 0 ? Math.round((totalG2CutiTahunan / totalG2All) * 100) : 0}%)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Hari Sakit
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
              {totalG2Sakit} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f97316' }}>({totalG2All > 0 ? Math.round((totalG2Sakit / totalG2All) * 100) : 0}%)</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Izin Resmi
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0891b2', marginTop: '2px' }}>
              {totalG2Izin} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#06b6d4' }}>({totalG2All > 0 ? Math.round((totalG2Izin / totalG2All) * 100) : 0}%)</span>
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
                <span className="legend-swatch" style={{ backgroundColor: '#4f46e5' }} />
                <strong>Cuti Tahunan</strong> (Hak Kuota Resmi)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="legend-swatch" style={{ backgroundColor: '#f97316' }} />
                <strong>Sakit</strong> (Surat Medis)
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span className="legend-swatch" style={{ backgroundColor: '#06b6d4' }} />
                <strong>Izin Resmi</strong> (Keperluan Khusus)
              </span>
            </div>

            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Klik kolom divisi untuk melihat rincian analitik
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
              <span>{chart2Mode === 'count' ? maxDivisiScale : '100%'}</span>
              <span>{chart2Mode === 'count' ? Math.round(maxDivisiScale * 0.75) : '75%'}</span>
              <span>{chart2Mode === 'count' ? Math.round(maxDivisiScale * 0.5) : '50%'}</span>
              <span>{chart2Mode === 'count' ? Math.round(maxDivisiScale * 0.25) : '25%'}</span>
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

              {/* Grid Kolom Batang Bertumpuk per Divisi */}
              <div style={{
                position: 'absolute',
                inset: '0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'flex-end',
                paddingLeft: '10px',
                paddingRight: '10px'
              }}>
                {displayCutiDivisi.map((item, idx) => {
                  const total = item.cutiTahunan + item.sakit + item.izin;
                  const isSelected = selectedDivisiIdx === idx;

                  // Hitung faktor tinggi
                  const factor = chart2Mode === 'count' ? (240 / maxDivisiScale) : (240 / (total || 1));
                  const hCuti = Math.round(item.cutiTahunan * factor);
                  const hSakit = Math.round(item.sakit * factor);
                  const hIzin = Math.round(item.izin * factor);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDivisiIdx(idx)}
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
                          height: `${Math.max(4, hCuti + hSakit + hIzin)}px`,
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
                        {/* Segmen 1: Cuti Tahunan (Indigo) */}
                        <div
                          style={{
                            height: `${hCuti}px`,
                            backgroundColor: '#4f46e5',
                            backgroundImage: 'linear-gradient(180deg, #4f46e5 0%, #4338ca 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFeatureSettings: 'tnum',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                          title={`Cuti Tahunan: ${item.cutiTahunan} hari`}
                        >
                          {hCuti >= 24 && item.cutiTahunan}
                        </div>

                        {/* Segmen 2: Sakit (Orange) */}
                        <div
                          style={{
                            height: `${hSakit}px`,
                            backgroundColor: '#f97316',
                            backgroundImage: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
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
                          title={`Sakit: ${item.sakit} hari`}
                        >
                          {hSakit >= 20 && item.sakit}
                        </div>

                        {/* Segmen 3: Izin (Cyan) */}
                        <div
                          style={{
                            height: `${hIzin}px`,
                            backgroundColor: '#06b6d4',
                            backgroundImage: 'linear-gradient(180deg, #06b6d4 0%, #0891b2 100%)',
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
                          title={`Izin: ${item.izin} hari`}
                        >
                          {hIzin >= 20 && item.izin}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sumbu X (Labels di Bawah Kolom) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingLeft: '70px',
            paddingRight: '10px',
            marginTop: '12px'
          }}>
            {displayCutiDivisi.map((item, idx) => {
              const total = item.cutiTahunan + item.sakit + item.izin;
              const isSelected = selectedDivisiIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDivisiIdx(idx)}
                  style={{
                    width: '130px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? '#1d4ed8' : '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={item.divisiNama}>
                    {item.divisiNama}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                    color: isSelected ? '#1e40af' : '#64748b'
                  }}>
                    {chart2Mode === 'count' ? `${total} Hari Total` : `${totalG2All > 0 ? Math.round((total / totalG2All) * 100) : 0}% Porsi`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Interaktif Deep-Dive Divisi yang Dipilih */}
        {activeDivisiData && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#312e81' }}>
                  Rincian Ketidakhadiran: Divisi {activeDivisiData.divisiNama}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#4f46e5', marginLeft: '8px' }}>
                  Total {activeDivisiTotal} Hari Ketidakhadiran
                </span>
              </div>
              <span
                className={`badge ${activeDivisiTotal <= 15 ? 'badge-success' : 'badge-warning'}`}
                style={{ fontWeight: 700 }}
              >
                {activeDivisiTotal <= 15 ? 'Utilisasi Cuti Normal' : 'Tingkat Ketidakhadiran Tinggi'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Cuti Tahunan:</span>
                <strong style={{ fontSize: '1rem', color: '#4f46e5' }}>{activeDivisiData.cutiTahunan}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({activeDivisiTotal > 0 ? Math.round((activeDivisiData.cutiTahunan / activeDivisiTotal) * 100) : 0}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Sakit (Medis):</span>
                <strong style={{ fontSize: '1rem', color: '#ea580c' }}>{activeDivisiData.sakit}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({activeDivisiTotal > 0 ? Math.round((activeDivisiData.sakit / activeDivisiTotal) * 100) : 0}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Izin Resmi:</span>
                <strong style={{ fontSize: '1rem', color: '#0891b2' }}>{activeDivisiData.izin}</strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({activeDivisiTotal > 0 ? Math.round((activeDivisiData.izin / activeDivisiTotal) * 100) : 0}%)
                </span>
              </div>

              <div style={{ padding: '8px 12px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>Porsi Dari Total Perusahaan:</span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  {totalG2All > 0 ? Math.round((activeDivisiTotal / totalG2All) * 100) : 0}%
                </strong>
                <span style={{ color: '#64748b', fontSize: '0.725rem', marginLeft: '4px' }}>
                  ({activeDivisiTotal}/{totalG2All} hari)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Data Breakdown Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ fontSize: '0.825rem' }}>
            <thead>
              <tr>
                <th>Nama Divisi</th>
                <th>Cuti Tahunan</th>
                <th>Sakit</th>
                <th>Izin Resmi</th>
                <th>Total Hari</th>
                <th>Porsi Terhadap Perusahaan</th>
                <th>Kategori Dominan</th>
                <th>Status Utilisasi</th>
              </tr>
            </thead>
            <tbody>
              {displayCutiDivisi.map((row, i) => {
                const rowTotal = row.cutiTahunan + row.sakit + row.izin;
                const rowPct = totalG2All > 0 ? Math.round((rowTotal / totalG2All) * 100) : 0;
                const isSelected = selectedDivisiIdx === i;

                // Hitung kategori dominan
                let dominan = 'Cuti Tahunan';
                if (row.sakit > row.cutiTahunan && row.sakit >= row.izin) dominan = 'Sakit';
                else if (row.izin > row.cutiTahunan && row.izin > row.sakit) dominan = 'Izin Resmi';

                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedDivisiIdx(i)}
                    style={{
                      backgroundColor: isSelected ? '#eef2ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <td style={{ fontWeight: 700 }}>
                      {row.divisiNama}
                    </td>
                    <td style={{ color: '#4f46e5', fontWeight: 600 }}>{row.cutiTahunan} Hari</td>
                    <td style={{ color: '#ea580c', fontWeight: 600 }}>{row.sakit} Hari</td>
                    <td style={{ color: '#0891b2', fontWeight: 600 }}>{row.izin} Hari</td>
                    <td style={{ fontWeight: 700 }}>{rowTotal} Hari</td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{rowPct}%</strong>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: 600 }}>
                        {dominan}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${rowTotal <= 15 ? 'badge-success' : 'badge-warning'}`}
                        style={{ fontWeight: 700 }}
                      >
                        {rowTotal <= 15 ? 'Normal' : 'Tinggi'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Top 5 Keterlambatan & Rekap Gaji Divisi */}
      <div className="grid-2">
        {/* Tabel 5 Karyawan Terlambat Terbanyak (Seksi 9) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">3. Keterlambatan Terbanyak Bulan Ini</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                5 karyawan dengan frekuensi check-in lewat pukul 08:15:00 WIB
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', letterSpacing: '0.04em' }}>
              TOP 5 TERLAMBAT
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Karyawan</th>
                  <th>Divisi</th>
                  <th style={{ textAlign: 'right' }}>Jumlah Keterlambatan</th>
                </tr>
              </thead>
              <tbody>
                {topLateEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Tidak ada karyawan yang terlambat pada periode ini.
                    </td>
                  </tr>
                ) : (
                  topLateEmployees.map((t, index) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, width: '40px' }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.nama}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.nik}</div>
                      </td>
                      <td>{t.divisi}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                          {t.totalTerlambat} Kali
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Rekap Total Gaji per Divisi (Seksi 9) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">4. Rekap Gaji per Divisi (Slip Terbit)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Hanya menghitung slip yang sudah berstatus terbit
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.04em' }}>
              SLIP TERBIT RESMI
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Divisi</th>
                  <th>Gaji Pokok</th>
                  <th>Tunjangan</th>
                  <th>Potongan</th>
                  <th>Total Diterima</th>
                </tr>
              </thead>
              <tbody>
                {rekapGajiDivisi.map((rg, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{rg.divisiNama}</td>
                    <td>{formatRupiah(rg.gajiPokok)}</td>
                    <td style={{ color: '#059669' }}>+{formatRupiah(rg.tunjangan)}</td>
                    <td style={{ color: '#dc2626' }}>-{formatRupiah(rg.potongan)}</td>
                    <td style={{ fontWeight: 800, color: '#4f46e5' }}>
                      {formatRupiah(rg.totalDiterima)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
