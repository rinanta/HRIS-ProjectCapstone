export type Peran = 'karyawan' | 'atasan' | 'hrd';

export type StatusKerja = 'tetap' | 'kontrak';

export type JenisLibur = 'nasional' | 'cuti_bersama' | 'perusahaan';

export type JenisPengajuan = 'cuti_tahunan' | 'sakit' | 'izin';

export type StatusPengajuan = 'diajukan' | 'disetujui_atasan' | 'disetujui' | 'ditolak' | 'dibatalkan';

export type StatusAbsensi = 'hadir' | 'terlambat';

export type StatusSlip = 'draf' | 'terbit';

export interface Profile {
  id: string;
  nik_karyawan: string;
  nama_lengkap: string;
  email: string;
  nomor_hp: string | null;
  peran: Peran;
  divisi_id: string | null;
  jabatan: string;
  status_kerja: StatusKerja;
  tanggal_masuk: string;
  aktif: boolean;
  dibuat_pada: string;
  // Join
  divisi?: {
    id: string;
    nama: string;
  };
}

export interface Divisi {
  id: string;
  nama: string;
  manajer_id: string | null;
  dibuat_pada: string;
  manajer?: {
    id: string;
    nama_lengkap: string;
  };
}

export interface HariLibur {
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
  jenis: JenisLibur;
}

export interface KuotaCuti {
  id: string;
  karyawan_id: string;
  tahun: number;
  jatah_hari: number;
  terpakai_hari: number;
}

export interface PengajuanCuti {
  id: string;
  karyawan_id: string;
  jenis: JenisPengajuan;
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_hari: number;
  alasan: string;
  lampiran_path: string | null;
  status: StatusPengajuan;
  perlu_atasan: boolean;
  disetujui_atasan_oleh: string | null;
  disetujui_atasan_pada: string | null;
  diputuskan_hrd_oleh: string | null;
  diputuskan_hrd_pada: string | null;
  alasan_penolakan: string | null;
  dibatalkan_oleh: string | null;
  dibatalkan_pada: string | null;
  dibuat_pada: string;
  karyawan?: Profile;
  disetujui_atasan?: Profile;
  diputuskan_hrd?: Profile;
}

export interface Absensi {
  id: string;
  karyawan_id: string;
  tanggal: string; // YYYY-MM-DD
  jam_masuk: string; // ISO
  jam_pulang: string | null; // ISO
  status: StatusAbsensi;
  dikoreksi_oleh: string | null;
  alasan_koreksi: string | null;
  karyawan?: Profile;
  dikoreksi?: Profile;
}

export interface SlipGaji {
  id: string;
  nomor_slip: string | null;
  karyawan_id: string;
  periode: string; // YYYY-MM-01
  gaji_pokok: number;
  tunjangan: number;
  potongan: number;
  total_diterima: number;
  catatan: string | null;
  status: StatusSlip;
  dibuat_oleh: string;
  diterbitkan_oleh: string | null;
  diterbitkan_pada: string | null;
  dibuat_pada: string;
  karyawan?: Profile;
  dibuat?: Profile;
  diterbitkan?: Profile;
}

export interface AuditLog {
  id: number;
  pelaku_id: string | null;
  aksi: string;
  nama_tabel: string;
  data_id: string;
  nilai_sebelum: Record<string, unknown> | null;
  nilai_sesudah: Record<string, unknown> | null;
  dibuat_pada: string;
  pelaku?: Profile;
}
