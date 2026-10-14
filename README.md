# Form Alumni & Rekan — Next.js + shadcn/ui

Form responsif untuk mendata alumni pengundang dan tiga calon peserta STC yang diajaknya. Data disimpan ke Google Sheets dalam dua tab terpisah: `inviter` dan `calonSTC`.

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Komponen UI bergaya shadcn/ui
- Google Sheets API via Service Account

## Jalankan lokal
1. Install Node.js versi 20 atau lebih baru.
2. Ekstrak ZIP ini.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env.local`.
5. Isi kredensial Google Sheets sesuai panduan di bawah.
6. Jalankan `npm run dev`, lalu buka http://localhost:3000.

## Konfigurasi Google Sheets
- Aktifkan Google Sheets API pada Google Cloud project.
- Buat Service Account dan JSON private key.
- Bagikan spreadsheet ke `GOOGLE_SERVICE_ACCOUNT_EMAIL` sebagai Editor.
- Isi `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, dan `GOOGLE_PRIVATE_KEY` di `.env.local`.
- API akan membuat tab `inviter` dan `calonSTC` secara otomatis jika belum ada.
- Jika ingin menyiapkan header terlebih dahulu, gunakan `google-sheets-headers.tsv` sebagai acuan. Baris header harus berada di baris pertama masing-masing tab.
- Jangan pernah commit file `.env.local` atau private key ke repository.

## Struktur data
### Tab `inviter`
Satu baris untuk setiap alumni yang mengajak rekan. `id_inviter` dibuat otomatis sebagai UUID unik.

Kolom: `id_inviter`, `submitted_at`, `nama_alumni`, `program`, `tahun_program`, `whatsapp_alumni`, `email_alumni`, `kota_alumni`, `sosial_media_alumni`.

### Tab `calonSTC`
Tiga baris untuk setiap pengiriman form, masing-masing satu calonSTC. `id_calonSTC` adalah UUID unik, sedangkan `inviter_id` berisi `id_inviter` alumni yang mengajaknya. Dengan demikian, satu alumni dapat ditautkan ke tiga calonSTC melalui `inviter_id`.

Kolom: `id_calonSTC`, `inviter_id`, `nama_calonSTC`, `tanggal_lahir`, `pekerjaan`, `nama_perusahaan`, `email`, `whatsapp`, `kota`, `sosial_media`.

## Validasi
- Alumni wajib mengisi data dan akun sosial media.
- Nomor WhatsApp divalidasi berdasarkan format nomor seluler Indonesia; ini bukan verifikasi OTP.
- Ketiga calonSTC harus berusia minimal 18 tahun.

## Build
`npm run build`

Catatan: koneksi Google Sheets belum aktif sampai `.env.local` diisi dengan kredensial dan spreadsheet yang benar. Jika tab `inviter` atau `calonSTC` belum ada, API akan membuatnya otomatis. Tambahkan header pada baris pertama sebelum data pertama masuk, atau gunakan file header sebagai acuan.

## Halaman hasil `/result`
- Buka `http://localhost:3000/result` untuk melihat data dari tab `inviter` dan `calonSTC`.
- Halaman dilindungi kunci akses agar data pribadi tidak dapat dibaca publik. Atur `RESULT_ACCESS_KEY` di `.env.local` dan environment deployment.
- Tabel menyediakan pencarian, ringkasan jumlah data, pergantian tab, dan tombol **Chat** WhatsApp untuk nomor alumni maupun calon STC.
- Pastikan baris pertama kedua tab berisi header yang sesuai dengan `google-sheets-headers.tsv`.
