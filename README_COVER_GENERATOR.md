# CoverPrompt — School Book Cover Prompt Generator

Aplikasi internal ringan untuk menyusun **satu JSON prompt** cover buku sekolah full-wrap A4 dengan layout baku, bleed, safe margin, dan lebar punggung otomatis.

## Prinsip

- Tidak ada database.
- Isi formulir tidak disimpan oleh aplikasi.
- File logo hanya dipreview di browser dan **tidak dikirim ke backend**; API hanya menerima nama file sebagai manifest referensi.
- Endpoint `/api/generate` hanya menyusun JSON berdasarkan input dan mengembalikannya dengan `Cache-Control: no-store`.
- Lebar punggung = `jumlah halaman × 0,0472 mm`.
- Bleed 5 mm atas/bawah, sisi luar kiri cover belakang, dan sisi luar kanan cover depan.
- Semua teks/logo/elemen penting minimal 15 mm dari garis trim.

## Struktur modular

- `index.html` — struktur UI.
- `styles.css` — design system hijau neon dan responsive UI.
- `app.js` — interaksi form, preview teknis, upload logo lokal, copy/download JSON.
- `api/generate.js` — endpoint stateless untuk validasi dan output JSON.
- `lib/print-spec.js` — satu sumber aturan ukuran cetak dan rumus punggung.
- `lib/prompt-engine.js` — template prompt, layout lock, aturan ilustrasi, dan negative prompt.
- `vercel.json` — konfigurasi fungsi dan header no-store.

## Revisi paling umum

- Ubah posisi elemen: edit `buildLayoutLock()` dan bagian `LAYOUT LOCK` di `lib/prompt-engine.js`.
- Ubah rumus/bleed/safe margin: edit `lib/print-spec.js`.
- Ubah gaya visual dan negative prompt: edit `lib/prompt-engine.js`.
- Ubah tampilan UI: edit `styles.css`.

## Alur pengguna

1. Isi informasi buku.
2. Tambahkan logo referensi (maks. 4).
3. Tempel daftar isi.
4. Generate JSON.
5. Salin JSON dan unggah logo yang sama ke AI generator.
6. Cek hasil akhir sebelum proses cetak/finishing.
