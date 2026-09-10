(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("coverForm");
  const pages = $("pages");
  const toc = $("toc");
  const customInstruction = $("customInstruction");
  const errorBox = $("formError");
  const jsonOutput = $("jsonOutput");
  const emptyOutput = $("emptyOutput");
  const copyBtn = $("copyBtn");
  const downloadBtn = $("downloadBtn");
  const generateBtn = $("generateBtn");
  const helpDialog = $("helpDialog");
  const primaryColor = $("primaryColor");
  const secondaryColor = $("secondaryColor");
  const primaryHex = $("primaryHex");
  const secondaryHex = $("secondaryHex");
  const className = $("className");
  const level = $("level");
  const heroPreset = $("heroPreset");
  const fontGenre = $("fontGenre");
  const badgeStyle = $("badgeStyle");
  const colorMode = $("colorMode");
  const colorFields = $("colorFields");
  const chatgptBtn = $("chatgptBtn");
  const geminiBtn = $("geminiBtn");
  let currentJson = "";

  const heroHelpMap = {
    students_duo: "Duo siswa-siswi santri, laki-laki bersongkok nasional, perempuan berhijab, posisi kanan-kiri terpisah, tidak bersentuhan.",
    student_boy_only: "Hero utama satu siswa laki-laki santri, bersongkok nasional, rapi, sopan, fokus pada materi pelajaran.",
    student_girl_only: "Hero utama satu siswi santri, berhijab rapi, sopan, fokus pada materi pelajaran.",
    students_plus_objects: "Siswa/siswi santri tetap hadir, lalu dipadukan dengan objek materi yang paling relevan secara natural.",
    object_focus: "Hero utama berupa objek, aktivitas, atau scene pembelajaran yang paling relevan dengan isi buku. Siswa boleh minim atau tidak muncul.",
    historical_scene: "Hero utama berupa tokoh, adegan, atau latar kontekstual materi. Jika siswa muncul, aturan busana santri tetap berlaku."
  };

  const fontHelpMap = {
    tegas_sans: "Tegas, modern, dan mudah dibaca. Cocok untuk mapel eksak, ekonomi, dan buku yang perlu tampak lugas.",
    elegan_serif: "Anggun dan berkelas. Cocok untuk bahasa, sastra, sejarah, dan buku bernuansa premium.",
    klasik_akademik: "Formal, mapan, dan terasa akademik. Cocok untuk seri buku sekolah yang serius.",
    islami_arabic_latin: "Huruf Latin bernuansa islami, terinspirasi kaligrafi Arab, tetapi tetap jelas terbaca.",
    modern_premium: "Modern, polished, dan profesional. Fleksibel untuk banyak mata pelajaran.",
    friendly_rounded: "Ramah dan ringan. Cocok untuk jenjang bawah atau buku yang ingin terasa bersahabat.",
    formal_resmi: "Resmi, disiplin, dan institusional. Cocok untuk modul yayasan atau buku pedoman."
  };

  const badgeHelpMap = {
    geometric_islamic: "Badge premium bergaya geometris islami agar kelas lebih menonjol dan tetap serasi dengan tema pondok pesantren.",
    circle_medallion: "Badge lingkaran medallion memberi kesan klasik, rapi, dan mudah dipadukan dengan banyak tema.",
    mosque_dome: "Badge kubah masjid cocok untuk buku bernuansa islami yang ingin terasa khas namun tetap elegan.",
    shield_academic: "Badge perisai akademik memberi kesan formal, kokoh, dan cocok untuk buku sekolah resmi.",
    star_eight: "Badge bintang delapan sisi terasa islami, ornamental, dan tetap kuat sebagai penanda kelas."
  };

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
  function sanitizeHex(value, fallback) {
    const v = String(value || "").trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(v) ? v : fallback;
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function showErrors(errors) {
    errorBox.hidden = false;
    errorBox.innerHTML = errors.map(e => `• ${escapeHtml(e)}`).join("<br>");
  }

  function clearErrors() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function syncColorInputs(source, mirror, fallback) {
    const value = sanitizeHex(source.value, fallback);
    source.value = value;
    mirror.value = value;
    if (source === primaryColor || source === primaryHex) document.documentElement.style.setProperty("--primary", value);
    if (source === secondaryColor || source === secondaryHex) document.documentElement.style.setProperty("--secondary", value);
  }

  function updateColorMode() {
    const manual = colorMode.value === "manual";
    colorFields.classList.toggle("disabled-group", !manual);
  }

  function updateSpec() {
    const p = Number(pages.value);
    if (Number.isFinite(p) && p > 0) {
      const spine = round2(p * 0.0472);
      const width = round2(430 + spine);
      $("spineSize").textContent = `${spine.toFixed(2)} mm`;
      $("canvasSize").textContent = `${width.toFixed(2)} × 307 mm`;
      $("pagesFormula").textContent = `${p} halaman`;
      $("formulaResult").textContent = `${spine.toFixed(2)} mm`;
      const visual = Math.max(10, Math.min(44, 9 + spine * 1.7));
      $("spinePreview").style.width = `${visual}px`;
      document.documentElement.style.setProperty("--spine", `${visual}px`);
    } else {
      $("spineSize").textContent = "— mm";
      $("canvasSize").textContent = "— × 307 mm";
      $("pagesFormula").textContent = "halaman";
      $("formulaResult").textContent = "—";
      document.documentElement.style.setProperty("--spine", "18px");
    }
  }

  function updateCount() {
    $("tocCount").textContent = toc.value.length.toLocaleString("id-ID");
    $("customCount").textContent = customInstruction.value.length.toLocaleString("id-ID");
  }

  function updatePreviewLabels() {
    $("classPreview").textContent = className.value.trim() || "X";
    $("levelPreview").textContent = level.value.trim() || "SMA/MA";
    $("heroPreview").textContent = heroPreset.options[heroPreset.selectedIndex]?.text?.split("—")[0].trim().toUpperCase() || "HERO";
  }

  function updateDynamicHelp() {
    $("heroHelp").textContent = heroHelpMap[heroPreset.value] || heroHelpMap.students_duo;
    $("fontGenreHelp").textContent = fontHelpMap[fontGenre.value] || fontHelpMap.tegas_sans;
    $("badgeHelp").textContent = badgeHelpMap[badgeStyle.value] || badgeHelpMap.geometric_islamic;
  }

  function payload() {
    const fd = new FormData(form);
    return {
      subject: fd.get("subject"),
      title: fd.get("title"),
      subtitle: fd.get("subtitle"),
      author: fd.get("author"),
      authorSubtext: fd.get("authorSubtext"),
      heroNote: fd.get("heroNote"),
      pages: Number(fd.get("pages")),
      level: fd.get("level"),
      className: fd.get("className"),
      toc: fd.get("toc"),
      colorMode: fd.get("colorMode"),
      primaryColor: sanitizeHex(fd.get("primaryColor"), "#0F5132"),
      secondaryColor: sanitizeHex(fd.get("secondaryColor"), "#D4AF37"),
      stylePreset: fd.get("stylePreset") || "premium_school",
      heroPreset: fd.get("heroPreset") || "students_duo",
      fontGenre: fd.get("fontGenre") || "tegas_sans",
      authorFontGenre: fd.get("authorFontGenre") || "sans_clean",
      supportingFontGenre: fd.get("supportingFontGenre") || "sans_clean",
      titleTextEffect: fd.get("titleTextEffect") || "clean_flat",
      badgeStyle: fd.get("badgeStyle") || "geometric_islamic",
      moodPreset: fd.get("moodPreset") || "none",
      footerText: fd.get("footerText"),
      customInstruction: fd.get("customInstruction")
    };
  }

  function syncOutputState(hasJson) {
    currentJson = hasJson ? currentJson : "";
    jsonOutput.hidden = !hasJson;
    emptyOutput.hidden = hasJson;
    copyBtn.disabled = !hasJson;
    downloadBtn.disabled = !hasJson;
    chatgptBtn.disabled = !hasJson;
    geminiBtn.disabled = !hasJson;
  }

  async function generate(event) {
    event.preventDefault();
    clearErrors();
    if (!form.reportValidity()) return;
    generateBtn.disabled = true;
    generateBtn.firstElementChild.textContent = "Menyusun prompt…";
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(payload())
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(JSON.stringify(result.errors || [result.error || "Gagal membuat prompt."]));
      currentJson = JSON.stringify(result.data, null, 2);
      jsonOutput.textContent = currentJson;
      syncOutputState(Boolean(currentJson));
      $("outputPanel").scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("Prompt JSON berhasil dibuat.");
    } catch (err) {
      syncOutputState(false);
      let errors = ["Gagal membuat JSON prompt. Coba lagi."];
      try {
        const parsed = JSON.parse(err.message);
        if (Array.isArray(parsed)) errors = parsed;
      } catch {}
      showErrors(errors);
    } finally {
      generateBtn.disabled = false;
      generateBtn.firstElementChild.textContent = "Generate JSON Prompt";
    }
  }

  async function copyJson() {
    if (!currentJson) return false;
    try {
      await navigator.clipboard.writeText(currentJson);
      showToast("Prompt JSON disalin ke clipboard.");
      return true;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(jsonOutput);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      showToast("Pilih Salin / Ctrl+C untuk menyalin prompt.");
      return false;
    }
  }

  function downloadJson() {
    if (!currentJson) return;
    const title = $("title").value.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") || "cover";
    const blob = new Blob([currentJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-cover-${title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function launchAi(url) {
    if (!currentJson) return;
    await copyJson();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function fillSample() {
    $("subject").value = "SKI";
    $("title").value = "Kejayaan Islam Abad ke 10";
    $("subtitle").value = "Abbasiyah, Ayyubiyah, Turki Utsmani";
    $("author").value = "Muhammad Ulinnuha";
    $("authorSubtext").value = "Guru Mata Pelajaran";
    $("heroNote").value = "dua siswa sedang membaca buku sejarah, latar arsitektur Islam klasik";
    pages.value = "52";
    level.value = "SMA/MA";
    className.value = "X";
    colorMode.value = "auto";
    primaryColor.value = primaryHex.value = "#75000C";
    secondaryColor.value = secondaryHex.value = "#D4AF37";
    $("stylePreset").value = "premium_school";
    $("heroPreset").value = "students_duo";
    $("fontGenre").value = "islami_arabic_latin";
    $("authorFontGenre").value = "sans_clean";
    $("supportingFontGenre").value = "sans_clean";
    $("titleTextEffect").value = "gold_3d";
    $("badgeStyle").value = "geometric_islamic";
    $("moodPreset").value = "sejarah_kejayaan";
    $("footerText").value = "Untuk Kalangan Sendiri, YAYASAN BMCI";
    customInstruction.value = "latar kerajaan islam dulu kala, kejayaan, kebijaksanaan, arsitektur elegan, komposisi tidak ramai.";
    toc.value = "abbasiyah, ayyubiyah, turki utsmani";
    syncColorInputs(primaryColor, primaryHex, "#0F5132");
    syncColorInputs(secondaryColor, secondaryHex, "#D4AF37");
    updateColorMode();
    updateSpec();
    updateCount();
    updateDynamicHelp();
    updatePreviewLabels();
    showToast("Contoh diisi. Silakan sesuaikan.");
  }

  pages.addEventListener("input", updateSpec);
  toc.addEventListener("input", updateCount);
  customInstruction.addEventListener("input", updateCount);
  className.addEventListener("input", updatePreviewLabels);
  level.addEventListener("change", updatePreviewLabels);
  heroPreset.addEventListener("change", () => { updateDynamicHelp(); updatePreviewLabels(); });
  fontGenre.addEventListener("change", updateDynamicHelp);
  badgeStyle.addEventListener("change", updateDynamicHelp);
  colorMode.addEventListener("change", updateColorMode);
  primaryColor.addEventListener("input", () => syncColorInputs(primaryColor, primaryHex, "#0F5132"));
  secondaryColor.addEventListener("input", () => syncColorInputs(secondaryColor, secondaryHex, "#D4AF37"));
  primaryHex.addEventListener("change", () => syncColorInputs(primaryHex, primaryColor, "#0F5132"));
  secondaryHex.addEventListener("change", () => syncColorInputs(secondaryHex, secondaryColor, "#D4AF37"));
  form.addEventListener("submit", generate);
  copyBtn.addEventListener("click", copyJson);
  downloadBtn.addEventListener("click", downloadJson);
  $("sampleBtn").addEventListener("click", fillSample);
  $("helpBtn").addEventListener("click", () => helpDialog.showModal());
  chatgptBtn.addEventListener("click", () => launchAi("https://chatgpt.com/"));
  geminiBtn.addEventListener("click", () => launchAi("https://gemini.google.com/app"));

  syncColorInputs(primaryColor, primaryHex, "#0F5132");
  syncColorInputs(secondaryColor, secondaryHex, "#D4AF37");
  updateColorMode();
  updateSpec();
  updateCount();
  updateDynamicHelp();
  updatePreviewLabels();
  syncOutputState(false);
})();
