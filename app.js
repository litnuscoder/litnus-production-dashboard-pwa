(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("coverForm");
  const pages = $("pages");
  const toc = $("toc");
  const errorBox = $("formError");
  const jsonOutput = $("jsonOutput");
  const emptyOutput = $("emptyOutput");
  const copyBtn = $("copyBtn");
  const downloadBtn = $("downloadBtn");
  const chatgptBtn = $("chatgptBtn");
  const geminiBtn = $("geminiBtn");
  const generateBtn = $("generateBtn");
  const helpDialog = $("helpDialog");
  let currentJson = "";

  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

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
    errorBox.innerHTML = errors.map((e) => `• ${escapeHtml(e)}`).join("<br>");
  }

  function clearErrors() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
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
      school: fd.get("school"),
      foundation: fd.get("foundation"),
      toc: fd.get("toc"),
    };
  }

  function setOutputButtons(enabled) {
    copyBtn.disabled = !enabled;
    downloadBtn.disabled = !enabled;
    chatgptBtn.disabled = !enabled;
    geminiBtn.disabled = !enabled;
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
        body: JSON.stringify(payload()),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(JSON.stringify(result.errors || [result.error || "Gagal membuat prompt."]));
      }

      currentJson = JSON.stringify(result.data, null, 2);
      jsonOutput.textContent = currentJson;
      jsonOutput.hidden = false;
      emptyOutput.hidden = true;
      setOutputButtons(true);
      $("outputPanel").scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("JSON prompt berhasil dibuat.");
    } catch (err) {
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

  async function copyJson(silent = false) {
    if (!currentJson) return false;
    try {
      await navigator.clipboard.writeText(currentJson);
      if (!silent) showToast("JSON disalin ke clipboard.");
      return true;
    } catch {
      const range = document.createRange();
      range.selectNodeContents(jsonOutput);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      if (!silent) showToast("Tekan Ctrl+C untuk menyalin JSON yang sudah dipilih.");
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

  async function copyAndOpen(url, label) {
    if (!currentJson) return;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    const copied = await copyJson(true);
    if (copied) {
      showToast(`JSON disalin. ${label} dibuka — unggah logo lalu tempel JSON.`);
    } else {
      showToast(`${label} dibuka. Salin JSON manual lalu unggah logo di chat.`);
    }
    if (!opened) showToast(`Popup diblokir. Izinkan popup lalu buka ${label} lagi.`);
  }

  function fillSample() {
    $("subject").value = "Ekonomi";
    $("title").value = "Modul Pembelajaran Ekonomi";
    $("subtitle").value = "";
    $("author").value = "Muhammad Ulinnuha";
    pages.value = "52";
    $("level").value = "SMA/MA";
    $("className").value = "XII";
    $("school").value = "";
    $("foundation").value = "";
    toc.value = "BAB I Konsep Dasar Ilmu Ekonomi\n1. Sejarah perkembangan ilmu ekonomi\n2. Definisi dan ruang lingkup ekonomi\n3. Motif dan prinsip ekonomi\nBAB II Kebutuhan dan Kelangkaan\n1. Kebutuhan manusia\n2. Kelangkaan\n3. Biaya peluang\nBAB III Kegiatan Ekonomi\n1. Produksi\n2. Distribusi\n3. Konsumsi";
    updateSpec();
    updateCount();
    showToast("Contoh diisi. Silakan sesuaikan.");
  }

  pages.addEventListener("input", updateSpec);
  toc.addEventListener("input", updateCount);
  form.addEventListener("submit", generate);
  copyBtn.addEventListener("click", () => copyJson(false));
  downloadBtn.addEventListener("click", downloadJson);
  chatgptBtn.addEventListener("click", () => copyAndOpen("https://chatgpt.com/", "ChatGPT"));
  geminiBtn.addEventListener("click", () => copyAndOpen("https://gemini.google.com/app", "Gemini"));
  $("sampleBtn").addEventListener("click", fillSample);
  $("helpBtn").addEventListener("click", () => helpDialog.showModal());

  setOutputButtons(false);
  updateSpec();
  updateCount();
})();
