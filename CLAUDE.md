# HEXATARA

@PRD.md
@ENGINEERING.md
@feature-registry.md

Ketiga berkas di atas dimuat otomatis tiap sesi. Itu satu-satunya sumber kebenaran.
Jalankan `/context` sekali di awal untuk memastikan ketiganya benar-benar termuat.

## Urutan kewenangan

```
BRD-HXT-002 v1.1   → dokumen kesepakatan klien. Menang atas segalanya
  PRD.md           → PRODUK: fitur apa, perilakunya bagaimana, selesainya kapan
  ENGINEERING.md   → TEKNIS: skema, konvensi, pola kode
  PANDUAN.md       → KAPAN dan DENGAN CARA APA: langkah, prompt, uji, commit
```

Menemukan pertentangan? **Berhenti dan katakan.** Jangan pilih salah satu diam-diam.

## Urutan kerja wajib

1. `PRD.md` Bagian 0 — cara kerja dan kewenangan dokumen
2. `feature-registry.md` — fitur mana yang sedang dikerjakan, statusnya apa
3. `PRD.md` Bagian 6–11 — spesifikasi dan acceptance criteria fitur itu
4. `ENGINEERING.md` Bagian 10 — detail teknis fitur itu
5. **Paparkan rencana. Tunggu persetujuan.** Baru tulis kode
6. Selesai + **user konfirmasi sudah tes sendiri di browser** → update `feature-registry.md`

**Jangan pernah menandai DONE atas inisiatif sendiri.** Definition of Done ada di `PRD.md` Bagian 14 — butir kelimanya hanya bisa dipenuhi manusia.

## Lima larangan yang paling sering dilanggar

Daftar lengkap 25 butir ada di `PRD.md` Bagian 13 dan `ENGINEERING.md` Bagian 9. Baca sebelum mulai.

1. Jangan tambah tabel/kolom yang tidak ada di `PRD.md` Bagian 5
2. Jangan tulis atau jalankan SQL migrasi — user menjalankannya manual di Supabase
3. Jangan tambah validasi domain email, MX lookup, atau audit log di form penawaran (Fase 2)
4. Jangan tambah payment gateway, kode kupon, hitung mundur, atau ambang kelulusan kuis
5. Jangan pakai API khusus Vercel — sistem ini akan pindah ke VPS

Merasa salah satu larangan ini keliru? Katakan. Jangan melanggarnya diam-diam, dan jangan mematuhinya diam-diam kalau menurutmu ada masalah nyata.

## Pakai Context7

Saat menyentuh Next.js App Router, next-intl, Supabase SSR, pdf-lib, atau shadcn: tambahkan `use context7` di prompt. API-nya berubah cukup sering sampai ingatan model tidak bisa dipercaya.

## Dependency

Daftar paket yang terpasang, alasan tiap paket ada, dan daftar yang **sengaja tidak dipasang** ada di `PANDUAN.md` Fase 2.7 dan 2.8. Jangan menambah dependency tanpa izin eksplisit — larangan nomor 7.

## Perintah

```bash
pnpm dev
pnpm build         # jalankan sebelum push
pnpm tsc --noEmit
pnpm lint
pnpm knip          # cari kode mati yang tidak terpakai
pnpm test          # hanya 3 tempat kritis, lihat PANDUAN.md Lampiran B.4
```
