# Litnus Production Dashboard — PWA Stage 1

## Status
- Vercel frontend: PWA pilot, read-only.
- `/api/health`: selalu aktif.
- `/api/read`: hanya `status`, `config`, `dashboard`.
- Tidak ada endpoint rebuild, stop, kick, atau write.
- Jika `GAS_API_URL` / `GAS_API_TOKEN` belum diisi, UI masuk `SIMULATION`.

## Mengaktifkan Apps Script read-only
1. Gunakan `Code_V25.1.36_PWA_STAGE1_READONLY.gs` sebagai pengganti Code.gs, atau tambahkan `Dashboard_API_V1_READONLY.gs` dan patch `doGet`.
2. Di Apps Script > Project Settings > Script Properties, buat `PWA_API_TOKEN` dengan token acak panjang.
3. Deploy Apps Script Web App versi baru. URL `/exec` menjadi `GAS_API_URL`.
4. Di project Vercel preview, set `GAS_API_URL` dan `GAS_API_TOKEN` untuk Preview environment.
5. Redeploy Preview.

## Guard
PWA Stage 1 hanya membaca `getDashboardIndexStatusV24_1`, `getProductionDashboardConfig`, dan `getProductionDashboardDataFastV24_1`.


## Stage 2.0.2
- Diagnostic HTTP/upstream error details.
- Snapshot retry once for transient non-JSON/5xx.
- Keeps last-known-good UI on refresh failure.
- Snapshot timeout 45s.
