const { buildPrintSpec, round2 } = require("./print-spec");
const {
  STYLE_PRESETS,
  FONT_GENRES,
  SUPPORTING_FONT_GENRES,
  TITLE_EFFECTS,
  MOOD_PRESETS,
  HERO_PRESETS,
  BADGE_STYLES
} = require("./visual-presets");

const TEMPLATE_ID = "LITNUS-SCHOOL-WRAP-A4-V1.5";
const GENERATOR_VERSION = "1.5.1";

function clean(value, max = 5000) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
}

function normalizeClass(value) {
  return clean(value, 30).toUpperCase().replace(/\s+/g, " ");
}

function inferAge(level, className) {
  const lvl = clean(level, 30).toLowerCase();
  const cls = normalizeClass(className);
  const roman = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9, X:10, XI:11, XII:12 };
  const numeric = Number((cls.match(/\d+/) || [])[0]);
  const grade = Number.isFinite(numeric) && numeric > 0 ? numeric : roman[cls];
  if (lvl.includes("sd") || lvl.includes("mi")) {
    const g = grade || 6;
    return `${Math.max(6, g + 5)}–${Math.max(7, g + 6)} tahun`;
  }
  if (lvl.includes("smp") || lvl.includes("mts")) {
    const g = grade || 7;
    return `${g + 5}–${g + 6} tahun`;
  }
  if (lvl.includes("sma") || lvl.includes("ma") || lvl.includes("smk")) {
    const g = grade || 10;
    return `${g + 5}–${g + 6} tahun`;
  }
  return "sesuai usia wajar untuk kelas yang diinput";
}

function tocLines(toc) {
  return clean(toc, 12000)
    .replace(/\[[^\]]*\]\(https?:\/\/[^)]+\)/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+,\s*,+/g, ", ")
    .split(/\r?\n|;/)
    .map(line => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 160);
}

function validColor(value, fallback) {
  const v = clean(value, 7).toUpperCase();
  return /^#[0-9A-F]{6}$/.test(v) ? v : fallback;
}

function preset(map, key, fallback) {
  return map[clean(key, 80)] || map[fallback];
}

function buildLayoutLock(printSpec) {
  const spine = printSpec.spine.widthMm;
  const frontLeft = printSpec.panelCoordinates.x.frontTrimLeft;
  const globalX = x => round2(frontLeft + x);
  return {
    panelOrder: "kiri ke kanan: bleed luar belakang → cover belakang → punggung → cover depan → bleed luar depan",
    exactPanelBoundariesMm: {
      backCover: [5, 215],
      spine: [215, round2(215 + spine)],
      frontCover: [round2(215 + spine), round2(425 + spine)]
    },
    frontCoverLockedZonesMm: {
      logoZone: { localFromFrontTrim:{x:[130,195],y:[15,58]}, globalCanvasX:[globalX(130),globalX(195)], instruction:"logo kanan atas; pertahankan rasio asli; jangan digambar ulang" },
      titleZone: { localFromFrontTrim:{x:[28,182],y:[62,124]}, globalCanvasX:[globalX(28),globalX(182)], instruction:"judul fokus utama di tengah; subjudul tepat di bawahnya" },
      heroZone: { localFromFrontTrim:{x:[24,186],y:[120,246]}, globalCanvasX:[globalX(24),globalX(186)], instruction:"hero mengikuti preset; jangan menabrak judul atau footer" },
      authorZone: { localFromFrontTrim:{x:[15,108],y:[256,281]}, globalCanvasX:[globalX(15),globalX(108)], instruction:"nama penulis kiri bawah" },
      authorSubtextZone: { localFromFrontTrim:{x:[15,108],y:[282,290]}, globalCanvasX:[globalX(15),globalX(108)], instruction:"teks kecil di bawah penulis bila ada" },
      classZone: { localFromFrontTrim:{x:[125,195],y:[246,282]}, globalCanvasX:[globalX(125),globalX(195)], instruction:"badge kelas kanan bawah; mengikuti style badge" },
      footerTextZone: { localFromFrontTrim:{x:[118,195],y:[284,292]}, globalCanvasX:[globalX(118),globalX(195)], instruction:"teks kecil di bawah/sekitar badge kelas" }
    },
    backCoverLockedZonesMm: {
      synopsisBody: { localFromBackTrim:{x:[20,190],y:[60,222]} }
    }
  };
}

function buildCoverSpec(input) {
  const pages = Number(input.pages);
  const colorMode = clean(input.colorMode, 30) || "auto";
  const book = {
    subject: clean(input.subject, 120),
    title: clean(input.title, 180),
    subtitle: clean(input.subtitle, 220),
    author: clean(input.author, 220),
    authorSubtext: clean(input.authorSubtext, 140),
    pages,
    class: normalizeClass(input.className),
    level: clean(input.level, 80),
    tableOfContents: tocLines(input.toc)
  };

  const styleKey = clean(input.stylePreset, 80) || "premium_school";
  const heroKey = clean(input.heroPreset, 80) || "students_duo";
  const fontKey = clean(input.fontGenre, 80) || "tegas_sans";
  const authorFontKey = clean(input.authorFontGenre, 80) || "sans_clean";
  const supportingFontKey = clean(input.supportingFontGenre, 80) || "sans_clean";
  const effectKey = clean(input.titleTextEffect, 80) || "clean_flat";
  const badgeKey = clean(input.badgeStyle, 80) || "geometric_islamic";
  const moodKey = clean(input.moodPreset, 80) || "none";

  const styleInfo = preset(STYLE_PRESETS, styleKey, "premium_school");
  const heroInfo = preset(HERO_PRESETS, heroKey, "students_duo");
  const fontInfo = preset(FONT_GENRES, fontKey, "tegas_sans");
  const authorFontInfo = preset(SUPPORTING_FONT_GENRES, authorFontKey, "sans_clean");
  const supportingFontInfo = preset(SUPPORTING_FONT_GENRES, supportingFontKey, "sans_clean");
  const effectInfo = preset(TITLE_EFFECTS, effectKey, "clean_flat");
  const badgeInfo = preset(BADGE_STYLES, badgeKey, "geometric_islamic");
  const moodInfo = preset(MOOD_PRESETS, moodKey, "none");

  const visualControls = {
    color_mode: colorMode,
    primary_color: colorMode === "manual" ? validColor(input.primaryColor, "#0F5132") : null,
    secondary_color: colorMode === "manual" ? validColor(input.secondaryColor, "#D4AF37") : null,
    style_preset: { key: styleKey, label: styleInfo.label },
    hero_preset: { key: heroKey, label: heroInfo.label },
    font_genre: { key: fontKey, label: fontInfo.label },
    author_font_genre: { key: authorFontKey, label: authorFontInfo.label },
    supporting_font_genre: { key: supportingFontKey, label: supportingFontInfo.label },
    title_text_effect: { key: effectKey, label: effectInfo.label },
    badge_style: { key: badgeKey, label: badgeInfo.label },
    mood_preset: { key: moodKey, label: moodInfo.label },
    footer_text: clean(input.footerText, 180) || "Untuk Kalangan Sendiri, YAYASAN BMCI",
    hero_note: clean(input.heroNote, 220),
    custom_instruction: clean(input.customInstruction, 1800)
  };

  const printSpec = buildPrintSpec(pages);
  const layoutLock = buildLayoutLock(printSpec);
  const age = inferAge(book.level, book.class);
  const isObjectFocus = heroKey === "object_focus";

  const synopsisSource = book.tableOfContents.length
    ? book.tableOfContents.join("; ")
    : "Gunakan hanya informasi buku yang tersedia. Jangan mengarang materi baru.";

  const colorDirection = colorMode === "manual"
    ? `Gunakan primary ${visualControls.primary_color} dan secondary/accent ${visualControls.secondary_color}; warna turunan boleh harmonis.`
    : "AI bebas memilih warna utama dan aksen yang sesuai materi dan nuansa; tidak terikat warna template default; tetap harmonis, kontras, dan layak cetak.";

  const heroRule = isObjectFocus
    ? "MODE OBJECT FOCUS KETAT: HERO WAJIB NON-MANUSIA. Jangan tampilkan siswa, siswi, guru, pasangan laki-laki-perempuan, tangan manusia, siluet manusia, kerumunan, atau figur manusia apa pun, baik sebagai hero maupun elemen pendukung. Fokus murni pada objek, alat, artefak, aktivitas tanpa manusia, atau lingkungan materi. Jika konsep biasanya memakai siswa, ganti dengan objek yang mewakili aktivitas tersebut. Instruksi non-manusia ini mengalahkan kebiasaan generator cover sekolah yang cenderung otomatis menambahkan siswa."
    : "ATURAN MORAL PONDOK: bila ada siswa, siswa laki-laki wajib memakai songkok nasional hitam; siswi wajib berhijab rapi; pakaian sopan. Laki-laki dan perempuan tidak boleh bersentuhan, bergandengan, merangkul, duduk berdampingan dekat, menggunakan satu meja yang sama, atau berbagi satu buku/objek. Jika dua tokoh berbeda gender tampil, tempatkan kanan-kiri terpisah dengan jarak visual yang jelas.";

  const exactText = [
    `Judul: ${book.title}`,
    book.subtitle ? `Subjudul: ${book.subtitle}` : "Subjudul: tidak ada",
    `Penulis: ${book.author}`,
    book.authorSubtext ? `Teks bawah penulis: ${book.authorSubtext}` : "Teks bawah penulis: kosong",
    `Kelas/Jenjang: ${book.level} ${book.class}`.trim(),
    `Teks bawah kelas: ${visualControls.footer_text}`
  ].join(" | ");

  const masterPrompt = `
EXECUTION MODE LOCK — IMAGE GENERATION ONLY
GENERATE ONE IMAGE NOW. Hasil akhir WAJIB satu gambar raster full-wrap cover buku. Jangan membuat presentation, slides, PowerPoint, document, PDF, webpage, wireframe, design brief, report, atau jawaban teks sebagai output utama.

SPESIFIKASI CETAK
- Full wrap: COVER BELAKANG di kiri → PUNGGUNG di tengah → COVER DEPAN di kanan.
- Trim tiap cover: 210 × 297 mm.
- Bleed: 5 mm atas/bawah seluruh spread, 5 mm sisi luar kiri cover belakang, 5 mm sisi luar kanan cover depan, tanpa bleed horizontal tambahan pada punggung.
- Punggung: ${printSpec.spine.widthMm} mm dari ${pages} × 0,0472 mm.
- Kanvas final: ${printSpec.canvas.widthMm} × ${printSpec.canvas.heightMm} mm.
- Semua teks, logo, wajah, tangan, dan elemen penting minimal 15 mm dari garis trim. Background boleh sampai bleed.
- Jangan tampilkan angka ukuran, koordinat, garis trim, bleed, safe-area, ruler, bounding box, atau label panel pada artwork final.

LAYOUT LOCK COVER DEPAN
1. Logo referensi: kanan atas, x=130–195 mm, y=15–58 mm. Gunakan hanya logo yang diunggah pada chat; pertahankan rasio; jangan membuat logo palsu.
2. Judul: tengah/tengah-atas, x=28–182 mm, y=62–124 mm. Tulis persis “${book.title}”. ${book.subtitle ? `Subjudul persis “${book.subtitle}” tepat di bawah judul.` : "Tidak ada subjudul; jangan membuat subjudul/tagline baru."}
3. Hero: x=24–186 mm, y=120–246 mm. Preset: ${heroInfo.label}. ${heroInfo.direction} ${heroRule} ${isObjectFocus ? "" : `Jika siswa tampil, usia visual sekitar ${age}, sesuai ${book.level} ${book.class}.`} ${visualControls.hero_note ? `Catatan hero: ${visualControls.hero_note}.` : ""}
4. Penulis: kiri bawah, x=15–108 mm, y=256–281 mm. Tulis persis “${book.author}”.
5. ${book.authorSubtext ? `Teks kecil di bawah penulis: “${book.authorSubtext}”.` : "Jangan membuat teks bawah penulis bila input kosong."}
6. Badge kelas: kanan bawah, x=125–195 mm, y=246–282 mm. Style: ${badgeInfo.label}. ${badgeInfo.direction} Fokus utama “${book.class}”, sertakan “${book.level}”.
7. Teks bawah kelas: “${visualControls.footer_text}”, kecil dan tidak mengalahkan badge.

ARAH VISUAL
- ${colorDirection}
- Style: ${styleInfo.label}. ${styleInfo.direction}
- Genre font judul: ${fontInfo.label}; ${fontInfo.direction}
- Font penulis: ${authorFontInfo.label}; ${authorFontInfo.direction}
- Font teks pendukung: ${supportingFontInfo.label}; ${supportingFontInfo.direction}
- Text effect judul: ${effectInfo.direction}
- Nuansa: ${moodInfo.direction}
- Visual editorial pendidikan premium, semi-realistic 3D / painterly CGI halus, natural, rapi, modern, tidak plastiky. Bukan anime, chibi, poster game, poster film, atau foto hiperrealistik.
- Sisakan negative space pada area judul dan footer; jangan taruh detail ramai di belakang teks utama.

MATERI & HERO
Mata pelajaran: ${book.subject}.
Daftar isi sumber: ${synopsisSource}
Pilih 3–5 motif visual yang paling relevan. Jangan jadikan cover kolase ikon. ${isObjectFocus ? "Karena object_focus aktif, motif visual WAJIB diwujudkan tanpa figur manusia." : "Jika manusia tampil, patuhi aturan moral pondok di atas."}

COVER BELAKANG
- Menyatu dengan cover depan tetapi lebih tenang.
- Jangan tampilkan heading atau kata “Sinopsis”.
- Buat isi sinopsis 80–120 kata berdasarkan HANYA judul, subjudul, kelas, mata pelajaran, dan daftar isi.
- Jangan menambah materi, slogan, kutipan, ayat, capaian, ISBN, barcode, QR, alamat, website, nomor telepon, akreditasi, harga, atau legal notice yang tidak diberikan.

PUNGGUNG
- Polos/sangat sederhana, mengikuti warna tema.
- Tanpa teks, logo, foto, ilustrasi rumit, atau ornamen padat.

TEKS YANG HARUS DIPERTAHANKAN
${exactText}
Jangan menambahkan motto, tagline, ayat, kutipan, label kurikulum, badge lain, atau nama organisasi lain kecuali memang diberikan. Jika teks tidak dapat dirender sempurna, pertahankan ruang dan hierarki untuk finishing Photoshop.

INSTRUKSI CUSTOM
${visualControls.custom_instruction || "Tidak ada instruksi custom tambahan."}
Instruksi custom boleh mengubah treatment visual, tetapi tidak boleh membatalkan layout lock, safe margin, object-focus strict mode, atau aturan moral pondok.

QUALITY CONTROL
Pastikan satu gambar full-wrap; depan di kanan; belakang di kiri; punggung sesuai; logo kanan atas; judul tengah; penulis kiri bawah; badge kelas kanan bawah; semua elemen penting aman 15 mm; hero patuh preset; ${isObjectFocus ? "TIDAK ADA FIGUR MANUSIA SAMA SEKALI." : "jika ada siswa laki-laki ia bersongkok nasional, jika ada siswi ia berhijab, dan siswa-siswi tidak bersentuhan atau duduk berdampingan dekat."} Ilustrasi relevan, bersih, profesional, dan konsisten sebagai seri buku sekolah.
`.trim();

  const negatives = [
    "presentation","presentation deck","slide","slides","PowerPoint","slideshow","document","PDF artifact","webpage","wireframe as final output","design brief instead of image","text-only response",
    "AI slop","layout acak","cover depan di kiri","punggung salah ukuran","judul tidak di tengah","penulis bukan di kiri bawah","kelas bukan di kanan bawah","logo bukan di kanan atas",
    "teks terlalu dekat trim","teks masuk bleed","technical annotations","trim marks","bleed marks","safe area lines","ruler","coordinates","bounding boxes","panel labels",
    "kata Sinopsis di cover belakang","logo palsu","logo terdistorsi","logo digambar ulang","typo","gibberish text","tagline buatan","slogan buatan","kutipan atau ayat yang tidak diminta",
    "QR code palsu","barcode palsu","ISBN palsu","placeholder putih ISBN","watermark","ikon mengambang berlebihan","kolase simbol","ornamen terlalu ramai","glow berlebihan","plastik 3D murah","stock-photo look","anime","chibi","poster game","poster film","hyperrealistic photo",
    "siswa laki-laki tanpa songkok nasional","siswi tanpa hijab","siswa dan siswi saling bersentuhan","bergandengan tangan","saling merangkul","siswa dan siswi duduk berdampingan dekat","siswa dan siswi menggunakan satu meja yang sama","siswa dan siswi berbagi satu buku yang sama","close male-female proximity","mixed-gender close pairing",
    "pakaian tidak sopan atau ketat","anatomi rusak","wajah duplikat","tangan cacat","anggota tubuh ganda","pose tidak alami","background sibuk di belakang judul","kontras teks rendah","ilustrasi tidak terkait materi","materi yang tidak ada di daftar isi","teks pada punggung","logo pada punggung"
  ];

  if (isObjectFocus) negatives.push(
    "human figure","human figures","person","people","student","students","schoolboy","schoolgirl","male student","female student","teacher","human hands","human silhouette","crowd","people in hero area","two students together","student duo","paired students","co-ed hero composition","mixed-gender hero composition","male and female students side by side","boy and girl sitting together","boy and girl reading together","shared desk between male and female students","shared book between male and female students"
  );

  return {
    execution_lock: {
      task: "GENERATE_IMAGE",
      output_type: "SINGLE_RASTER_IMAGE",
      artifact_type: "BOOK_COVER_FULL_WRAP",
      required_action: "GENERATE_THE_IMAGE_NOW",
      final_response: "Render one full-wrap book-cover image only; no presentation, slides, document, webpage, PDF, wireframe, design brief, or text-only deliverable.",
      forbidden_alternative_artifacts: ["presentation","slides","PowerPoint","slideshow","document","PDF","webpage","wireframe","design brief","report"]
    },
    template_id: TEMPLATE_ID,
    generator_version: GENERATOR_VERSION,
    book,
    visual_controls: visualControls,
    print_spec: printSpec,
    layout_lock: layoutLock,
    master_prompt: masterPrompt,
    negative_prompt: negatives.join(", ")
  };
}

module.exports = { TEMPLATE_ID, buildCoverSpec, inferAge };
