# Litnus PWA Stage 2.1 — Live Read-only Filter

Primary data path is now `action=live`, not persistent snapshot mirroring.

- arbitrary date filters work
- quick filters auto-apply
- reads ACTIVE index only
- version-aware 60s server cache
- auto refresh current filter when ACTIVE version changes
- snapshot/local cache is fallback only
- no rebuild / stop / write route

Backend required: Code.gs V25.1.41 SAFE_QUEUE PWA LIVE FILTER.
