(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("coverForm");
  const pages = $("pages");
  const toc = $("toc");
  const logosInput = $("logos");
  const preview = $("logoPreview");
  const errorBox = $("formError");
  const jsonOutput = $("jsonOutput");
  const emptyOutput = $("emptyOutput");
  const copyBtn = $("copyBtn");
  const downloadBtn = $("downloadBtn");
  const generateBtn = $("generateBtn");
  const helpDialog = $("helpDialog");
  let logoFiles = [];
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

  function updateCount() { $("tocCount").textContent = toc.value.length.toLocaleString("id-ID"); }

  function renderLogos() {
    preview.innerHTML = "";
    logoFiles.forEach((file, index) => {
      const chip = document.createElement("div"); chip.className = "logo-chip";
      const img = document.createElement("img"); img.alt = ""; img.src = URL.createObjectURL(file);
      const name = document.createElement("span"); name.textContent = file.name;
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", `Hapus ${file.name}`);
      remove.addEventListener("click", (e) => { e.preventDefault(); URL.revokeObjectURL(img.src); logoFiles.splice(index, 1); renderLogos(); });
      chip.append(img, name, remove); preview.append(chip);
    });
  }

  function addFiles(files) {
    const accepted = [...files].filter(f => /image\/(png|jpeg|webp|svg\+xml)/.test(f.type));
    const next = [...logoFiles];
    for (const file of accepted) {
      if (next.length >= 4) break;
      if (!next.some(existing => existing.name === file.name && existing.size === file.size)) next.push(file);
    }
    logoFiles = next.slice(0, 4);
    renderLogos();
    if (files.length > accepted.length) showToast("Sebagian file bukan format gambar yang didukung.");
    if (files.length + logoFiles.length > 4) showToast("Maksimal 4 logo.");
  }

  function showToast(message) {
    const toast = $("toast"); toast.textContent = message; toast.classList.add("show");
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function showErrors(errors) {
    errorBox.hidden = false; errorBox.innerHTML = errors.map(e => `• ${escapeHtml(e)}`).join("<br>");
  }
  function clearErrors() { errorBox.hidden = true; errorBox.textContent = ""; }
  function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }

  function payload() {
    const fd = new FormData(form);
    return {
      subject: fd.get("subject"), title: fd.get("title"), subtitle: fd.get("subtitle"), author: fd.get("author"),
      pages: Number(fd.get("pages")), level: fd.get("level"), className: fd.get("className"), school: fd.get("school"),
      foundation: fd.get("foundation"), toc: fd.get("toc"),
      logos: logoFiles.map(file => ({ fileName: file.name, fileType: file.type }))
    };
  }

  async function generate(event) {
    event.preventDefault(); clearErrors();
    if (!form.reportValidity()) return;
    generateBtn.disabled = true; generateBtn.firstElementChild.textContent = "Menyusun prompt…";
    try {
      const response = await fetch("/api/generate", { method:"POST", headers:{"Content-Type":"application/json"}, cache:"no-store", body:JSON.stringify(payload()) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(JSON.stringify(result.errors || [result.error || "Gagal membuat prompt."]));
      currentJson = JSON.stringify(result.data, null, 2);
      jsonOutput.textContent = currentJson; jsonOutput.hidden = false; emptyOutput.hidden = true;
      copyBtn.disabled = false; downloadBtn.disabled = false;
      $("outputPanel").scrollIntoView({ behavior:"smooth", block:"start" });
      showToast("JSON prompt berhasil dibuat.");
    } catch (err) {
      let errors = ["Gagal membuat JSON prompt. Coba lagi."];
      try { const parsed = JSON.parse(err.message); if (Array.isArray(parsed)) errors = parsed; } catch {}
      showErrors(errors);
    } finally {
      generateBtn.disabled = false; generateBtn.firstElementChild.textContent = "Generate JSON Prompt";
    }
  }

  async function copyJson() {
    if (!currentJson) return;
    try { await navigator.clipboard.writeText(currentJson); showToast("JSON disalin ke clipboard."); }
    catch { const range = document.createRange(); range.selectNodeContents(jsonOutput); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range); showToast("Pilih Salin / Ctrl+C untuk menyalin."); }
  }

  function downloadJson() {
    if (!currentJson) return;
    const title = $("title").value.trim().toLowerCase().replace(/[^a-z0-9]+/gi,"-").replace(/(^-|-$)/g,"") || "cover";
    const blob = new Blob([currentJson], { type:"application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `prompt-cover-${title}.json`; a.click(); URL.revokeObjectURL(url);
  }

  function fillSample() {
    $("subject").value = "Ekonomi"; $("title").value = "Ekonomi"; $("subtitle").value = "Modul Pembelajaran";
    $("author").value = "Nama Penulis"; pages.value = "200"; $("level").value = "SMA/MA"; $("className").value = "X";
    $("school").value = "SMA Islam Contoh"; $("foundation").value = "Yayasan Pendidikan Contoh";
    toc.value = "BAB I Konsep Dasar Ilmu Ekonomi\n1. Kebutuhan dan Kelangkaan\n2. Motif dan Prinsip Ekonomi\nBAB II Kegiatan Ekonomi\n1. Produksi\n2. Distribusi\n3. Konsumsi\nBAB III Pasar dan Pembentukan Harga\nBAB IV Lembaga Jasa Keuangan";
    updateSpec(); updateCount(); showToast("Contoh diisi. Silakan sesuaikan.");
  }

  pages.addEventListener("input", updateSpec); toc.addEventListener("input", updateCount); form.addEventListener("submit", generate);
  $("chooseLogoBtn").addEventListener("click", (e) => { e.preventDefault(); logosInput.click(); });
  logosInput.addEventListener("change", () => { addFiles(logosInput.files); logosInput.value = ""; });
  $("uploadArea").addEventListener("dragover", e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--neon)"; });
  $("uploadArea").addEventListener("dragleave", e => { e.currentTarget.style.borderColor = ""; });
  $("uploadArea").addEventListener("drop", e => { e.preventDefault(); e.currentTarget.style.borderColor = ""; addFiles(e.dataTransfer.files); });
  copyBtn.addEventListener("click", copyJson); downloadBtn.addEventListener("click", downloadJson); $("sampleBtn").addEventListener("click", fillSample);
  $("helpBtn").addEventListener("click", () => helpDialog.showModal());
  updateSpec(); updateCount();
})();
