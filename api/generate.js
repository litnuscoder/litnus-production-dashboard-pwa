const { buildCoverSpec } = require("../lib/prompt-engine");

function send(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.status(status).json(payload);
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function validate(body) {
  const required = [
    ["subject", "Mata pelajaran"],
    ["title", "Judul buku"],
    ["author", "Nama penulis"],
    ["className", "Kelas"],
    ["level", "Jenjang"],
    ["toc", "Daftar isi"]
  ];
  const errors = [];
  for (const [key, label] of required) {
    if (!String(body[key] ?? "").trim()) errors.push(`${label} wajib diisi.`);
  }
  const pages = Number(body.pages);
  if (!Number.isInteger(pages) || pages < 1 || pages > 3000) {
    errors.push("Jumlah halaman harus berupa bilangan bulat 1–3000.");
  }
  if (String(body.toc ?? "").length > 12000) errors.push("Daftar isi terlalu panjang (maksimal 12.000 karakter).");
  if (String(body.customInstruction ?? "").length > 1800) errors.push("Instruksi custom terlalu panjang (maksimal 1.800 karakter).");
  return errors;
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { ok: false, error: "Gunakan metode POST." });
  }

  const body = readBody(req);
  const errors = validate(body);
  if (errors.length) return send(res, 400, { ok: false, errors });

  try {
    const data = buildCoverSpec(body);
    return send(res, 200, { ok: true, data });
  } catch {
    return send(res, 500, { ok: false, error: "Gagal membuat JSON prompt. Silakan periksa input dan coba lagi." });
  }
};
