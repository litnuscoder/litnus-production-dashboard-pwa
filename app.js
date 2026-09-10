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
  const chatgptBtn = $("chatgptBtn");
  const geminiBtn = $("geminiBtn");
  let currentJson = "";

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
  }

  function payload() {
    const fd = new FormData(form);
    return {
      subject: fd.get("subject"),
      title: fd.get("title"),
      subtitle: fd.get("subtitle"),
      author: fd.get("author"),
      pages: Number(fd.get("pages")),
      level: fd.get("level"),
      className: fd.get("className"),
      toc: fd.get("toc"),
      primaryColor: sanitizeHex(fd.get("primaryColor"), "#0F5132"),
      secondaryColor: sanitizeHex(fd.get("secondaryColor"), "#D4AF37"),
      stylePreset: fd.get("stylePreset") || "premium_school",
      titleTextEffect: fd.get("titleTextEffect") || "clean_flat",
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
    pages.value = "52";
    level.value = "SMA/MA";
    className.value = "X";
    primaryColor.value = primaryHex.value = "#75000C";
    secondaryColor.value = secondaryHex.value = "#D435AA";
    $("stylePreset").value = "premium_school";
    $("titleTextEffect").value = "gold_3d";
    $("moodPreset").value = "cinta_indonesia";
    $("footerText").value = "Untuk Kalangan Sendiri, YAYASAN BMCI";
    customInstruction.value = "latar kerajaan Islam dulu kala, kejayaan, kebijaksanaan, arsitektur elegan.";
    toc.value = "abbasiyah, umayyah, turki utsmani";
    syncColorInputs(primaryColor, primaryHex, "#0F5132");
    syncColorInputs(secondaryColor, secondaryHex, "#D4AF37");
    updateSpec();
    updateCount();
    updatePreviewLabels();
    showToast("Contoh diisi. Silakan sesuaikan.");
  }

  pages.addEventListener("input", updateSpec);
  toc.addEventListener("input", updateCount);
  customInstruction.addEventListener("input", updateCount);
  className.addEventListener("input", updatePreviewLabels);
  level.addEventListener("change", updatePreviewLabels);
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
  updateSpec();
  updateCount();
  updatePreviewLabels();
  syncOutputState(false);
})();
