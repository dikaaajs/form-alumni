# Form Alumni & Rekan — Next.js + shadcn/ui

Form responsif untuk data alumni dan tiga rekan/kolega, dengan validasi usia minimal 18 tahun dan integrasi Google Sheets API.

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Komponen UI bergaya shadcn/ui (Button, Input, Label, Card, Select)
- Radix UI + Lucide icons
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
- Buat tab `Responses`.
- Masukkan 29 header pada baris pertama, dari kolom A sampai AC.
- Isi `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_SHEET_NAME`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, dan `GOOGLE_PRIVATE_KEY` di `.env.local`.
- Jangan pernah commit file `.env.local` atau private key ke repository.

## Validasi usia
Tanggal lahir divalidasi pada browser untuk umpan balik langsung dan divalidasi kembali pada API server sebelum data disimpan. Ketiga rekan harus berusia minimal 18 tahun.

## Kolom spreadsheet
A: Submitted At, B: Alumni Name, C: Program, D: Program Year, E: Alumni WhatsApp, F: Alumni Email, G: Alumni City, H: Alumni Social Media. Setelah itu, setiap rekan menggunakan 7 kolom (nama, tanggal lahir, pekerjaan, email, WhatsApp, kota, sosial media) sampai kolom AC.

## Build
`npm run build`

Catatan: koneksi Google Sheets belum aktif sampai `.env.local` diisi dengan kredensial dan spreadsheet yang benar.

## Jika tampilan tidak memiliki CSS
Pastikan `postcss.config.mjs` tersedia di root proyek dan berisi plugin `@tailwindcss/postcss`. Pada Tailwind CSS v4, `app/globals.css` menggunakan `@import "tailwindcss";`.
Setelah mengganti konfigurasi, hentikan server (`Ctrl+C`), jalankan `npm install`, lalu `npm run dev`. Jika cache lama masih mengganggu, hapus folder `.next` kemudian jalankan kembali.
