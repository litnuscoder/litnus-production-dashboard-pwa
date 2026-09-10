const STYLE_PRESETS = Object.freeze({
  premium_school: {
    label: "Premium School",
    direction: "premium educational editorial, rapi, mewah secukupnya, cocok untuk buku sekolah Islam, layout bersih dan hierarkis"
  },
  modern_islamic: {
    label: "Modern Islamic",
    direction: "ornamen geometris islami modern, elegan, simetris, hangat, tidak berlebihan"
  },
  academic_clean: {
    label: "Academic Clean",
    direction: "akademik bersih, profesional, ringan, fokus keterbacaan, elemen dekoratif minimal"
  },
  cinematic_education: {
    label: "Cinematic Educational",
    direction: "pencahayaan lebih dramatis namun tetap realistis, komposisi hero kuat, nuansa premium"
  },
  soft_illustrated: {
    label: "Soft Illustrated",
    direction: "ilustrasi lembut, ramah, halus, tetap dewasa dan bukan kartun anak kecil"
  }
});

const FONT_GENRES = Object.freeze({
  tegas_sans: {
    label: "Tegas — Sans Serif",
    family: "bold sans serif",
    purpose: "cocok untuk matematika, ekonomi, informatika, IPA, dan buku yang membutuhkan kesan kuat serta lugas",
    direction: "gunakan tipografi judul sans serif tebal, tegas, bersih, modern, stabil, dan sangat mudah dibaca; proporsi huruf kokoh dan tidak dekoratif berlebihan"
  },
  elegan_serif: {
    label: "Elegan — Serif",
    family: "elegant serif",
    purpose: "cocok untuk bahasa, sastra, sejarah, SKI, dan buku yang ingin terasa anggun serta berkelas",
    direction: "gunakan tipografi judul serif elegan, proporsional, anggun, premium, dan berwibawa; dekorasi halus boleh digunakan selama keterbacaan tetap tinggi"
  },
  klasik_akademik: {
    label: "Klasik Akademik — Slab/Serif",
    family: "academic serif or slab serif",
    purpose: "cocok untuk buku ajar formal, sejarah, ilmu sosial, dan seri akademik",
    direction: "gunakan tipografi klasik akademik berbasis serif atau slab serif, kokoh, formal, terstruktur, dan terasa mapan tanpa tampak kuno"
  },
  islami_arabic_latin: {
    label: "Islami — Arabic-Inspired Latin",
    family: "Arabic-inspired Latin display serif",
    purpose: "cocok untuk PAI, SKI, Bahasa Arab, madrasah, dan tema keislaman",
    direction: "gunakan huruf LATIN untuk judul dengan nuansa islami dan isyarat visual terinspirasi kaligrafi Arab; elegan, artistik, refined, dekoratif secukupnya, tetapi tetap jelas dibaca; jangan mengubah judul bahasa Indonesia menjadi aksara Arab"
  },
  modern_premium: {
    label: "Modern Premium — Sans/Modern Serif",
    family: "premium sans serif or modern serif",
    purpose: "cocok untuk seri buku sekolah modern lintas mata pelajaran",
    direction: "gunakan tipografi judul modern premium, polished, proporsional, sophisticated, bersih, dan profesional; pilih premium sans serif atau modern serif sesuai karakter judul"
  },
  friendly_rounded: {
    label: "Ramah — Rounded Sans",
    family: "rounded sans serif",
    purpose: "cocok untuk SD, SMP, modul pengantar, dan buku yang ingin terasa ramah",
    direction: "gunakan rounded sans serif yang ramah, ringan, hangat, mudah dibaca, dan tetap rapi; hindari bentuk kekanak-kanakan berlebihan"
  },
  formal_resmi: {
    label: "Formal Resmi — Formal Serif/Sans",
    family: "formal serif or formal sans serif",
    purpose: "cocok untuk modul resmi sekolah, buku yayasan, dan tampilan institusional",
    direction: "gunakan tipografi formal resmi yang disiplin, sangat rapi, profesional, berwibawa, dan minim dekorasi; pilih serif formal atau sans serif formal yang paling sesuai"
  }
});

const SUPPORTING_FONT_GENRES = Object.freeze({
  sans_clean: {
    label: "Sans Serif Bersih",
    family: "clean sans serif",
    direction: "gunakan sans serif bersih, netral, dan sangat terbaca untuk nama penulis serta teks pendukung"
  },
  serif_elegan: {
    label: "Serif Elegan",
    family: "elegant serif",
    direction: "gunakan serif elegan yang tetap ringan dan mudah dibaca untuk nama penulis atau teks pendukung"
  },
  slab_tegas: {
    label: "Slab Serif Tegas",
    family: "slab serif",
    direction: "gunakan slab serif tegas, kokoh, dan rapi untuk memberi aksen formal pada nama penulis atau teks pendukung"
  },
  humanist_sans: {
    label: "Humanist Sans",
    family: "humanist sans serif",
    direction: "gunakan humanist sans yang hangat, profesional, dan enak dibaca pada ukuran kecil"
  },
  islami_halus: {
    label: "Islami Halus",
    family: "soft Islamic-inspired Latin",
    direction: "gunakan tipografi latin bernuansa islami yang halus dan tetap terbaca untuk nama penulis atau teks pendukung; jangan berlebihan"
  }
});

const TITLE_EFFECTS = Object.freeze({
  clean_flat: { label: "Clean Flat", direction: "judul memakai tipografi bersih tanpa efek 3D, datar dan tegas" },
  soft_emboss: { label: "Soft Emboss", direction: "judul memakai efek emboss lembut dengan bayangan tipis, elegan dan tetap mudah dibaca" },
  gold_3d: { label: "3D Gold", direction: "judul memakai efek teks 3D premium bernuansa emas seperti emboss metal, mewah, tegas, dan tidak norak" },
  glass_3d: { label: "3D Glass", direction: "judul memakai efek teks 3D halus dengan kesan glass/acrylic premium, tetap akademik dan terbaca jelas" },
  bold_outline: { label: "Bold Outline", direction: "judul memakai outline tegas dan kedalaman ringan untuk memberi aksen kuat tanpa berlebihan" }
});

const MOOD_PRESETS = Object.freeze({
  none: { label: "Netral / otomatis", direction: "nuansa boleh ditentukan AI secara cerdas sesuai mata pelajaran, kelas, dan pilihan hero" },
  cinta_indonesia: { label: "Cinta Indonesia", direction: "tambahkan nuansa Cinta Indonesia secara halus dan elegan, misalnya aksen merah-putih kecil, rasa kebangsaan, atau simbol persatuan yang tidak mendominasi" },
  islami_prestasi: { label: "Islami & Prestasi", direction: "nuansa islami, berprestasi, berkarakter, dan membangun optimisme pelajar muslim" },
  akademik_elegan: { label: "Akademik Elegan", direction: "nuansa akademik elegan, tenang, cerdas, dan profesional" },
  hangat_asrama: { label: "Hangat Asrama", direction: "nuansa hangat, akrab, dan bersahaja seperti lingkungan sekolah atau asrama yang nyaman" },
  sejarah_kejayaan: { label: "Sejarah Kejayaan", direction: "nuansa sejarah kejayaan, kebesaran peradaban, arsitektur klasik, dan atmosfer inspiratif" }
});

const HERO_PRESETS = Object.freeze({
  students_duo: {
    label: "Siswa & Siswi Terpisah — Rekomendasi",
    direction: "gunakan dua hero santri sebagai duo utama: satu siswa laki-laki dan satu siswi perempuan. Siswa laki-laki wajib memakai songkok nasional hitam dan seragam rapi. Siswi wajib berhijab rapi dan berpakaian sopan. Keduanya ditempatkan kanan-kiri terpisah, tidak bersentuhan, tidak bergandengan, dan tidak saling merangkul. Gesture sopan dan natural.",
    supportsStudents: true
  },
  student_boy_only: {
    label: "Siswa Laki-Laki Saja",
    direction: "gunakan satu siswa laki-laki santri sebagai hero utama, memakai songkok nasional hitam dan seragam sekolah yang rapi, fokus pada aktivitas belajar atau objek materi yang relevan",
    supportsStudents: true
  },
  student_girl_only: {
    label: "Siswi Perempuan Saja",
    direction: "gunakan satu siswi santri sebagai hero utama, berhijab rapi, berpakaian sopan, fokus pada aktivitas belajar atau objek materi yang relevan",
    supportsStudents: true
  },
  students_plus_objects: {
    label: "Siswa + Objek Materi",
    direction: "gunakan 1–2 santri sebagai hero dan kombinasikan dengan objek atau scene materi yang paling relevan. Jika dua siswa dipakai, laki-laki bersongkok nasional, perempuan berhijab, keduanya terpisah kanan-kiri dan tidak bersentuhan",
    supportsStudents: true
  },
  object_focus: {
    label: "Objek / Aktivitas Materi Utama",
    direction: "HERO WAJIB NON-MANUSIA. Fokuskan hero pada objek, alat, artefak, aktivitas tanpa figur manusia, atau lingkungan pembelajaran yang paling relevan dengan isi materi. Jangan tampilkan siswa, siswi, guru, pasangan manusia, tangan manusia, siluet manusia, atau figur manusia sebagai hero maupun elemen pendukung. Gunakan objek materi sebagai fokus visual utama.",
    supportsStudents: false,
    forbidHumanFigures: true
  },
  historical_scene: {
    label: "Tokoh / Adegan Kontekstual Materi",
    direction: "fokuskan hero pada tokoh, adegan, atau scene kontekstual yang paling relevan dengan materi. Jika siswa juga hadir, aturan busana dan moral santri tetap berlaku",
    supportsStudents: true
  }
});

const BADGE_STYLES = Object.freeze({
  geometric_islamic: {
    label: "Geometris Islami — Rekomendasi",
    direction: "badge kelas berbentuk geometris islami premium, simetris, tegas, dan elegan; terinspirasi bintang atau medallion islami"
  },
  circle_medallion: {
    label: "Lingkaran Medallion",
    direction: "badge kelas berbentuk lingkaran medallion premium dengan ring tegas dan pusat informasi kelas yang jelas"
  },
  mosque_dome: {
    label: "Kubah Masjid",
    direction: "badge kelas berbentuk kubah masjid atau siluet arch islami yang stylish, premium, dan tetap mudah dibaca"
  },
  shield_academic: {
    label: "Perisai Akademik",
    direction: "badge kelas berbentuk perisai akademik yang kokoh, resmi, dan rapi"
  },
  star_eight: {
    label: "Bintang Delapan Sisi",
    direction: "badge kelas berbentuk bintang delapan sisi yang ornamental, islami, dan kuat sebagai focal accent"
  }
});

module.exports = { STYLE_PRESETS, FONT_GENRES, SUPPORTING_FONT_GENRES, TITLE_EFFECTS, MOOD_PRESETS, HERO_PRESETS, BADGE_STYLES };
