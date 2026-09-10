const { buildPrintSpec } = require('./print-spec');
const { getStylePreset } = require('./style-presets');

const TEMPLATE_ID = 'LITNUS-SCHOOL-WRAP-A4-V1.2';
const DEFAULT_FOOTER_TEXT = 'Untuk Kalangan Sendiri, YAYASAN BMCI';

function clean(value, max = 5000) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max);
}

function normalizeClass(value) {
  return clean(value, 30).toUpperCase().replace(/\s+/g, ' ');
}

function normalizeHex(value, fallback) {
  const v = clean(value, 16).toUpperCase();
  return /^#[0-9A-F]{6}$/.test(v) ? v : fallback;
}

function inferAge(level, className) {
  const lvl = clean(level, 30).toLowerCase();
  const cls = normalizeClass(className);
  const n = Number((cls.match(/\d+/) || [])[0]);
  const roman = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
  const c = Number.isFinite(n) && n > 0 ? n : roman[cls];
  if (lvl.includes('sd') || lvl.includes('mi')) {
    const grade = c || 6;
    return `${Math.max(6, grade + 5)}–${Math.max(7, grade + 6)} tahun`;
  }
  if (lvl.includes('smp') || lvl.includes('mts')) {
    const grade = c || 7;
    return `${grade + 5}–${grade + 6} tahun`;
  }
  if (lvl.includes('sma') || lvl.includes('ma') || lvl.includes('smk')) {
    const grade = c || 10;
    return `${grade + 5}–${grade + 6} tahun`;
  }
  return 'sesuai usia wajar untuk kelas yang diinput';
}

function tocLines(toc) {
  return clean(toc, 12000).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 160);
}

function buildLayoutLock() {
  return {
    non_printing_note: 'Aturan posisi ini hanya instruksi internal untuk AI. DILARANG menampilkan koordinat, ruler, guide, label zona, garis trim, bleed, safe area, atau angka ukuran pada artwork final.',
    front_cover: {
      logo: 'kanan atas, di dalam safe margin, gunakan hanya logo yang benar-benar dilampirkan pengguna pada chat AI',
      title: 'tengah hingga tengah-atas, paling dominan',
      subtitle: 'tepat di bawah judul bila ada',
      hero: 'tengah-bawah, 1–2 siswa sekolah Islam sesuai usia kelas',
      author: 'kiri bawah, rapi, tidak terlalu dekoratif',
      class_badge: 'kanan bawah, badge geometris Islami premium berbentuk medallion/bintang 8 atau 10 sisi dengan outline berlapis dan aksen elegan; kelas besar di tengah; jenjang kecil sebagai pendukung',
      footer_text: 'tepat di bawah atau dekat badge kelas, kecil, bersih, tidak mengganggu penulis',
    },
    back_cover: {
      synopsis: 'area utama, rapi dan lapang',
      forbidden: 'tanpa ISBN, barcode, QR, harga, kode produk, placeholder putih, alamat, nomor telepon, atau website yang tidak diberikan',
    },
    spine: 'polos/sangat sederhana mengikuti warna tema, tanpa teks dan tanpa logo',
  };
}

function buildCoverSpec(input) {
  const pages = Number(input.pages);
  const book = {
    subject: clean(input.subject, 120),
    title: clean(input.title, 180),
    subtitle: clean(input.subtitle, 220),
    author: clean(input.author, 220),
    pages,
    class: normalizeClass(input.className),
    level: clean(input.level, 80),
    tableOfContents: tocLines(input.toc),
  };

  const visual = {
    primary_color: normalizeHex(input.primaryColor, '#0F5132'),
    secondary_color: normalizeHex(input.secondaryColor, '#D4AF37'),
    style_key: clean(input.stylePreset, 60) || 'premium_school',
    custom_instruction: clean(input.customInstruction, 1800),
    footer_text: clean(input.footerText, 180) || DEFAULT_FOOTER_TEXT,
  };

  const style = getStylePreset(visual.style_key);
  const printSpec = buildPrintSpec(pages);
  const layoutLock = buildLayoutLock();
  const age = inferAge(book.level, book.class);
  const synopsisSource = book.tableOfContents.length ? book.tableOfContents.join('; ') : 'Gunakan hanya informasi buku yang tersedia.';

  const masterPrompt = `
PERAN
Anda bertindak sebagai senior educational book-cover designer dan operator prepress. Buat SATU artwork full-wrap cover buku sekolah A4 siap cetak: cover belakang di kiri, punggung di tengah, cover depan di kanan. Hasil final harus berupa desain cover bersih, BUKAN lembar kerja teknis, BUKAN diagram, dan BUKAN mockup dengan anotasi ukuran.

DATA BUKU
- Mata pelajaran: ${book.subject}
- Judul: ${book.title}
- Subjudul: ${book.subtitle || 'tidak ada; jangan membuat subjudul baru'}
- Penulis: ${book.author}
- Jenjang/Kelas: ${book.level} ${book.class}
- Jumlah halaman: ${book.pages}
- Teks default di bawah/dekat badge kelas: ${visual.footer_text}

SPESIFIKASI CETAK — HANYA UNTUK MENGATUR KANVAS, JANGAN DICETAK SEBAGAI TEKS
- Ukuran jadi cover depan: 210 × 297 mm.
- Ukuran jadi cover belakang: 210 × 297 mm.
- Bleed: 5 mm atas dan bawah seluruh spread; 5 mm sisi luar kiri cover belakang; 5 mm sisi luar kanan cover depan.
- Safe margin: semua teks, logo, wajah, tangan, dan elemen penting minimal 15 mm dari garis potong final.
- Lebar punggung: ${printSpec.spine.widthMm} mm (${book.pages} × 0,0472 mm).
- Ukuran kanvas full-wrap: ${printSpec.canvas.widthMm} × ${printSpec.canvas.heightMm} mm.
- PENTING: angka ukuran, rumus, label FRONT/BACK/SPINE, garis trim, garis bleed, safe-area box, grid, koordinat x/y, ruler, panah ukur, bounding box, dan anotasi teknis TIDAK BOLEH terlihat pada artwork final.

LAYOUT LOCK — POSISI WAJIB SERAGAM
1. LOGO: kanan atas cover depan. Gunakan HANYA logo yang benar-benar dilampirkan pengguna pada percakapan AI. Pertahankan bentuk dan proporsi. Jangan membuat logo pengganti, placeholder, atau ikon generik bila tidak ada lampiran.
2. JUDUL: ${book.title} ditempatkan di tengah/tengah-atas cover depan sebagai fokus tipografi terbesar. Tidak boleh berpindah ke atas ekstrem, bawah, atau samping.
3. SUBJUDUL: ${book.subtitle ? `tulis persis “${book.subtitle}” tepat di bawah judul.` : 'tidak ada; jangan tambahkan slogan/tagline buatan.'}
4. HERO: 1–2 pelajar Indonesia dari sekolah Islam di tengah-bawah, usia visual sekitar ${age}. Bila ada siswi, WAJIB berhijab rapi dan sopan. Siswa laki-laki berseragam rapi. Hero relevan dengan mata pelajaran dan tidak menutup judul, penulis, badge kelas, atau logo.
5. PENULIS: tulis persis “${book.author}” di kiri bawah cover depan.
6. BADGE KELAS: kanan bawah. Buat lebih stylish dan premium daripada pill biasa: medallion geometris Islami / bintang 8 atau 10 sisi / emblem berlapis dengan outline elegan, tetap bersih dan mudah dibaca. Kelas “${book.class}” menjadi teks terbesar di badge, sementara “${book.level}” sebagai teks pendukung kecil. Badge tidak boleh terlihat seperti logo sekolah.
7. TEKS BAWAH KELAS: tulis persis “${visual.footer_text}” dalam ukuran kecil, bersih, ditempatkan dekat/di bawah badge kelas tanpa bertabrakan dengan nama penulis.
8. Struktur posisi di atas tidak boleh berubah meskipun style, warna, ilustrasi, atau custom instruction berbeda.

VISUAL CONTROL
- Primary color: ${visual.primary_color}
- Secondary/accent color: ${visual.secondary_color}
- Style preset: ${style.label}
- Interpretasi style: ${style.instruction}
- Primary menjadi fondasi warna utama. Secondary dipakai untuk aksen, outline, detail ornamental, highlight, atau badge kelas. Boleh gunakan warna netral pendukung agar komposisi tidak monoton.
- Warna dan style hanya boleh mengubah mood, ilustrasi, tekstur, pencahayaan, dan ornamentasi. DILARANG mengubah layout lock.
${visual.custom_instruction ? `- Instruksi custom pengguna: ${visual.custom_instruction}\n- Ikuti instruksi custom hanya jika tidak bertentangan dengan ukuran cetak, safe margin, layout lock, aturan logo, aturan siswa, no-ISBN policy, dan larangan anotasi teknis.` : '- Tidak ada instruksi custom tambahan.'}

ILUSTRASI BERDASARKAN ISI
Gunakan daftar isi untuk memahami tema dan memilih 3–5 motif visual paling relevan. Jangan menyalin daftar isi sebagai teks ke cover. Jangan membuat kolase simbol yang ramai. Integrasikan motif secara natural ke lingkungan, aktivitas, properti, arsitektur, alat belajar, atau elemen dekoratif.
Daftar isi sumber: ${synopsisSource}

COVER BELAKANG
- Buat cover belakang lebih tenang, lapang, dan menyatu dengan depan.
- Heading: “Sinopsis”.
- Tulis sinopsis sekitar 80–120 kata berdasarkan HANYA judul, mata pelajaran, kelas, subjudul bila ada, dan daftar isi. Jangan mengarang capaian, metode, lokasi, tokoh, fasilitas, kutipan, atau materi yang tidak tersedia.
- Tidak ada ISBN. Tidak ada barcode. Tidak ada QR. Tidak ada kotak putih placeholder. Tidak ada harga. Tidak ada kode produk. Tidak ada alamat/website/nomor telepon buatan.

PUNGGUNG
- Lebar punggung ${printSpec.spine.widthMm} mm.
- Polos/sangat sederhana mengikuti palet cover.
- Tanpa judul, tanpa penulis, tanpa logo, tanpa ikon, tanpa ilustrasi rumit.

TEKS YANG BOLEH MUNCUL PADA COVER DEPAN
- ${book.title}
${book.subtitle ? `- ${book.subtitle}` : ''}
- ${book.author}
- ${book.level} ${book.class}
- ${visual.footer_text}
- Teks yang memang sudah menjadi bagian dari logo lampiran.
Jangan membuat tagline, moto, kutipan, ayat, slogan, label kurikulum, badge nilai, atau teks promosi tambahan kecuali disebut eksplisit dalam instruksi custom.

NEGATIVE / QUALITY CONTROL
Hindari AI slop, anatomi rusak, jari berlebih/kurang, wajah duplikat, tangan cacat, proporsi anak dewasa, siswi tanpa hijab, pakaian ketat, pose kaku, objek menembus tubuh, fake logo, logo terdistorsi, gibberish, typo, fake Arabic calligraphy, visual terlalu ramai, ikon mengambang berlebihan, poster film/game, anime, chibi, stock-photo look, glow/lens flare berlebihan, background sibuk di belakang judul, kontras rendah, crop wajah/kepala/tangan penting, dan elemen penting dekat garis potong.

FINAL CHECK
Sebelum menghasilkan gambar, pastikan hasil final tampak seperti cover buku sungguhan tanpa instruksi teknis yang tercetak; front di kanan, back di kiri, spine di tengah; logo kanan atas hanya dari lampiran; judul tengah; penulis kiri bawah; badge kelas stylish kanan bawah; teks “${visual.footer_text}” muncul rapi dekat badge; safe margin aman; tanpa ISBN/barcode/placeholder; dan ilustrasi sesuai daftar isi.
`.trim();

  const negativePrompt = [
    'AI slop','technical diagram','measurement annotations','coordinates','x y labels','ruler','trim lines','bleed lines','safe-area box','layout guides','bounding boxes','arrows','FRONT COVER label','BACK COVER label','SPINE label','printed dimensions','printed spine width','ISBN','barcode','QR code','white barcode box','placeholder box','fake logo','logo placeholder','random logo','gibberish text','fake Arabic calligraphy','tagline buatan','slogan buatan','siswi tanpa hijab','rambut siswi terlihat tidak wajar','pakaian ketat','usia siswa salah','extra fingers','missing fingers','deformed hands','duplicate face','broken anatomy','cropped head','cropped face','busy title background','floating icon collage','overdecorated layout','cheap 3D plastic','anime','chibi','movie poster','game poster','stock-photo look','spine text','spine logo'
  ].join(', ');

  return {
    template_id: TEMPLATE_ID,
    generator_version: '1.2.0',
    book,
    visual_controls: {
      primary_color: visual.primary_color,
      secondary_color: visual.secondary_color,
      style_preset: { key: visual.style_key, label: style.label },
      footer_text: visual.footer_text,
      custom_instruction: visual.custom_instruction || null,
    },
    print_spec: printSpec,
    layout_lock: layoutLock,
    master_prompt: masterPrompt,
    negative_prompt: negativePrompt,
  };
}

module.exports = { TEMPLATE_ID, DEFAULT_FOOTER_TEXT, buildCoverSpec, inferAge };
