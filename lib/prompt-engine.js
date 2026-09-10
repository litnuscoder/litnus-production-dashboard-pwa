const { buildPrintSpec, round2 } = require("./print-spec");
const { STYLE_PRESETS, FONT_GENRES, TITLE_EFFECTS, MOOD_PRESETS } = require("./visual-presets");

const TEMPLATE_ID = "LITNUS-SCHOOL-WRAP-A4-V1.4";

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
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 160);
}

function color(value, fallback) {
  const v = clean(value, 7).toUpperCase();
  return /^#[0-9A-F]{6}$/.test(v) ? v : fallback;
}

function buildLayoutLock(printSpec) {
  const s = printSpec.spine.widthMm;
  const frontLeft = printSpec.panelCoordinates.x.frontTrimLeft;
  const localToGlobal = (localX) => round2(frontLeft + localX);

  return {
    panelOrder: "kiri ke kanan: bleed luar belakang → cover belakang → punggung → cover depan → bleed luar depan",
    exactPanelBoundariesMm: {
      backCover: [5, 215],
      spine: [215, round2(215 + s)],
      frontCover: [round2(215 + s), round2(425 + s)]
    },
    frontCoverLockedZonesMm: {
      logoZone: {
        localFromFrontTrim: { x: [130, 195], y: [15, 58] },
        globalCanvasX: [localToGlobal(130), localToGlobal(195)],
        instruction: "semua logo referensi yang diunggah di chat AI dikelompokkan rapi di kanan atas, pertahankan rasio asli, jangan digambar ulang"
      },
      titleZone: {
        localFromFrontTrim: { x: [28, 182], y: [62, 124] },
        globalCanvasX: [localToGlobal(28), localToGlobal(182)],
        instruction: "judul menjadi fokus utama di tengah; subjudul tepat di bawahnya"
      },
      heroZone: {
        localFromFrontTrim: { x: [24, 186], y: [120, 246] },
        globalCanvasX: [localToGlobal(24), localToGlobal(186)],
        instruction: "1–2 siswa sebagai hero utama, jangan menabrak area judul atau footer"
      },
      authorZone: {
        localFromFrontTrim: { x: [15, 108], y: [258, 282] },
        globalCanvasX: [localToGlobal(15), localToGlobal(108)],
        instruction: "nama penulis kiri bawah"
      },
      classZone: {
        localFromFrontTrim: { x: [125, 195], y: [248, 284] },
        globalCanvasX: [localToGlobal(125), localToGlobal(195)],
        instruction: "badge kelas kanan bawah, premium, berbentuk medallion/geometris islami, lebih stylish dari pill biasa"
      },
      footerTextZone: {
        localFromFrontTrim: { x: [118, 195], y: [284, 292] },
        globalCanvasX: [localToGlobal(118), localToGlobal(195)],
        instruction: "teks kecil di bawah/sekitar badge kelas untuk frasa internal seperti Untuk Kalangan Sendiri"
      }
    },
    backCoverLockedZonesMm: {
      synopsisBody: { localFromBackTrim: { x: [20, 190], y: [60, 222] } }
    }
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
    tableOfContents: tocLines(input.toc)
  };

  const visualControls = {
    primary_color: color(input.primaryColor, "#0F5132"),
    secondary_color: color(input.secondaryColor, "#D4AF37"),
    style_preset: {
      key: clean(input.stylePreset, 80) || "premium_school",
      label: (STYLE_PRESETS[clean(input.stylePreset, 80)] || STYLE_PRESETS.premium_school).label
    },
    font_genre: {
      key: clean(input.fontGenre, 80) || "tegas_sans",
      label: (FONT_GENRES[clean(input.fontGenre, 80)] || FONT_GENRES.tegas_sans).label
    },
    title_text_effect: {
      key: clean(input.titleTextEffect, 80) || "clean_flat",
      label: (TITLE_EFFECTS[clean(input.titleTextEffect, 80)] || TITLE_EFFECTS.clean_flat).label
    },
    mood_preset: {
      key: clean(input.moodPreset, 80) || "none",
      label: (MOOD_PRESETS[clean(input.moodPreset, 80)] || MOOD_PRESETS.none).label
    },
    footer_text: clean(input.footerText, 180) || "Untuk Kalangan Sendiri, YAYASAN BMCI",
    custom_instruction: clean(input.customInstruction, 1800)
  };

  const printSpec = buildPrintSpec(pages);
  const layoutLock = buildLayoutLock(printSpec);
  const age = inferAge(book.level, book.class);

  const styleInfo = STYLE_PRESETS[visualControls.style_preset.key] || STYLE_PRESETS.premium_school;
  const fontGenreInfo = FONT_GENRES[visualControls.font_genre.key] || FONT_GENRES.tegas_sans;
  const titleEffectInfo = TITLE_EFFECTS[visualControls.title_text_effect.key] || TITLE_EFFECTS.clean_flat;
  const moodInfo = MOOD_PRESETS[visualControls.mood_preset.key] || MOOD_PRESETS.none;

  const synopsisSource = book.tableOfContents.length
    ? book.tableOfContents.join("; ")
    : "Gunakan hanya informasi buku yang tersedia. Jangan mengarang bab atau materi baru.";

  const exactText = [
    `Judul: ${book.title}`,
    book.subtitle ? `Subjudul: ${book.subtitle}` : "Subjudul: tidak ada; jangan menambahkan subjudul buatan",
    `Penulis: ${book.author}`,
    `Kelas/Jenjang: ${book.level} ${book.class}`.trim(),
    `Teks bawah kelas: ${visualControls.footer_text}`
  ].join(" | ");

  const masterPrompt = `
EXECUTION MODE LOCK — WAJIB DIBACA PERTAMA
IMAGE GENERATION ONLY. GENERATE ONE IMAGE NOW.
Tugas ini HANYA untuk menghasilkan SATU GAMBAR RASTER full-wrap cover buku. Jangan membuat presentasi, slide deck, PowerPoint, slideshow, dokumen, PDF, webpage, wireframe, mockup presentasi, design brief, laporan, atau jawaban teks sebagai hasil utama. Jangan mengubah permintaan ini menjadi artifact lain. Langsung render/generate cover sebagai gambar. Jika platform menawarkan beberapa mode pembuatan, pilih mode IMAGE GENERATION, bukan Slides/Presentation/Document.
OUTPUT FINAL: satu gambar full-wrap cover buku yang terdiri dari cover belakang + punggung + cover depan dalam satu kanvas. Tidak perlu menjelaskan proses. Jangan menampilkan spesifikasi teknis sebagai teks pada artwork.

PERAN DAN TUJUAN
Anda bertindak sebagai senior educational book-cover designer sekaligus operator prepress. Buat SATU gambar full-wrap cover buku sekolah siap cetak, bukan tiga gambar terpisah. Desain harus terasa sebagai satu seri profesional yang konsisten antar mata pelajaran, tetapi warna dominan boleh berbeda antarkelas dan antarbuku agar mudah dibedakan. Hindari visual generik, klise, terlalu penuh, dan AI slop.

SPESIFIKASI CETAK YANG TIDAK BOLEH DIUBAH
- Ukuran jadi cover depan: 210 × 297 mm (A4 portrait).
- Ukuran jadi cover belakang: 210 × 297 mm (A4 portrait).
- Bleed: 5 mm pada atas dan bawah seluruh spread; 5 mm pada sisi luar kiri cover belakang; 5 mm pada sisi luar kanan cover depan.
- Tidak ada bleed horizontal tambahan pada sisi kiri/kanan punggung.
- Lebar punggung: ${printSpec.spine.widthMm} mm, dihitung dari ${pages} halaman × 0,0472 mm.
- Ukuran kanvas full wrap final: ${printSpec.canvas.widthMm} × ${printSpec.canvas.heightMm} mm.
- Urutan panel dari kiri ke kanan: COVER BELAKANG → PUNGGUNG → COVER DEPAN.
- Semua teks, logo, wajah, tangan, dan elemen penting WAJIB minimal 15 mm masuk ke dalam dari garis potong/trim. Jangan mengukur 15 mm dari tepi bleed; ukur dari garis potong final.
- Background, tekstur, dan warna boleh sampai bleed. Elemen penting tidak boleh masuk bleed.

LAYOUT LOCK COVER DEPAN — POSISI WAJIB KONSISTEN
1. LOGO: kelompokkan semua logo referensi yang diunggah pada chat AI di kanan atas cover depan, di zona lokal x=130–195 mm dan y=15–58 mm dari sudut kiri atas area trim cover depan. Pertahankan rasio asli setiap logo. Jangan mendesain ulang, mengubah lambang, mengganti tulisan, atau menciptakan logo palsu. Jika lebih dari satu, susun sebagai baris/stack yang rapi dengan tinggi visual seimbang.
2. JUDUL: letakkan judul utama tepat di area tengah-atas/tengah cover, zona lokal x=28–182 mm dan y=62–124 mm. Judul harus menjadi elemen tipografi paling dominan. Tulis persis: “${book.title}”. ${book.subtitle ? `Subjudul persis: “${book.subtitle}”, tepat di bawah judul.` : "Tidak ada subjudul; jangan membuat subjudul, slogan, atau tagline baru."}
3. HERO: gunakan 1–2 pelajar Indonesia dari sekolah Islam sebagai hero utama pada zona lokal x=24–186 mm dan y=120–246 mm. Usia visual sekitar ${age}, sesuai ${book.level} ${book.class}. Jika ada siswi perempuan, WAJIB berhijab rapi dan berpakaian sopan. Siswa laki-laki berpakaian seragam sekolah yang rapi dan sopan. Ekspresi natural, cerdas, hangat, tidak berlebihan.
4. PENULIS: tulis persis “${book.author}” di kiri bawah pada zona lokal x=15–108 mm dan y=258–282 mm.
5. KELAS: tampilkan badge kelas yang lebih stylish dan premium di kanan bawah pada zona lokal x=125–195 mm dan y=248–284 mm. Gunakan bentuk medallion geometris islami / bintang 8–10 sisi, bukan pill biasa. Tulis isi badge secara hierarkis dengan fokus utama pada “${book.class}”, serta tampilkan jenjang “${book.level}”.
6. FOOTER KELAS: tampilkan teks kecil persis “${visualControls.footer_text}” di area bawah/sekitar badge kelas, rapi, elegan, dan tidak lebih dominan dari badge.
7. Jangan pindahkan zona di atas. Variasi desain hanya boleh terjadi pada palet warna, suasana, motif mata pelajaran, komposisi ilustrasi di dalam zona hero, detail latar, dan treatment tipografi.

ARAH VISUAL SERI
- Primary color wajib mengikuti ${visualControls.primary_color}. Secondary/accent wajib mengikuti ${visualControls.secondary_color}. Keduanya menjadi acuan utama palet, namun tetap boleh ada turunan warna yang harmonis dan layak cetak.
- Style preset: ${styleInfo.label}. Arah visual: ${styleInfo.direction}.
- Genre font judul: ${fontGenreInfo.label}. Family direction: ${fontGenreInfo.family}. Tujuan: ${fontGenreInfo.purpose}. Arah tipografi: ${fontGenreInfo.direction}.
- Text effect judul: ${titleEffectInfo.direction}.
- Nuansa tema: ${moodInfo.direction}.
- Gunakan gaya ilustrasi editorial pendidikan premium: semi-realistic 3D digital illustration / painterly CGI yang halus, anatomi masuk akal, pencahayaan natural hangat, material tidak plastiky, detail rapi, modern, dan cocok untuk buku sekolah Indonesia.
- Bukan anime, bukan chibi, bukan kartun bayi, bukan foto hiperrealistik, bukan poster game, bukan poster film.
- Palet harus harmonis, memiliki kontras teks yang kuat, dan layak cetak. Hindari neon menyilaukan pada cover buku, kecuali aksen kecil.
- Sisakan negative space yang jelas di area judul dan footer. Tidak boleh ada wajah, tangan, ikon, bangunan, atau objek detail tepat di belakang teks utama.

ILUSTRASI SESUAI ISI BUKU
Mata pelajaran: ${book.subject}.
Gunakan daftar isi sebagai sumber konsep visual. Pilih hanya 3–5 motif visual yang paling relevan dan representatif, lalu integrasikan secara natural ke lingkungan/aktivitas siswa. Jangan mengubah cover menjadi kolase ikon. Jangan menaruh puluhan simbol mengambang.
Daftar isi sumber: ${synopsisSource}
Ilustrasi harus membantu pembaca langsung mengenali mata pelajaran “${book.subject}” tanpa harus membaca semua teks. Motif boleh berupa objek belajar, alat, lingkungan, aktivitas, diagram abstrak tanpa angka/teks palsu, atau unsur kontekstual yang benar-benar relevan dengan isi.

COVER BELAKANG
- Gunakan desain yang menyatu dengan cover depan tetapi lebih tenang dan lebih lapang.
- JANGAN tampilkan heading atau kata “Sinopsis” pada cover belakang.
- Susun isi sinopsis bahasa Indonesia sekitar 80–120 kata berdasarkan HANYA judul, subjudul, kelas, mata pelajaran, dan daftar isi yang diberikan. Jangan menambahkan bab, capaian, metode, kutipan, ayat, slogan, penghargaan, atau fakta yang tidak tersedia.
- Letakkan isi sinopsis pada zona lokal cover belakang x=20–190 mm, y=60–222 mm.
- Jangan menciptakan ISBN, barcode, alamat, QR code, nomor telepon, website, akreditasi, atau legal notice yang tidak diberikan.

PUNGGUNG
- Punggung selebar ${printSpec.spine.widthMm} mm dibuat polos/sangat sederhana, mengikuti transisi warna tema cover.
- Tanpa ilustrasi rumit, tanpa foto, tanpa ornamen padat, tanpa teks, tanpa logo.
- Jangan menggeser batas punggung.

ASET LOGO
- Logo TIDAK berasal dari formulir. Gunakan hanya logo referensi yang diunggah pengguna langsung pada chat AI. Jika tidak ada file logo yang diunggah, jangan mengarang atau membuat logo apa pun.

TEKS YANG HARUS DIPERTAHANKAN
${exactText}
Jangan menambahkan tagline, motto, ayat, kutipan, badge lain, nama organisasi lain, label kurikulum, atau kalimat lain kecuali diminta di atas. Jika generator kesulitan merender teks persis, tetap pertahankan ruang kosong dan hierarki yang benar agar teks dapat diperbaiki saat finishing di Photoshop.

INSTRUKSI CUSTOM TAMBAHAN
${visualControls.custom_instruction || "Tidak ada instruksi custom tambahan."}
Instruksi custom di atas boleh memengaruhi suasana visual, ornamen, treatment tipografi, dan detail latar, tetapi tidak boleh mengubah struktur layout lock.

QUALITY CONTROL SEBELUM FINAL
Periksa kembali bahwa: full wrap hanya satu gambar; ukuran dan punggung sesuai; cover depan berada di kanan; cover belakang di kiri; logo kanan atas; judul di tengah; penulis kiri bawah; badge kelas kanan bawah; semua teks minimal 15 mm dari trim; hero sesuai usia; siswi berhijab; ilustrasi relevan dengan daftar isi; tidak ada objek potong yang berisiko; visual bersih, profesional, tidak padat, dan konsisten sebagai seri buku sekolah.
`.trim();

  const negativePrompt = [
    "presentation",
    "presentation deck",
    "slide",
    "slides",
    "PowerPoint",
    "slideshow",
    "document",
    "PDF artifact",
    "webpage",
    "wireframe as final output",
    "design brief instead of image",
    "text-only response",
    "AI slop",
    "layout acak atau bergeser dari zona yang dikunci",
    "cover depan berada di kiri",
    "punggung salah ukuran atau salah posisi",
    "judul tidak di tengah",
    "nama penulis bukan di kiri bawah",
    "kelas bukan di kanan bawah",
    "badge kelas pill sederhana",
    "logo bukan di kanan atas",
    "teks atau logo kurang dari 15 mm dari garis trim",
    "teks masuk bleed",
    "wajah atau tangan masuk area potong",
    "kata Sinopsis tampil di cover belakang",
    "siswi perempuan tanpa hijab",
    "pakaian tidak sopan atau ketat",
    "usia siswa tidak sesuai kelas",
    "lebih dari 2 hero utama tanpa alasan",
    "wajah duplikat",
    "tangan cacat",
    "anggota tubuh ganda",
    "anatomi rusak",
    "pose tidak alami",
    "logo palsu",
    "logo terdistorsi",
    "logo digambar ulang",
    "huruf acak",
    "typo",
    "gibberish text",
    "kutipan atau ayat yang tidak diminta",
    "tagline buatan",
    "slogan buatan",
    "QR code palsu",
    "barcode palsu",
    "ISBN palsu",
    "placeholder putih ISBN",
    "watermark",
    "ikon mengambang berlebihan",
    "kolase simbol",
    "ornamen terlalu ramai",
    "glow berlebihan",
    "plastik 3D murah",
    "stock-photo look",
    "poster game",
    "poster film",
    "anime",
    "chibi",
    "hyperrealistic photo",
    "background sibuk di belakang judul",
    "kontras teks rendah",
    "warna kusam tanpa hierarki",
    "warna neon menyilaukan sebagai dominan",
    "ilustrasi tidak terkait mata pelajaran",
    "materi yang tidak ada di daftar isi",
    "punggung penuh ilustrasi",
    "teks pada punggung",
    "logo pada punggung",
    "komposisi tidak seimbang"
  ].join(", ");

  return {
    execution_lock: {
      task: "GENERATE_IMAGE",
      output_type: "SINGLE_RASTER_IMAGE",
      artifact_type: "BOOK_COVER_FULL_WRAP",
      required_action: "GENERATE_THE_IMAGE_NOW",
      final_response: "Render one full-wrap book-cover image only; no presentation, slides, document, webpage, PDF, wireframe, design brief, or text-only deliverable.",
      forbidden_alternative_artifacts: ["presentation", "slides", "PowerPoint", "slideshow", "document", "PDF", "webpage", "wireframe", "design brief", "report"]
    },
    template_id: TEMPLATE_ID,
    generator_version: "1.4.0",
    book,
    visual_controls: visualControls,
    print_spec: printSpec,
    layout_lock: layoutLock,
    master_prompt: masterPrompt,
    negative_prompt: negativePrompt
  };
}

module.exports = { TEMPLATE_ID, buildCoverSpec, inferAge };
