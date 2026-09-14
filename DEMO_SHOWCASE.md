# Pratinjau Tampilan Antarmuka (UI Demo) - SAN Chapter Tasikmalaya

Dokumen ini menyajikan gambaran visual antarmuka aplikasi website **SAN Chapter Tasikmalaya** dengan fokus utama pada layar **Dashboard Admin**, **Halaman Login**, dan **Manajemen Berita**, dengan gaya desain Neubrutalisme yang rapi, kontras tinggi, dan tanpa elemen emoji generik.

---

## 1. Tampilan Utama: Dashboard Admin (`/admin`)

Tampilan awal dashboard pengurus menampilkan header bernuansa kuning neubrutalisme dengan kartu akun login responsif, badge database `MONGODB` yang padat (1 baris), dan metrik aktivitas riil dari database.

```
+---------------------------------------------------------------------------------------+
| [PORTAL KEPENGURUSAN]  [MONGODB]                                                      |
| Dashboard Panel Pengurus                                                              |
| Pusat kendali warta, direktori pengurus, dan galeri kegiatan SAN Tasikmalaya          |
|                                                                                       |
|   [AKUN LOGIN SAAT INI:]                                                              |
|   muhammadusamahabdurrahman@gmail.com  [ SUPER ADMIN ]                                |
+---------------------------------------------------------------------------------------+

+--------------------+  +--------------------+  +--------------------+  +---------------+
| WARTA BERITA       |  | DIREKTORI ANGGOTA  |  | GALERI SLIDESHOW   |  | AUDIT LOG     |
| 3                  |  | 0                  |  | 20                 |  | Aktif         |
| Database Terkoneksi|  | Siap Ditambahkan   |  | Foto Dokumentasi   |  | Terverifikasi |
+--------------------+  +--------------------+  +--------------------+  +---------------+

AKSES CEPAT MENU PENGELOLAAN:
[ Manajemen Berita → ]  [ Direktori Pengurus → ]  [ Galeri Slideshow → ]  [ Pengaturan → ]
```

### Karakteristik Tampilan:
- **Teks Email Panjang**: Menggunakan kelas responsif `truncate max-w-[190px] sm:max-w-md` beserta atribut `title` agar teks email tidak keluar dari layar ponsel.
- **Badge Akses**: Bertuliskan `SUPER ADMIN` dengan properti `whitespace-nowrap shrink-0` sehingga selalu terkunci rapi dalam 1 baris.
- **Badge Database**: Diringkas seragam menjadi `[ MONGODB ]` menggantikan teks lama yang memakan 3 baris.

---

## 2. Tampilan Halaman Login (`/login` & `/admin/login`)

Pintu masuk tunggal yang ramah pengguna. Tidak ada lagi kotak peringatan penolakan akses atau instruksi ganti akun Google yang membingungkan.

```
+-------------------------------------------------------------------+
|                              [ SAN ]                              |
|                                                                   |
|                    Portal Masuk Sistem                            |
|             SAN Chapter Tasikmalaya - Pengurus & Anggota          |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  | [STATUS] Akses Masuk Terbuka & Ramah                        |  |
|  | Setiap akun Google yang masuk dianggap sah. Hak akses       |  |
|  | dan pengalihan halaman disesuaikan secara otomatis.         |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |   [G] Masuk dengan Akun Google                              |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
|  ALUR PENGALIHAN BERBASIS PERAN (RBAC):                           |
|  • Super Admin / Admin  : Langsung masuk ke /admin (Dashboard)   |
|  • Member Reguler / Tamu: Dialihkan ke / (Beranda Utama)          |
+-------------------------------------------------------------------+
```

### Menu Dropdown Profil di Header (Setelah Login):
Ketika pengguna sudah login, avatar di sudut kanan atas navbar dapat diklik untuk menampilkan menu popover:
- **Header Profil**: Nama pengguna, email, dan label peran (`SUPER ADMIN` atau `MEMBER`).
- **Tautan Dashboard Admin**: Hanya muncul untuk pengguna dengan peran admin/super admin.
- **Tautan Navigasi Cepat**: Beranda Utama, Berita & Kegiatan, dan Jajaran Pengurus.
- **Tombol Logout**: Tombol keluar berwarna merah muda lembut yang aman membersihkan sesi.

---

## 3. Tampilan Manajemen Berita (`/admin/berita`)

Pusat publikasi warta kegiatan, aksi sosial, dan kabar resmi organisasi.

```
+---------------------------------------------------------------------------------------+
| Kelola Berita & Publikasi Warta                               [ + Tambah Berita Baru ]|
| Arsip kegiatan, bakti sosial, dan siaran pers organisasi SAN Tasikmalaya              |
|                                                                                       |
| Kategori: [ Semua (3) ]  [ Kegiatan ]  [ Organisasi ]  [ Sosial ]                     |
+---------------------------------------------------------------------------------------+

DAFTAR ARTIKEL WARTA:
+---------------------------------------------------------------------------------------+
| [FOTO]  [KEGIATAN] 12 Sep 2026                                                        |
|         Bakti Sosial & Edukasi Pembinaan Anak Tasikmalaya                             |
|                                                     [ Lihat ]  [ Edit ]  [ Hapus ]    |
+---------------------------------------------------------------------------------------+
| [FOTO]  [ORGANISASI] 08 Sep 2026                                                      |
|         Musyawarah Kerja Pengurus SAN Chapter Tasikmalaya                             |
|                                                     [ Lihat ]  [ Edit ]  [ Hapus ]    |
+---------------------------------------------------------------------------------------+
| [FOTO]  [SOSIAL] 01 Sep 2026                                                          |
|         Penyaluran Bantuan Sembako Bersama Komunitas Relawan                          |
|                                                     [ Lihat ]  [ Edit ]  [ Hapus ]    |
+---------------------------------------------------------------------------------------+
```

---

## 4. Fitur Tambahan (Di Bawah): Modal Crop & Zoom Foto

Fitur utilitas yang muncul otomatis dalam bentuk modal dialog pop-up ketika admin memilih berkas gambar pada formulir unggah:

```
+-------------------------------------------------------------------------+
| [CROP] Sesuaikan & Edit Foto                                      [ X ] |
+-------------------------------------------------------------------------+
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   |                        AREA KANVAS GAMBAR                       |   |
|   |                      (Bisa digeser / drag)                      |   |
|   |                                                                 |   |
|   |                    Bingkai Crop:                                |   |
|   |                    - Lingkaran 1:1 (Avatar Pengurus Discord)    |   |
|   |                    - Persegi 16:9 (Sampul Berita & Galeri)      |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|   Zoom: [----O-------------------------] [ 130% ]                       |
|   [ Putar 90° ]  [ Reset Posisi ]                                       |
|                                                                         |
+-------------------------------------------------------------------------+
|                                      [ Batal ]  [ Terapkan (Apply) ]    |
+-------------------------------------------------------------------------+
```

- **Avatar Pengurus (`/admin/anggota`)**: Bingkai crop berbentuk lingkaran 1:1 presisi gaya Discord.
- **Sampul Berita & Galeri (`/admin/berita` & `/admin/gallery`)**: Bingkai persegi dengan rasio aspek default 16:9.
- **Hasil Crop**: Diproses melalui HTML5 Canvas menjadi berkas Blob/File beresolusi pas dan langsung diunggah ke Cloudinary.
