# CoverPrompt — School Book Cover Prompt Generator

Aplikasi internal ringan untuk menyusun **satu JSON prompt** cover buku sekolah full-wrap A4 dengan layout baku, bleed, safe margin, dan lebar punggung otomatis.

## Versi aktif

`LITNUS-SCHOOL-WRAP-A4-V1.1`

## Prinsip

- Tidak ada database.
- Isi formulir tidak disimpan oleh aplikasi.
- Logo **tidak diunggah melalui formulir**. Pengguna mengunggah logo langsung di percakapan ChatGPT/Gemini setelah JSON dibuat.
- Endpoint `/api/generate` hanya menyusun JSON berdasarkan input dan mengembalikannya dengan `Cache-Control: no-store`.
- Lebar punggung = `jumlah halaman × 0,0472 mm`.
- Bleed 5 mm atas/bawah, sisi luar kiri cover belakang, dan sisi luar kanan cover depan.
- Semua teks/logo/elemen penting minimal 15 mm dari garis trim.
- Buku pada template ini tanpa ISBN; prompt melarang ISBN, barcode, QR, area putih placeholder, atau panel stiker.
- Print spec dan layout lock hanya metadata non-printing. Prompt melarang AI menampilkan angka ukuran, koordinat, ruler, garis trim/bleed/safe-area, kotak zona, dan label FRONT/BACK/SPINE pada artwork final.

## Struktur modular

- `index.html` — struktur UI dan petunjuk.
- `styles.css` — design system hijau neon dan responsive UI.
- `app.js` — interaksi form, preview teknis, copy/download JSON, serta tombol ChatGPT/Gemini.
- `api/generate.js` — endpoint stateless untuk validasi dan output JSON.
- `lib/print-spec.js` — satu sumber aturan ukuran cetak dan rumus punggung.
- `lib/prompt-engine.js` — template prompt, layout lock, aturan ilustrasi, no-ISBN policy, dan negative prompt anti-AI-slop.
- `vercel.json` — konfigurasi fungsi dan header no-store.

## Layout seri

- Logo: kanan atas (hanya jika pengguna melampirkan logo di chat AI).
- Judul: tengah/tengah-atas dan dominan.
- Subjudul: tepat di bawah judul jika diisi.
- Hero: 1–2 siswa sekolah Islam sesuai usia kelas, siswi wajib berhijab.
- Penulis: kiri bawah.
- Kelas/jenjang: kanan bawah.
- Cover belakang: sinopsis berbasis daftar isi, tanpa ISBN/barcode/placeholder.
- Punggung: polos/sederhana tanpa teks dan logo.

## Alur pengguna

1. Isi informasi buku dan daftar isi.
2. Generate JSON.
3. Klik **ChatGPT — Direkomendasikan** atau Gemini; aplikasi menyalin JSON dan membuka AI di tab baru.
4. Unggah logo langsung pada chat AI yang sama.
5. Tempel JSON lalu generate cover.
6. Cek artwork: tidak boleh ada overlay teknis, angka ukuran, koordinat, ISBN/barcode, atau placeholder sebelum finishing/cetak.
