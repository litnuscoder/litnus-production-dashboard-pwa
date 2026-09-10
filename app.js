(() => {
  const $ = (id) => document.getElementById(id);
  const form = $('coverForm');
  const pages = $('pages');
  const toc = $('toc');
  const customInstruction = $('customInstruction');
  const errorBox = $('formError');
  const jsonOutput = $('jsonOutput');
  const emptyOutput = $('emptyOutput');
  const copyBtn = $('copyBtn');
  const downloadBtn = $('downloadBtn');
  const chatgptBtn = $('chatgptBtn');
  const geminiBtn = $('geminiBtn');
  const generateBtn = $('generateBtn');
  let currentJson = '';

  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const validHex = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);

  function updateSpec() {
    const p = Number(pages.value);
    if (Number.isFinite(p) && p > 0) {
      const spine = round2(p * 0.0472);
      const width = round2(430 + spine);
      $('spineSize').textContent = `${spine.toFixed(2)} mm`;
      $('canvasSize').textContent = `${width.toFixed(2)} × 307 mm`;
      $('pagesFormula').textContent = `${p} halaman`;
      $('formulaResult').textContent = `${spine.toFixed(2)} mm`;
      document.documentElement.style.setProperty('--spine', `${Math.max(10, Math.min(44, 9 + spine * 1.7))}px`);
    } else {
      $('spineSize').textContent = '— mm';
      $('canvasSize').textContent = '— × 307 mm';
      $('pagesFormula').textContent = 'halaman';
      $('formulaResult').textContent = '—';
      document.documentElement.style.setProperty('--spine', '18px');
    }
  }

  function syncColor(colorId, hexId) {
    const color = $(colorId), hex = $(hexId);
    color.addEventListener('input', () => { hex.value = color.value.toUpperCase(); updatePreviewColors(); });
    hex.addEventListener('input', () => { if (validHex(hex.value)) { color.value = hex.value; updatePreviewColors(); } });
  }

  function updatePreviewColors() {
    const primary = validHex($('primaryHex').value) ? $('primaryHex').value : '#0F5132';
    const secondary = validHex($('secondaryHex').value) ? $('secondaryHex').value : '#D4AF37';
    document.documentElement.style.setProperty('--preview-primary', primary);
    document.documentElement.style.setProperty('--preview-secondary', secondary);
  }

  function updateCounters() {
    $('tocCount').textContent = toc.value.length.toLocaleString('id-ID');
    $('customCount').textContent = customInstruction.value.length.toLocaleString('id-ID');
  }

  function updateClassPreview() {
    $('classPreview').textContent = ($('className').value || 'X').toUpperCase();
    $('levelPreview').textContent = $('level').value || 'SMA/MA';
  }

  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }

  function showErrors(errors) {
    errorBox.hidden = false;
    errorBox.innerHTML = errors.map(e => `• ${String(e).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}`).join('<br>');
  }
  function clearErrors() { errorBox.hidden = true; errorBox.textContent = ''; }

  function payload() {
    const fd = new FormData(form);
    return {
      subject: fd.get('subject'), title: fd.get('title'), subtitle: fd.get('subtitle'), author: fd.get('author'),
      pages: Number(fd.get('pages')), level: fd.get('level'), className: fd.get('className'), toc: fd.get('toc'),
      primaryColor: $('primaryHex').value, secondaryColor: $('secondaryHex').value,
      stylePreset: fd.get('stylePreset'), footerText: fd.get('footerText'), customInstruction: fd.get('customInstruction')
    };
  }

  async function generateFromForm(scroll = true) {
    clearErrors();
    if (!form.reportValidity()) return false;
    generateBtn.disabled = true; generateBtn.firstElementChild.textContent = 'Menyusun prompt…';
    try {
      const response = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, cache:'no-store', body:JSON.stringify(payload()) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(JSON.stringify(result.errors || [result.error || 'Gagal membuat prompt.']));
      currentJson = JSON.stringify(result.data, null, 2);
      jsonOutput.textContent = currentJson; jsonOutput.hidden = false; emptyOutput.hidden = true;
      [copyBtn, downloadBtn, chatgptBtn, geminiBtn].forEach(btn => btn.disabled = false);
      if (scroll) $('outputPanel').scrollIntoView({ behavior:'smooth', block:'start' });
      showToast('JSON prompt berhasil dibuat.');
      return true;
    } catch (err) {
      let errors = ['Gagal membuat JSON prompt. Coba lagi.'];
      try { const parsed = JSON.parse(err.message); if (Array.isArray(parsed)) errors = parsed; } catch {}
      showErrors(errors); return false;
    } finally {
      generateBtn.disabled = false; generateBtn.firstElementChild.textContent = 'Generate JSON Prompt';
    }
  }

  form.addEventListener('submit', async (e) => { e.preventDefault(); await generateFromForm(true); });

  async function copyJson(silent = false) {
    if (!currentJson) return false;
    try { await navigator.clipboard.writeText(currentJson); if (!silent) showToast('JSON disalin ke clipboard.'); return true; }
    catch { if (!silent) showToast('Clipboard dibatasi browser. Salin manual dari output.'); return false; }
  }

  async function openAI(url, label) {
    if (!currentJson) {
      const ok = await generateFromForm(false);
      if (!ok) return;
    }
    const copied = await copyJson(true);
    showToast(copied ? `JSON disalin. Membuka ${label}…` : `Membuka ${label}. Salin JSON manual bila perlu.`);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function downloadJson() {
    if (!currentJson) return;
    const slug = ($('title').value || 'cover').toLowerCase().replace(/[^a-z0-9]+/gi,'-').replace(/(^-|-$)/g,'');
    const blob = new Blob([currentJson], { type:'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `prompt-cover-${slug}.json`; a.click(); URL.revokeObjectURL(url);
  }

  function fillSample() {
    $('subject').value = 'Sejarah Kebudayaan Islam'; $('title').value = 'Sejarah Kebudayaan Islam'; $('subtitle').value = '';
    $('author').value = 'Ahmad Hafidzulfikri Nizar, S.Pd.'; pages.value = '52'; $('level').value = 'SMA/MA'; $('className').value = 'X';
    $('primaryColor').value = '#0F5132'; $('primaryHex').value = '#0F5132'; $('secondaryColor').value = '#D4AF37'; $('secondaryHex').value = '#D4AF37';
    $('stylePreset').value = 'modern_islamic'; $('footerText').value = 'Untuk Kalangan Sendiri, YAYASAN BMCI';
    customInstruction.value = 'Badge kelas bergaya medallion geometris Islami premium. Hindari terlalu banyak badge tambahan atau teks promosi.';
    toc.value = 'BAB I Arab Sebelum Islam\nBAB II Masa Nabi Muhammad saw.\nBAB III Khulafaur Rasyidin\nBAB IV Perkembangan Peradaban Islam\nBAB V Dinasti dan Kebudayaan Islam';
    updateSpec(); updateCounters(); updateClassPreview(); updatePreviewColors(); showToast('Contoh diisi. Silakan sesuaikan.');
  }

  syncColor('primaryColor','primaryHex'); syncColor('secondaryColor','secondaryHex');
  pages.addEventListener('input', updateSpec); toc.addEventListener('input', updateCounters); customInstruction.addEventListener('input', updateCounters);
  $('className').addEventListener('input', updateClassPreview); $('level').addEventListener('change', updateClassPreview);
  copyBtn.addEventListener('click', () => copyJson(false)); downloadBtn.addEventListener('click', downloadJson);
  chatgptBtn.addEventListener('click', () => openAI('https://chatgpt.com/', 'ChatGPT'));
  geminiBtn.addEventListener('click', () => openAI('https://gemini.google.com/', 'Gemini'));
  $('sampleBtn').addEventListener('click', fillSample); $('helpBtn').addEventListener('click', () => $('helpDialog').showModal());
  updateSpec(); updateCounters(); updateClassPreview(); updatePreviewColors();
})();
