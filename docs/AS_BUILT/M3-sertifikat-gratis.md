# MODUL 3 — SERTIFIKAT GRATIS · AS BUILT

> Diisi dari apa yang **benar-benar dibangun** (kode + kolom Bukti `feature-registry.md`),
> bukan dari rencana PRD semata. Perubahan setelah Sprint 3 (LMS berbab F06.2, transaksi hub
> F06.17, harga dari Pengaturan 2026-09-13) dicatat apa adanya.

**Selesai (uji internal Sprint 3):** 2026-09-08 – 2026-09-09 · **Path/UI lanjutan:** 2026-09-10 – 2026-09-14 (F06.2, F06.3, F06.11, F06.17, F06.18) · **UAT Hexatara:** belum diisi · **Fitur:** F03.1 – F03.13 (F03.3 SKIP → F00.6) + jalur freemium F06 terkait

---

## Apa yang dilakukan modul ini

Pengunjung belajar materi keselamatan drone dan mengerjakan kuis tanpa wajib login, lalu daftar akun untuk mendapat pratinjau sertifikat (QR masih blur). Setelah transfer manual dan Admin menyetujui, sertifikat Free Track resmi terbit (berlaku tanpa masa habis) dan bisa dicek di halaman verifikasi. Admin mengatur materi/bab/soal, harga upgrade, rekening, dan antrean pembayaran.

## Alur pengguna

Seperti yang berjalan di sistem final (bukan hanya cerita PRD §8.3 “materi → kuis” datar):

```
1. Entry tipikal: hero pelatihan "Mulai Sekarang" → /materi/{id} (LMS berbab).
   Alternatif: /kuis standalone (masih hidup; tidak melewati gate bab).
2. LMS /materi/[id]: mode fokus (bukan shell dashboard); kunci progresif per bab;
   validasi baca sampai akhir; lampiran File; tab kuis terkunci sampai semua bab selesai.
3. Kuis correctable: salah → penjelasan per opsi; boleh ganti; tanpa status gagal.
4. "Dapatkan Sertifikat":
   - Anonim → /daftar (metadata kuis selesai).
   - Sudah login → langsung tandai selesai + dashboard (F06.3).
5. Verifikasi email (F00.6 + AuthShell F06.18) → dashboard.
6. Pratinjau di /dashboard/sertifikat (QR blur, tanpa baris certificates resmi).
7. Upgrade: hub /dashboard/transaksi (form paket + rekening + unggah bukti).
   /dashboard/upgrade hanya redirect ke transaksi (F06.17).
8. Admin setujui di /admin/upgrade → RPC aktivasi → certificates free_track + email + PDF.
9. /verify dan /verify/[token] menampilkan Berlaku tanpa masa berlaku.
```

**Berbeda dari Sprint 3 asli:** listing publik `/materi` sudah tidak ada (CTA langsung ke LMS); preview card lama diganti halaman Sertifikat; harga dari `site_settings` lewat `getHargaUpgrade()`, bukan konstanta saja.

## Yang bisa dilakukan Admin

| Tindakan | Halaman | Catatan |
|---|---|---|
| CRUD materi + bab + lampiran | `/admin/materi`, bab, file | F03.12 + F06.2b |
| CRUD / impor bank soal | `/admin/materi/soal` | F03.13 |
| Verifikasi / tolak pembayaran upgrade | `/admin/upgrade` | F03.7/8 Bukti 2026-09-09; PDF gagal non-fatal |
| Status pengiriman merchandise | `/admin/upgrade` | F03.11 |
| Harga upgrade + rekening | `/admin/pengaturan` | `harga_upgrade`, `rekening` (2026-09-13) |

## Tabel yang disentuh

| Tabel / storage | Baca | Tulis | Catatan |
|---|---|---|---|
| `materials`, `material_chapters`, `material_chapter_files` | Publik LMS, Admin | Admin | Pola singleton freemium |
| `material_progress` | LMS (login) | User / trigger daftar | Bukan histori kuis |
| `quiz_questions`, `quiz_options` | Publik | Admin | Correctable client-side |
| `profiles.free_track_selesai_at` | Dashboard, kuis | Trigger / action | Penanda selesai |
| `certificate_orders` | User + Admin | User + Admin | Status mesin upgrade |
| `certificates` | Verify, dashboard | Hanya aktivasi Admin | Preview = tanpa baris (ADR-005) |
| `activity_logs` | Dashboard | Admin post-approve | |
| `site_settings` (`harga_upgrade`, `rekening`) | Transaksi, pengaturan | Admin | |
| Bucket `certificates`, `payment-proofs` | Signed URL | PDF / bukti | Privat |

## Berkas utama

| Berkas | Isi |
|---|---|
| `src/app/[locale]/(kelas)/materi/[id]/**` | LMS course-reader + embedded quiz |
| `src/app/[locale]/(public)/kuis/**` | Kuis standalone + QuizEngine |
| `src/lib/materi.ts`, `session-progress.ts` | CTA hero + progress anon |
| `src/app/[locale]/(user)/dashboard/**` | Beranda, sertifikat, transaksi, kursus |
| `src/app/[locale]/(user)/actions.ts` | Pesanan + bukti; nominal dari `getHargaUpgrade()` |
| `src/lib/certificate/pdf.ts` | Preview + final |
| `src/app/admin/(protected)/upgrade/**` | Antrean verifikasi |
| `src/app/admin/(protected)/materi/**` | Materi / bab / soal |
| `src/lib/site-settings.ts` | Harga + rekening |
| `docs/sql/13_*.sql`, `14_aktivasi_sertifikat.sql`, `17_*.sql` | Trigger + RPC |

## Keputusan saat implementasi

1. **Preview tanpa baris `certificates`** (ADR-005) — F03.4 Bukti 2026-09-09.
2. **Aktivasi satu transaksi DB (RPC)**; PDF/email setelahnya; gagal PDF tidak batalkan aktivasi — F03.7/8.
3. **Kuis tanpa histori DB / passing score** — selesai = klaim klien + `free_track_selesai_at`.
4. **LMS berbab (F06.2)** sebagai jalur utama baca materi; `/kuis` tetap bypass gate bab.
5. **Harga DB-first** (`getHargaUpgrade`) — nominal insert dari server, bukan input klien; banner tidak boleh mengubah angka.
6. **F06.3:** user login tidak diminta daftar ulang di akhir kuis.
7. **F06.17:** Transaksi Saya = hub tunggal upgrade/bukti.
8. **F06.11:** hero pelatihan deep-link ke LMS.

## Yang sengaja TIDAK dibangun

- Payment gateway / aktivasi otomatis dari bank.
- Batas waktu kuis, skor kelulusan, batas percobaan, tabel histori kuis.
- LMS untuk batch RPC berbayar (delivery tetap WA Group + Zoom) — PRD §15.
- Sale banner mengubah harga upgrade.
- Menghubungkan `batch_registrations` ke `certificate_orders` (panel Admin terpisah).

## Diketahui belum sempurna

| Hal | Dampak | Rencana |
|---|---|---|
| UAT Hexatara Modul 3 kosong | Belum tanda tangan klien | Isi saat UAT |
| Scan QR fisik di HP | Belum penuh saat `NEXT_PUBLIC_SITE_URL` localhost (F03.9) | Setelah domain produksi |
| `/kuis` tanpa wajib bab LMS | Dua jalur selesai kuis | Keputusan produk; dokumentasikan |
| Path registry F03.1/preview card | Menunjuk file lama yang sudah diganti | Path as-built di atas yang berlaku |
| Warning console di `/dashboard` | Bukan bug Modul 3 | `00-KNOWN-WARNINGS.md` |

## Untuk manual book Hexatara

- Isi materi, bab, lampiran, dan soal di Admin Materi; soal aktif muncul di kuis.
- Harga upgrade dan rekening transfer diatur di Admin → Pengaturan.
- Peserta: Mulai Sekarang di pelatihan → baca semua bab → kuis → daftar → dashboard → Transaksi Saya → unggah bukti.
- Admin Upgrade: setujui/tolak; setujui menerbitkan sertifikat resmi + email; atur pengiriman untuk paket yang ada merchandise.
- Pratinjau sertifikat belum resmi sampai upgrade disetujui; cek publik hanya setelah itu.
