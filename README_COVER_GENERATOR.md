# CoverPrompt — School Book Cover Prompt Generator

Aplikasi internal ringan untuk menyusun **satu JSON prompt** cover buku sekolah full-wrap A4 dengan layout baku, bleed, safe margin, lebar punggung otomatis, kontrol visual, dan negative prompt anti-AI-slop.

## Versi aktif

`LITNUS-SCHOOL-WRAP-A4-V1.3`

## Prinsip

- Tidak ada database.
- Isi formulir tidak disimpan oleh aplikasi.
- Logo **tidak diunggah melalui formulir**. Pengguna mengunggah logo langsung di percakapan ChatGPT/Gemini setelah JSON dibuat.
- Endpoint `/api/generate` hanya menyusun JSON berdasarkan input dan mengembalikannya dengan `Cache-Control: no-store`.
- Lebar punggung = `jumlah halaman × 0,0472 mm`.
- Bleed 5 mm atas/bawah, sisi luar kiri cover belakang, dan sisi luar kanan cover depan.
- Semua teks/logo/elemen penting minimal 15 mm dari garis trim.
- Buku pada template ini tanpa ISBN; prompt melarang ISBN, barcode, QR, area putih placeholder, atau panel stiker.
- Cover belakang berisi isi sinopsis **tanpa heading “Sinopsis”**.
- Print spec dan layout lock hanya metadata non-printing. Prompt melarang AI menampilkan angka ukuran, koordinat, ruler, garis trim/bleed/safe-area, kotak zona, dan label FRONT/BACK/SPINE pada artwork final.

## Fitur visual V1.3

- Primary color dan secondary/accent color.
- Style preset terbatas untuk menjaga genre visual tetap konsisten.
- Text effect judul: Clean Flat, Soft Emboss, 3D Gold, 3D Glass, Bold Outline.
- Nuansa tema: Netral, Cinta Indonesia, Islami & Prestasi, Akademik Elegan, Hangat Asrama, Sejarah Kejayaan.
- Instruksi custom opsional.
- Badge kelas geometris/premium di kanan bawah.
- Teks bawah kelas default: `Untuk Kalangan Sendiri, YAYASAN BMCI`.
- Tombol ChatGPT/Gemini menyalin JSON sebelum membuka AI.

## Struktur modular

- `index.html` — struktur UI dan petunjuk.
- `styles.css` — design system hijau neon dan responsive UI.
- `app.js` — interaksi form, preview teknis, sinkronisasi state output, copy/download JSON, serta tombol ChatGPT/Gemini.
- `api/generate.js` — endpoint stateless untuk validasi dan output JSON.
- `lib/print-spec.js` — satu sumber aturan ukuran cetak dan rumus punggung.
- `lib/visual-presets.js` — preset style, text effect, dan nuansa tema.
- `lib/prompt-engine.js` — template prompt, layout lock, aturan ilustrasi, no-ISBN policy, sinopsis belakang tanpa heading, dan negative prompt anti-AI-slop.
- `vercel.json` — konfigurasi fungsi dan header no-store.

## Layout seri

- Logo: kanan atas, hanya jika pengguna melampirkan logo di chat AI.
- Judul: tengah/tengah-atas dan dominan.
- Subjudul: tepat di bawah judul jika diisi.
- Hero: 1–2 siswa sekolah Islam sesuai usia kelas, siswi wajib berhijab.
- Penulis: kiri bawah.
- Badge kelas/jenjang: kanan bawah dengan bentuk geometris premium.
- Teks internal: kecil di bawah/sekitar badge kelas.
- Cover belakang: isi sinopsis berbasis daftar isi, tanpa heading “Sinopsis”, tanpa ISBN/barcode/placeholder.
- Punggung: polos/sederhana tanpa teks dan logo.

## Alur pengguna

1. Isi informasi buku dan daftar isi.
2. Pilih warna, style, text effect judul, nuansa, dan instruksi custom jika perlu.
3. Generate JSON.
4. Klik **ChatGPT — Direkomendasikan** atau Gemini; aplikasi menyalin JSON dan membuka AI di tab baru.
5. Unggah logo langsung pada chat AI yang sama.
6. Tempel JSON lalu generate cover.
7. Cek artwork: tidak boleh ada overlay teknis, angka ukuran, koordinat, ISBN/barcode, placeholder, atau heading “Sinopsis” di cover belakang.

## Revisi paling umum

- Ubah posisi elemen: edit `buildLayoutLock()` dan bagian `LAYOUT LOCK` di `lib/prompt-engine.js`.
- Ubah rumus/bleed/safe margin: edit `lib/print-spec.js`.
- Tambah style/text effect/nuansa: edit `lib/visual-presets.js`.
- Ubah aturan AI/negative prompt: edit `lib/prompt-engine.js`.
- Ubah tampilan UI: edit `styles.css` dan `index.html`.
