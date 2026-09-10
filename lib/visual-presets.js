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

const TITLE_EFFECTS = Object.freeze({
  clean_flat: {
    label: "Clean Flat",
    direction: "judul memakai tipografi bersih tanpa efek 3D, datar dan tegas"
  },
  soft_emboss: {
    label: "Soft Emboss",
    direction: "judul memakai efek emboss lembut dengan bayangan tipis, elegan dan tetap mudah dibaca"
  },
  gold_3d: {
    label: "3D Gold",
    direction: "judul memakai efek teks 3D premium bernuansa emas seperti emboss metal, mewah, tegas, dan tidak norak"
  },
  glass_3d: {
    label: "3D Glass",
    direction: "judul memakai efek teks 3D halus dengan kesan glass/acrylic premium, tetap akademik dan terbaca jelas"
  },
  bold_outline: {
    label: "Bold Outline",
    direction: "judul memakai outline tegas dan kedalaman ringan untuk memberi aksen kuat tanpa berlebihan"
  }
});

const MOOD_PRESETS = Object.freeze({
  none: {
    label: "Netral / otomatis",
    direction: "nuansa boleh ditentukan AI secara cerdas sesuai mata pelajaran, kelas, dan warna pilihan"
  },
  cinta_indonesia: {
    label: "Cinta Indonesia",
    direction: "tambahkan nuansa Cinta Indonesia secara halus dan elegan, misalnya aksen merah-putih kecil, rasa kebangsaan, atau simbol persatuan yang tidak mendominasi"
  },
  islami_prestasi: {
    label: "Islami & Prestasi",
    direction: "nuansa islami, berprestasi, berkarakter, dan membangun optimisme pelajar muslim"
  },
  akademik_elegan: {
    label: "Akademik Elegan",
    direction: "nuansa akademik elegan, tenang, cerdas, dan profesional"
  },
  hangat_asrama: {
    label: "Hangat Asrama",
    direction: "nuansa hangat, akrab, dan bersahaja seperti lingkungan sekolah atau asrama yang nyaman"
  },
  sejarah_kejayaan: {
    label: "Sejarah Kejayaan",
    direction: "nuansa sejarah kejayaan, kebesaran peradaban, arsitektur klasik, dan atmosfer inspiratif"
  }
});

module.exports = { STYLE_PRESETS, TITLE_EFFECTS, MOOD_PRESETS };
