# Dokumentasi Hasil Pengujian 10 Kasus Uji Aturan Bisnis
**Aplikasi HRIS PT Karsa Lintas Nusantara**  
*Bootcamp AI Web Programming · Capstone Project*  
*Sesuai Kriteria Selesai PRD Seksi 13*

---

| No | Kode Aturan | Kasus Uji / Skenario | Ekspektasi PRD | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| **1** | **BR-01** | Login dengan akun Bambang Hartono (dinonaktifkan sejak 1 Okt 2026) | Login ditolak dengan pesan jelas; akun tidak bisa masuk | Berhasil ditolak dengan pesan: *"Akun Anda dinonaktifkan oleh HRD dan tidak dapat masuk ke sistem (BR-01)."* | **LOLOS (PASS)** |
| **2** | **BR-02, BR-03** | Batas waktu presensi masuk (WIB) | Tepat `08:15:00` WIB hadir, `08:15:01` WIB terlambat | Server WIB mengkategorikan `08:15:00` sebagai *hadir* dan `08:15:01` sebagai *terlambat*. | **LOLOS (PASS)** |
| **3** | **BR-05** | Perhitungan hari kerja melewati akhir pekan dan hari libur perusahaan | Pengajuan 22 s/d 23 Oktober 2026 dihitung 1 hari karena 23 Oktober adalah Libur Perusahaan | Dihitung tepat **1 hari kerja**. Tanggal 23 Oktober dilewati secara otomatis. | **LOLOS (PASS)** |
| **4** | **BR-04** | Hak cuti tahunan setelah masa kerja genap 12 bulan (Rizky Ramadhan & Nadia Safitri) | Karyawan belum 12 bulan tidak berhak cuti tahunan. Rizky (masuk 2 Nov 2025) baru berhak mulai 2 Nov 2026 | Ditolak pada 15 Oktober 2026, dan baru diizinkan mulai tanggal 2 November 2026. Nadia (masuk Maret 2026) jatah 0. | **LOLOS (PASS)** |
| **5** | **BR-06** | Siti Nurhaliza dengan sisa kuota 1 hari | Pengajuan 2 hari harus ditolak, pengajuan 1 hari harus diterima, kuota tidak boleh minus | Pengajuan 2 hari ditolak dengan pesan kuota tidak mencukupi; pengajuan 1 hari berhasil mengurangi kuota menjadi 0 tanpa pernah minus. | **LOLOS (PASS)** |
| **6** | **BR-09** | Pengajuan oleh Atasan / HRD (Bayu Setiawan) | Tahap pertama dilewati dan langsung diputuskan oleh HRD | Disimpan dengan `perlu_atasan = false`, langsung masuk ke antrean keputusan akhir HRD tanpa tahap Atasan. | **LOLOS (PASS)** |
| **7** | **BR-11** | Kerahasiaan gaji (Atasan tidak bisa melihat gaji anggota divisi) | Login sebagai Atasan (Maya Anggraini) lalu mengakses slip gaji bawahan | Row Level Security (RLS) PostgreSQL hanya mengembalikan slip milik Maya sendiri. Slip anggota divisi tidak pernah bocor ke Atasan. | **LOLOS (PASS)** |
| **8** | **BR-12** | Slip draf tersembunyi & format nomor slip resmi saat terbit | Karyawan tidak melihat slip draf; slip terbit berformat `SG-TTTTBB-NNN` berurutan dan terkunci | Karyawan hanya melihat slip berstatus `terbit`. Slip terbit tidak dapat diubah atau dihapus oleh siapa pun. | **LOLOS (PASS)** |
| **9** | **BR-09** | Larangan memutuskan pengajuan sendiri (Dimas Pratama - HRD) | Tidak ada akun yang boleh memutuskan pengajuannya sendiri | Pengajuan cuti Dimas wajib diputuskan oleh HRD lain (Rina Kusumawardani). Tombol persetujuan dicegah oleh sistem. | **LOLOS (PASS)** |
| **10** | **BR-12** | Integritas Audit Log (Tamper-Proof) | Setiap keputusan, koreksi absensi, dan slip tercatat; log tidak bisa diubah atau dihapus | 23 log awal tercatat lengkap. Percobaan DELETE/UPDATE langsung ditolak database (*permission denied for table audit_log*). | **LOLOS (PASS)** |

---

### Ringkasan Eksekusi:
* **Total Kasus Uji:** 10
* **Lolos:** 10 (100%)
* **Gagal:** 0 (0%)
* **Server Status:** Next.js Berjalan Normal di `http://localhost:3000`
