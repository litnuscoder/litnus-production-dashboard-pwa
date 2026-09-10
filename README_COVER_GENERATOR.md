# CoverPrompt — Generator Prompt Cover Buku Sekolah

Versi paket: **V1.5 FINAL**

## Ringkas Fungsi
Aplikasi ini menyusun **satu JSON prompt** untuk AI image generator agar guru dapat membuat cover buku sekolah full-wrap A4 yang **seragam layout-nya**, tetapi tetap fleksibel dalam hero, warna, nuansa, badge kelas, dan tipografi.

## Fitur Utama V1.5
- output JSON tunggal siap salin;
- ukuran **A4 full-wrap** dengan bleed dan perhitungan punggung otomatis;
- **Execution Lock** agar AI tidak salah membuat presentasi / slide;
- **pilihan hero**: siswa-siswi, siswa saja, siswi saja, siswa + objek materi, objek fokus, atau adegan kontekstual;
- **aturan moral pondok pesantren** untuk hero siswa:
  - siswa laki-laki wajib bersongkok nasional,
  - siswi wajib berkerudung,
  - tidak boleh bersentuhan atau bergandengan,
  - posisi kanan-kiri terpisah;
- **strategi warna**:
  - AI bebas memilih warna,
  - atau manual primary + accent;
- **genre font judul**;
- **gaya huruf penulis** dan **teks pendukung**;
- **text effect judul**;
- **style badge kelas**: geometris islami, lingkaran, kubah masjid, perisai, bintang delapan;
- **teks bawah penulis**;
- **teks bawah kelas**;
- tombol **Salin Prompt**, **ChatGPT**, dan **Gemini**;
- dropdown sudah ditata mengikuti tema UI, bukan tampilan default browser.

## Struktur File
- `index.html` — UI utama
- `styles.css` — tampilan neon hijau dan komponen tematik
- `app.js` — logika form, preview, copy, dan launch AI
- `api/generate.js` — endpoint serverless pembuat JSON
- `lib/print-spec.js` — kalkulasi ukuran cetak dan punggung
- `lib/visual-presets.js` — preset visual modular
- `lib/prompt-engine.js` — mesin pembuat prompt utama
- `vercel.json` — konfigurasi deployment Vercel

## Rumus Punggung
`lebar punggung = jumlah halaman × 0,0472 mm`

## Catatan
- logo **tidak** diunggah lewat form;
- logo diunggah langsung saat prompting ke AI;
- aplikasi tidak menyimpan isi formulir ke database.
