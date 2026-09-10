const { buildPrintSpec } = require("./print-spec");

const TEMPLATE_ID = "LITNUS-SCHOOL-WRAP-A4-V1.1";

function clean(value, max = 5000) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

function normalizeClass(value) {
  return clean(value, 30).toUpperCase().replace(/\s+/g, " ");
}

function inferAge(level, className) {
  const lvl = clean(level, 30).toLowerCase();
  const cls = normalizeClass(className);
  const n = Number((cls.match(/\d+/) || [])[0]);
  const roman = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
  const romanNum = roman[cls];
  const c = Number.isFinite(n) && n > 0 ? n : romanNum;

  if (lvl.includes("sd") || lvl.includes("mi")) {
    const grade = c || 6;
    return `${Math.max(6, grade + 5)}–${Math.max(7, grade + 6)} tahun`;
  }
  if (lvl.includes("smp") || lvl.includes("mts")) {
    const grade = c || 7;
    return `${grade + 5}–${grade + 6} tahun`;
  }
  if (lvl.includes("sma") || lvl.includes("ma") || lvl.includes("smk")) {
    const grade = c || 10;
    return `${grade + 5}–${grade + 6} tahun`;
  }
  return "sesuai usia wajar untuk kelas yang diinput";
}

function tocLines(toc) {
  return clean(toc, 12000)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 160);
}

function buildLayoutLock() {
  return {
    note: "NON-PRINTING METADATA. Gunakan aturan posisi ini untuk menyusun desain, tetapi JANGAN menggambar kotak zona, label zona, koordinat, angka ukuran, garis bantu, garis trim, garis bleed, ruler, panah ukur, atau anotasi teknis apa pun pada artwork final.",
    panelOrder: "cover belakang di kiri, punggung di tengah, cover depan di kanan",
    frontCover: {
      logo: "kanan atas di dalam safe area; gunakan hanya logo gambar yang benar-benar dilampirkan pengguna pada percakapan AI",
      title: "tengah secara horizontal pada area tengah-atas; judul paling dominan; urutan kata harus persis seperti input",
      subtitle: "tepat di bawah judul, hanya jika subjudul diisi",
      hero: "tengah hingga bagian bawah, 1–2 siswa sekolah Islam sesuai usia kelas, tidak menabrak judul atau footer",
      author: "kiri bawah di dalam safe area",
      class: "kanan bawah di dalam safe area",
    },
    backCover: {
      synopsisHeading: "bagian atas-tengah area teks belakang",
      synopsisBody: "di bawah heading, rapi, lapang, mudah dibaca",
      lowerArea: "lanjutkan background secara bersih; jangan sediakan kotak putih, placeholder ISBN, barcode, QR, harga, atau panel stiker",
    },
    spine: "polos/sangat sederhana, mengikuti warna tema, tanpa teks, tanpa logo, tanpa ilustrasi rumit",
  };
}

function buildAiPrintSpec(printSpec) {
  return {
    note: "NON-PRINTING METADATA ONLY. Angka di bagian ini hanya untuk ukuran produksi. JANGAN menampilkan angka, ukuran, formula, koordinat, garis ukur, label FRONT/BACK/SPINE, bleed, trim, safe area, atau anotasi teknis pada gambar cover final.",
    trim_each_panel_mm: { width: 210, height: 297 },
    bleed_mm: {
      top: 5,
      bottom: 5,
      back_outer_left: 5,
      front_outer_right: 5,
      spine_left_right: 0,
    },
    safe_margin_from_trim_mm: 15,
    spine_width_mm: printSpec.spine.widthMm,
    canvas_mm: { width: printSpec.canvas.widthMm, height: printSpec.canvas.heightMm },
    panel_order: "BACK COVER | SPINE | FRONT COVER",
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
    school: clean(input.school, 180),
    foundation: clean(input.foundation, 180),
    tableOfContents: tocLines(input.toc),
  };

  const printSpec = buildPrintSpec(pages);
  const aiPrintSpec = buildAiPrintSpec(printSpec);
  const layoutLock = buildLayoutLock();
  const age = inferAge(book.level, book.class);

  const synopsisSource = book.tableOfContents.length
    ? book.tableOfContents.join("; ")
    : "Gunakan hanya informasi buku yang tersedia. Jangan mengarang bab atau materi baru.";

  const exactText = [
    `Judul: ${book.title}`,
    book.subtitle ? `Subjudul: ${book.subtitle}` : "Subjudul: TIDAK ADA",
    `Penulis: ${book.author}`,
    `Kelas/Jenjang: ${book.level} ${book.class}`.trim(),
    book.school ? `Sekolah: ${book.school}` : "Sekolah: tidak perlu ditulis",
    book.foundation ? `Yayasan: ${book.foundation}` : "Yayasan: tidak perlu ditulis",
  ].join(" | ");

  const masterPrompt = `
INSTRUKSI PALING PENTING — ARTWORK FINAL HARUS BERSIH
Buat SATU artwork full-wrap cover buku sekolah siap cetak. Semua ukuran, angka milimeter, formula, panel boundary, safe area, bleed, trim, dan aturan posisi yang tertulis di JSON ini adalah metadata produksi yang TIDAK BOLEH terlihat pada artwork. JANGAN menggambar ruler, panah ukur, garis bantu, garis potong, garis bleed, bounding box, kotak zona, label BACK COVER, FRONT COVER, SPINE, tulisan "safe margin", tulisan "bleed", koordinat x/y, angka ukuran, atau anotasi teknis apa pun. Hasil akhir harus terlihat seperti cover buku jadi, bukan proof teknis atau diagram prepress.

PERAN DAN TUJUAN
Anda bertindak sebagai senior educational book-cover designer sekaligus operator prepress. Buat satu desain full-wrap yang terdiri atas cover belakang di kiri, punggung di tengah, dan cover depan di kanan. Desain harus terasa sebagai seri buku sekolah yang konsisten, bersih, modern, profesional, mudah dibedakan antarkelas, dan tidak terasa seperti AI slop.

SPESIFIKASI PRODUKSI — GUNAKAN, JANGAN CETAKKAN SEBAGAI TEKS
- Cover depan dan belakang masing-masing A4 portrait, 210 × 297 mm.
- Bleed 5 mm: atas dan bawah seluruh spread, sisi luar kiri cover belakang, dan sisi luar kanan cover depan.
- Lebar punggung final: ${printSpec.spine.widthMm} mm untuk ${pages} halaman.
- Ukuran kanvas full-wrap final: ${printSpec.canvas.widthMm} × ${printSpec.canvas.heightMm} mm.
- Semua teks, logo, wajah, tangan, dan elemen penting harus berada sekurang-kurangnya 15 mm ke dalam dari garis trim final.
- Background, warna, dan tekstur boleh menerus sampai bleed.
- Jangan tampilkan satu pun angka atau keterangan teknis di atas sebagai bagian desain.

LAYOUT LOCK COVER DEPAN
1. LOGO: logo tidak berasal dari formulir. Pengguna akan mengunggah file logo langsung di percakapan AI bersama JSON ini. Jika satu atau beberapa logo gambar dilampirkan, tempatkan logo tersebut berkelompok rapi di kanan atas cover depan, tetap di dalam safe area. Pertahankan bentuk, rasio, lambang, dan tulisan asli. Jangan menggambar ulang logo. Jika tidak ada file logo yang dilampirkan, biarkan area kanan atas bersih; jangan membuat placeholder dan jangan mengarang logo.
2. JUDUL: tulis persis “${book.title}” di tengah secara horizontal pada area tengah-atas. Judul menjadi elemen tipografi paling dominan. Pertahankan urutan kata persis seperti input. Boleh melakukan line-break untuk komposisi, tetapi jangan mengubah, memindahkan, mengulang, atau memecah judul menjadi hierarki makna baru.
3. SUBJUDUL: ${book.subtitle ? `tulis persis “${book.subtitle}” tepat di bawah judul dengan ukuran lebih kecil.` : "tidak ada subjudul. Jangan membuat subjudul, slogan, descriptor, atau tagline tambahan."}
4. HERO: tampilkan 1–2 pelajar Indonesia dari sekolah Islam sebagai hero utama di area tengah hingga bawah. Usia visual sekitar ${age}, sesuai ${book.level} ${book.class}. Jika ada siswi perempuan, WAJIB berhijab rapi dan berpakaian sopan. Siswa laki-laki memakai seragam sekolah yang rapi dan sopan. Ekspresi natural, cerdas, ramah, dan tidak berlebihan.
5. PENULIS: tulis persis “${book.author}” di kiri bawah, di dalam safe area. Jangan menambahkan label "penulis", koordinat, ukuran, atau kotak panduan di sekelilingnya.
6. KELAS: tulis persis “${book.level} ${book.class}” di kanan bawah, di dalam safe area. Boleh menggunakan label/pill sederhana sebagai elemen desain final, tetapi tanpa ukuran, koordinat, atau anotasi panduan.
7. Posisi logo, judul, hero, penulis, dan kelas harus konsisten pada setiap buku seri ini. Variasi hanya pada palet warna, suasana, motif mata pelajaran, dan detail ilustrasi.

ARAH VISUAL SERI
- Gunakan ilustrasi editorial pendidikan premium: semi-realistic 3D digital illustration / painterly CGI yang halus, anatomi masuk akal, pencahayaan natural hangat, detail rapi, modern, dan cocok untuk buku sekolah Indonesia.
- Bukan anime, bukan chibi, bukan kartun bayi, bukan poster game, bukan poster film, dan bukan foto hiperrealistik.
- AI bebas memilih palet warna sesuai mata pelajaran dan kelas. Mata pelajaran yang sama pada kelas berbeda tidak harus memakai warna yang sama. Prioritaskan variasi yang tetap harmonis agar buku tidak mudah tertukar.
- Sisakan negative space yang cukup di area judul dan footer. Jangan menaruh objek detail tepat di belakang teks utama.

ILUSTRASI SESUAI ISI BUKU
Mata pelajaran: ${book.subject}.
Gunakan daftar isi sebagai sumber konsep visual. Pilih 3–5 motif yang paling relevan lalu integrasikan secara natural ke aktivitas atau lingkungan siswa. Jangan mengubah cover menjadi kolase ikon. Jangan menaruh puluhan simbol mengambang. Diagram, grafik, papan, buku, layar, atau objek pendukung tidak boleh berisi tulisan palsu, angka acak, label sumbu acak, rumus ngawur, watermark, atau pseudo-text.
Daftar isi sumber: ${synopsisSource}
Ilustrasi harus langsung memberi kesan mata pelajaran “${book.subject}” tanpa membuat desain terlalu literal atau penuh.

COVER BELAKANG
- Gunakan desain yang menyatu dengan cover depan tetapi lebih tenang dan lebih lapang.
- Buat heading “Sinopsis”.
- Tulis sinopsis bahasa Indonesia sekitar 80–120 kata berdasarkan HANYA judul, subjudul, kelas, mata pelajaran, dan daftar isi yang diberikan. Jangan memasukkan nama tokoh, tempat, fakta, metode, capaian, kutipan, ayat, slogan, atau materi baru jika tidak tercantum pada input.
- Tata sinopsis rapi dan mudah dibaca, seluruhnya di dalam safe area.
- Buku ini TANPA ISBN. Jangan membuat ISBN, barcode, QR code, harga, kode produk, area ISBN, kotak putih kosong, panel stiker, placeholder, alamat, nomor telepon, website, akreditasi, atau legal notice.
- Area bawah cover belakang harus tetap menjadi bagian desain/background yang utuh dan bersih, bukan ruang kosong berbentuk kotak.
- Jika nama sekolah atau yayasan diisi, boleh tampilkan sebagai teks kecil yang rapi hanya bila cocok; jangan menciptakan informasi tambahan.

PUNGGUNG
- Punggung selebar ${printSpec.spine.widthMm} mm dibuat polos/sangat sederhana mengikuti transisi warna tema.
- Tanpa teks, tanpa logo, tanpa foto, tanpa ilustrasi rumit, tanpa ornamen padat.
- Jangan tampilkan tulisan "SPINE" atau ukuran punggung pada artwork.

ASET LOGO DARI PERCAKAPAN AI
Saat pengguna mengunggah logo bersama JSON ini, perlakukan gambar terlampir sebagai aset sumber. Gunakan hanya logo yang benar-benar terlampir. Jangan membuat versi imitasi. Jangan menampilkan nama file. Jika tidak ada logo terlampir, area logo dibiarkan bersih tanpa placeholder.

TEKS YANG HARUS DIPERTAHANKAN
${exactText}
Jangan menambahkan tagline, motto, ayat, kutipan, badge, nama organisasi, label teknis, atau kalimat lain kecuali diminta di atas. Jika generator kesulitan merender teks persis, prioritaskan ruang, hierarki, dan komposisi yang benar agar teks dapat diperbaiki saat finishing di Photoshop.

QUALITY CONTROL SEBELUM FINAL
Periksa sebelum menghasilkan gambar: full-wrap hanya satu artwork; cover belakang kiri, punggung tengah, cover depan kanan; tidak ada overlay teknis; tidak ada angka ukuran; tidak ada koordinat; tidak ada garis trim/bleed/safe-area; tidak ada label FRONT/BACK/SPINE; tidak ada ISBN/barcode/QR/placeholder; logo kanan atas hanya jika aset logo dilampirkan; judul tengah; penulis kiri bawah; kelas kanan bawah; semua elemen penting aman 15 mm dari trim; hero sesuai usia; siswi berhijab; ilustrasi relevan; visual bersih, profesional, dan konsisten sebagai seri buku sekolah.
`.trim();

  const negativePrompt = [
    "technical proof overlay",
    "prepress diagram",
    "measurement annotations",
    "dimension arrows",
    "ruler",
    "crop marks",
    "trim lines",
    "bleed lines",
    "safe margin lines",
    "safe area box",
    "bounding boxes",
    "layout guide boxes",
    "coordinates",
    "x coordinate",
    "y coordinate",
    "global x",
    "local x",
    "global y",
    "local y",
    "millimeter labels",
    "mm labels",
    "FRONT COVER label",
    "BACK COVER label",
    "SPINE label",
    "BLEED label",
    "SAFE MARGIN label",
    "numbers around logo",
    "numbers around title",
    "numbers around author",
    "numbers around class",
    "AI slop",
    "layout acak atau bergeser",
    "cover depan berada di kiri",
    "punggung salah posisi",
    "judul tidak di tengah",
    "urutan kata judul berubah",
    "nama penulis bukan di kiri bawah",
    "kelas bukan di kanan bawah",
    "logo bukan di kanan atas",
    "fake logo",
    "logo placeholder",
    "white logo placeholder",
    "teks atau logo kurang dari 15 mm dari garis trim",
    "teks masuk bleed",
    "wajah atau tangan masuk area potong",
    "siswi perempuan tanpa hijab",
    "rambut siswi terlihat tidak wajar dari hijab",
    "pakaian tidak sopan atau ketat",
    "usia siswa tidak sesuai kelas",
    "wajah duplikat",
    "mata tidak sejajar",
    "tangan cacat",
    "jari berlebih atau kurang",
    "anggota tubuh ganda",
    "anatomi rusak",
    "pose tidak alami",
    "objek menembus tubuh",
    "huruf acak",
    "typo berat",
    "gibberish text",
    "pseudo-text",
    "random graph labels",
    "random numbers",
    "random equations",
    "fake Arabic calligraphy",
    "tagline buatan",
    "slogan buatan",
    "ISBN",
    "ISBN placeholder",
    "barcode",
    "barcode placeholder",
    "QR code",
    "QR placeholder",
    "price box",
    "white empty rectangle",
    "blank sticker panel",
    "product code",
    "watermark",
    "ikon mengambang berlebihan",
    "kolase simbol",
    "ornamen terlalu ramai",
    "glow berlebihan",
    "lens flare berlebihan",
    "plastik 3D murah",
    "stock-photo look",
    "poster game",
    "poster film",
    "anime",
    "chibi",
    "kartun bayi",
    "hyperrealistic photo",
    "background sibuk di belakang judul",
    "kontras teks rendah",
    "warna neon menyilaukan sebagai dominan",
    "ilustrasi tidak terkait mata pelajaran",
    "materi yang tidak ada di daftar isi",
    "punggung penuh ilustrasi",
    "teks pada punggung",
    "logo pada punggung",
    "crop kepala",
    "crop wajah",
    "komposisi tidak seimbang",
    "terlalu banyak elemen dekoratif"
  ].join(", ");

  return {
    template_id: TEMPLATE_ID,
    generator_version: "1.1.0",
    non_printing_rule: "CRITICAL: print_spec dan layout_lock adalah metadata/instruksi saja. Jangan render angka, koordinat, garis bantu, ukuran, label panel, atau anotasi teknis apa pun pada artwork final.",
    book,
    logo_instruction: "Logo tidak diunggah melalui aplikasi ini. Setelah membuka AI generator, unggah logo sebagai attachment pada chat yang sama sebelum/bersamaan dengan menempel JSON. Gunakan hanya logo yang dilampirkan; jika tidak ada, jangan membuat placeholder.",
    isbn_policy: "NO ISBN. Jangan render ISBN, barcode, QR, kotak putih, atau placeholder apa pun di cover belakang.",
    print_spec: aiPrintSpec,
    layout_lock: layoutLock,
    master_prompt: masterPrompt,
    negative_prompt: negativePrompt,
  };
}

module.exports = { TEMPLATE_ID, buildCoverSpec, inferAge };
