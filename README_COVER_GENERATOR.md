# CoverPrompt — School Book Cover Prompt Generator

Aplikasi internal ringan untuk menyusun **satu JSON prompt** cover buku sekolah full-wrap A4 dengan layout baku, bleed, safe margin, lebar punggung otomatis, kontrol visual, genre font, dan negative prompt anti-AI-slop.

## Versi aktif

`LITNUS-SCHOOL-WRAP-A4-V1.4`

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

## Perubahan utama V1.4

### 1. Execution Mode Lock
JSON sekarang dimulai dengan `execution_lock` agar AI memahami bahwa tugas ini **IMAGE GENERATION ONLY**. AI diperintahkan menghasilkan satu raster image full-wrap dan dilarang mengalihkan output menjadi:

- presentation / slide deck / PowerPoint,
- dokumen atau PDF,
- webpage,
- wireframe,
- design brief,
- report,
- text-only response.

Hal ini ditambahkan untuk mencegah Gemini atau AI lain menafsirkan JSON desain sebagai permintaan membuat presentasi.

### 2. Genre Font Judul
Genre font terpisah dari text effect. Genre mengatur karakter keluarga huruf, sedangkan text effect mengatur finishing visual seperti flat, emboss, atau 3D.

Pilihan genre font:

- **Tegas — Sans Serif**: kuat, modern, sangat terbaca; cocok untuk matematika, ekonomi, informatika, IPA.
- **Elegan — Serif**: anggun, berkelas, berwibawa; cocok untuk bahasa, sastra, sejarah, SKI.
- **Klasik Akademik — Slab/Serif**: formal, mapan, akademik; cocok untuk buku ajar dan ilmu sosial.
- **Islami — Arabic-Inspired Latin**: huruf Latin dengan nuansa kaligrafis Arab; cocok untuk PAI, SKI, Bahasa Arab, dan madrasah. Judul bahasa Indonesia tetap ditulis dengan alfabet Latin.
- **Modern Premium — Sans/Modern Serif**: polished, contemporary, profesional; cocok untuk seri buku modern lintas mapel.
- **Ramah — Rounded Sans**: ringan dan approachable; cocok untuk SD/SMP dan modul pengantar.
- **Formal Resmi — Formal Serif/Sans**: disiplin dan institusional; cocok untuk modul resmi sekolah/yayasan.

## Fitur visual

- Primary color dan secondary/accent color.
- Style preset terbatas untuk menjaga genre visual tetap konsisten.
- Genre font judul berdasarkan tujuan visual.
- Text effect judul: Clean Flat, Soft Emboss, 3D Gold, 3D Glass, Bold Outline.
- Nuansa tema: Netral, Cinta Indonesia, Islami & Prestasi, Akademik Elegan, Hangat Asrama, Sejarah Kejayaan.
- Instruksi custom opsional.
- Badge kelas geometris/premium di kanan bawah.
- Teks bawah kelas default: `Untuk Kalangan Sendiri, YAYASAN BMCI`.
- Tombol ChatGPT/Gemini menyalin JSON sebelum membuka AI.

## Struktur modular

- `index.html` — struktur UI dan petunjuk.
- `styles.css` — design system hijau neon dan responsive UI.
- `app.js` — interaksi form, preview teknis, sinkronisasi state output, copy/download JSON, bantuan genre font, serta tombol ChatGPT/Gemini.
- `api/generate.js` — endpoint stateless untuk validasi dan output JSON.
- `lib/print-spec.js` — satu sumber aturan ukuran cetak dan rumus punggung.
- `lib/visual-presets.js` — preset style, genre font, text effect, dan nuansa tema.
- `lib/prompt-engine.js` — execution lock, template prompt, layout lock, aturan ilustrasi, no-ISBN policy, sinopsis belakang tanpa heading, dan negative prompt anti-AI-slop.
- `vercel.json` — konfigurasi fungsi dan header no-store.

## Layout seri

- Logo: kanan atas, hanya jika pengguna melampirkan logo di chat AI.
- Judul: tengah/tengah-atas dan dominan.
- Genre font hanya mengatur karakter judul; posisi judul tidak berubah.
- Subjudul: tepat di bawah judul jika diisi.
- Hero: 1–2 siswa sekolah Islam sesuai usia kelas, siswi wajib berhijab.
- Penulis: kiri bawah.
- Badge kelas/jenjang: kanan bawah dengan bentuk geometris premium.
- Teks internal: kecil di bawah/sekitar badge kelas.
- Cover belakang: isi sinopsis berbasis daftar isi, tanpa heading “Sinopsis”, tanpa ISBN/barcode/placeholder.
- Punggung: polos/sederhana tanpa teks dan logo.

## Alur pengguna

1. Isi informasi buku dan daftar isi.
2. Pilih warna, style, genre font, text effect judul, nuansa, dan instruksi custom jika perlu.
3. Generate JSON.
4. Klik **ChatGPT — Direkomendasikan** atau Gemini; aplikasi menyalin JSON dan membuka AI di tab baru.
5. Unggah logo langsung pada chat AI yang sama.
6. Tempel JSON. AI harus masuk ke mode image generation dan menghasilkan satu gambar full-wrap.
7. Cek artwork: tidak boleh ada overlay teknis, angka ukuran, koordinat, ISBN/barcode, placeholder, heading “Sinopsis”, atau output dalam bentuk slide/presentasi.

## Revisi paling umum

- Ubah posisi elemen: edit `buildLayoutLock()` dan bagian `LAYOUT LOCK` di `lib/prompt-engine.js`.
- Ubah rumus/bleed/safe margin: edit `lib/print-spec.js`.
- Tambah style/genre font/text effect/nuansa: edit `lib/visual-presets.js` dan option pada `index.html`.
- Ubah aturan output AI/negative prompt: edit `lib/prompt-engine.js`.
- Ubah tampilan UI: edit `styles.css` dan `index.html`.
