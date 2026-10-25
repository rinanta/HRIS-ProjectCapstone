import { HariLibur } from './types';

/**
 * Mengembalikan objek Date dalam zona waktu Asia/Jakarta (WIB)
 */
export function getWIBDate(dateInput?: string | Date): Date {
  const d = dateInput ? new Date(dateInput) : new Date();
  return d;
}

/**
 * Mendapatkan string tanggal format YYYY-MM-DD dalam zona waktu WIB
 */
export function getWIBDateString(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}

/**
 * Mendapatkan komponen waktu WIB saat ini: { jam, menit, detik, stringFormat }
 */
export function getWIBTimeParts(dateInput?: string | Date) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const timeStr = d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':');

  const [jam, menit, detik] = timeStr.split(':').map(Number);
  return { jam, menit, detik, timeStr };
}

/**
 * Format tanggal Indonesia yang cantik, misal: "Kamis, 15 Oktober 2026"
 */
export function formatTanggalIndo(dateStr: string | Date): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
}

/**
 * Format jam WIB, misal: "08:14:32 WIB"
 */
export function formatJamWIB(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  const timeStr = d.toLocaleTimeString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\./g, ':');
  return `${timeStr} WIB`;
}

/**
 * Format Rupiah: Rp 8.500.000
 */
export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(nominal);
}

/**
 * Menghitung hari kerja antara tanggal_mulai dan tanggal_selesai (inklusif).
 * Melewati hari Sabtu, Minggu, dan hari libur nasional/perusahaan (BR-05).
 */
export function hitungHariKerja(
  tanggalMulai: string,
  tanggalSelesai: string,
  daftarHariLibur: HariLibur[] = []
): { jumlahHariKerja: number; rincianHariKerja: string[]; liburDilewati: string[] } {
  if (!tanggalMulai || !tanggalSelesai) {
    return { jumlahHariKerja: 0, rincianHariKerja: [], liburDilewati: [] };
  }

  const start = new Date(tanggalMulai + 'T00:00:00+07:00');
  const end = new Date(tanggalSelesai + 'T00:00:00+07:00');

  if (start > end) {
    return { jumlahHariKerja: 0, rincianHariKerja: [], liburDilewati: [] };
  }

  // Cek pergantian tahun (BR-05: Satu pengajuan tidak boleh melewati pergantian tahun)
  if (start.getFullYear() !== end.getFullYear()) {
    return { jumlahHariKerja: 0, rincianHariKerja: [], liburDilewati: [] };
  }

  const liburSet = new Set(daftarHariLibur.map(h => h.tanggal));
  const rincianHariKerja: string[] = [];
  const liburDilewati: string[] = [];

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const curr = new Date(start);
  while (curr <= end) {
    const dayOfWeek = curr.getDay(); // 0 = Minggu, 6 = Sabtu
    const currStr = formatter.format(curr);

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      liburDilewati.push(`${currStr} (Akhir Pekan)`);
    } else if (liburSet.has(currStr)) {
      const hl = daftarHariLibur.find(h => h.tanggal === currStr);
      liburDilewati.push(`${currStr} (${hl?.keterangan || 'Hari Libur'})`);
    } else {
      rincianHariKerja.push(currStr);
    }

    curr.setDate(curr.getDate() + 1);
  }

  return {
    jumlahHariKerja: rincianHariKerja.length,
    rincianHariKerja,
    liburDilewati
  };
}

/**
 * Validasi Batas Waktu Pengajuan (BR-05):
 * - Cuti tahunan: paling lambat 3 hari kalender sebelum tanggal mulai (H-3)
 * - Izin: paling lambat H-1
 * - Sakit: mulai hari sakit sampai paling lambat 3 hari kalender setelahnya (H+3)
 */
export function validasiBatasPengajuan(
  jenis: 'cuti_tahunan' | 'sakit' | 'izin',
  tanggalMulai: string,
  tanggalSekarangWIB: string = getWIBDateString()
): { valid: boolean; pesan: string } {
  const tglMulai = new Date(tanggalMulai + 'T00:00:00+07:00');
  const tglKirim = new Date(tanggalSekarangWIB + 'T00:00:00+07:00');

  const diffTime = tglMulai.getTime() - tglKirim.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24)); // positif jika tglMulai di masa depan

  if (jenis === 'cuti_tahunan') {
    // H-3: tglMulai minimal 3 hari di masa depan dari tanggal kirim
    if (diffDays < 3) {
      return {
        valid: false,
        pesan: 'Pengajuan cuti tahunan paling lambat diajukan 3 hari kalender sebelum tanggal mulai (H-3).'
      };
    }
  } else if (jenis === 'izin') {
    // H-1: tglMulai minimal 1 hari di masa depan
    if (diffDays < 1) {
      return {
        valid: false,
        pesan: 'Pengajuan izin paling lambat diajukan 1 hari kalender sebelum tanggal mulai (H-1).'
      };
    }
  } else if (jenis === 'sakit') {
    // Hari mulai sakit sampai paling lambat 3 hari kalender setelahnya
    // Artinya: tglKirim boleh sama dengan tglMulai atau sampai 3 hari setelah tglMulai (diffDays antara -3 sampai 0)
    // Atau jika diajukan sebelum sakit (misal operasi terjadwal), diffDays >= 0 juga diperbolehkan
    if (diffDays < -3) {
      return {
        valid: false,
        pesan: 'Pengajuan sakit paling lambat diajukan 3 hari kalender setelah hari mulai sakit.'
      };
    }
  }

  return { valid: true, pesan: '' };
}

/**
 * Cek apakah masa kerja karyawan sudah genap 12 bulan untuk cuti tahunan (BR-04)
 */
export function cekHakCutiTahunan(
  tanggalMasuk: string,
  tanggalMulaiCuti: string
): { berhak: boolean; tanggalMulaiBerhak: string } {
  const masuk = new Date(tanggalMasuk + 'T00:00:00+07:00');
  const satuTahun = new Date(masuk);
  satuTahun.setFullYear(satuTahun.getFullYear() + 1);

  const tglCuti = new Date(tanggalMulaiCuti + 'T00:00:00+07:00');

  const tglFormat = satuTahun.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return {
    berhak: tglCuti >= satuTahun,
    tanggalMulaiBerhak: tglFormat
  };
}

/**
 * Penentuan status absensi (BR-03):
 * Tepat 08:15:00 masih "hadir", 08:15:01 berstatus "terlambat"
 */
export function tentukanStatusCheckIn(jamMasukISO: string): 'hadir' | 'terlambat' {
  const { jam, menit, detik } = getWIBTimeParts(jamMasukISO);
  // Lewat dari 08:15:00
  if (jam > 8) return 'terlambat';
  if (jam === 8 && (menit > 15 || (menit === 15 && detik > 0))) return 'terlambat';
  return 'hadir';
}
