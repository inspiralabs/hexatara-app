# MODUL 2 — VERIFIKASI SERTIFIKAT · AS BUILT

> Diisi dari apa yang **benar-benar dibangun** (kode + kolom Bukti `feature-registry.md`),
> bukan dari rencana PRD semata.

**Selesai (uji internal Sprint 2):** 2026-09-07 · **UAT Hexatara:** belum diisi di tabel UAT registry · **Fitur:** F02.1 – F02.9 (semua DONE)

---

## Apa yang dilakukan modul ini

Siapa pun bisa memeriksa keabsahan sertifikat Hexatara di situs tanpa login: ketik nomor atau buka tautan dari QR. Halaman hanya menampilkan lima informasi aman untuk publik (nama, nomor, tanggal terbit, masa berlaku, status), dengan perbedaan jelas antara masih berlaku, sudah kedaluwarsa, dan nomor tidak terdaftar. Admin mengelola data sertifikat satu per satu atau impor massal agar hasil cek selalu mengikuti database resmi.

## Alur pengguna

```
1. Pengunjung membuka /verify (EN: /en/verify).
2. Opsional: dari landing, CTA verifikasi mengarah ke /verify.
3. Form GET ?nomor=… (tanpa login). Jika rate limit aktif dan IP kena limit → pesan batasan; tanpa query DB.
4. Else: query view certificates_public by nomor (ilike) → hasil di halaman yang sama.
5. Alternatif QR: /verify/[token] → query by public_token → hasil langsung (tanpa form).
6. Empat keadaan UI:
   - tidak ada baris → "Tidak Ditemukan" (abu)
   - status invalid → Invalid (merah) — dari kolom status view, bukan hitung ulang di React
   - berlaku + tanggal_kedaluwarsa NULL → Berlaku + "Tanpa masa berlaku" (free_track)
   - berlaku + tanggal ada → Berlaku + tanggal masa berlaku
```

**Catatan Modul 3:** sertifikat dengan `qr_aktif = false` tidak terbaca anon (RLS) → tampil seperti “Tidak Ditemukan”. Setelah Admin setujui upgrade, baris aktif dan bisa diverifikasi.

## Yang bisa dilakukan Admin

| Tindakan | Halaman | Catatan |
|---|---|---|
| Daftar + status | `/admin/sertifikat` | Gabung `certificates` + status view |
| Tambah / ubah | `/admin/sertifikat/baru`, `/admin/sertifikat/[id]` | Nomor kosong → RPC `next_certificate_number` |
| Hapus (konfirmasi) | Row actions | Hard-delete ada di kode; kebijakan operasional Hexatara |
| Impor massal + laporan per baris | `/admin/sertifikat/impor` | Bukti F02.8: CSV 10 baris → 7 ok / 3 gagal dengan nomor baris Excel; UI unduh template XLSX (F06.16), parser terima CSV & Excel |

## Tabel yang disentuh

| Tabel / view | Baca | Tulis | Catatan |
|---|---|---|---|
| `certificates_public` | Publik `/verify`, Admin (status) | — | Kolom `status` dari fungsi DB; publik **tidak** query tabel `certificates` |
| `certificates` | Admin | Admin CRUD + impor | Anon hanya baris `qr_aktif = true` |
| `certificate_counters` | — | Via RPC penomoran | Prefiks per jenis |
| `status_sertifikat(date)` | Via view | — | NULL expiry → berlaku; tanpa cron harian |

## Berkas utama

| Berkas | Isi |
|---|---|
| `src/app/[locale]/(public)/verify/page.tsx` | Form GET, rate limit, query nomor |
| `src/app/[locale]/(public)/verify/[token]/page.tsx` | Hasil QR |
| `src/app/[locale]/(public)/verify/certificate-result.tsx` | UI 4 keadaan + 5 field |
| `src/lib/rate-limit/verify.ts` | Upstash + flag `RATE_LIMIT_VERIFY_ENABLED` (ADR-008) |
| `src/lib/certificate/import.ts` | Validasi impor (+2 tahun RPC bila kedaluwarsa kosong) |
| `src/app/admin/(protected)/sertifikat/**` | CRUD + impor |
| `src/lib/validations/sertifikat-admin.ts` | Zod; free_track tanpa kedaluwarsa |
| `messages/id.json`, `messages/en.json` | Namespace `verify` |
| `src/components/verify-cta-section.tsx` | CTA landing |

## Keputusan saat implementasi

1. **Status kedaluwarsa di Postgres**, bukan di React (F02.4 Bukti 2026-09-07).
2. **Publik hanya `certificates_public`** — lima kolom aman (F02.3).
3. **Penomoran otomatis via RPC**, bukan di TypeScript (F02.7).
4. **free_track: kedaluwarsa NULL wajib** (UI + Zod + impor) — F02.5 / F02.8.
5. **Impor: satu baris gagal tidak rollback yang lain** (F02.8).
6. **Rate limit opsional (ADR-008)** — default dokumentasi `RATE_LIMIT_VERIFY_ENABLED=false`; diuji ON 2026-09-07. Hanya jalur pencarian nomor; `/verify/[token]` tidak di-throttle.
7. **URL `/verify` dan `/verify/[token]` terkunci** (ADR-003) — ID tanpa prefix `/id`.

## Yang sengaja TIDAK dibangun

- Pencarian berdasarkan nama.
- Menampilkan email / telepon / alamat di halaman verifikasi.
- Cron untuk status kedaluwarsa (dihitung saat query).
- Fitur perpanjangan otomatis / pengingat (baris baru = nomor baru, manual Admin).
- Penerbitan PDF/QR (Modul 3).
- Rate limit wajib di produksi (keputusan env Abi).

## Diketahui belum sempurna

| Hal | Dampak | Rencana |
|---|---|---|
| UAT Hexatara Modul 2 kosong | Belum tanda tangan klien | Isi saat diserahkan UAT |
| Rate limit default off | Produksi tanpa Upstash = tanpa throttle pencarian | Keputusan operasional Abi |
| `qr_aktif = false` → “Tidak Ditemukan” | Preview Modul 3 tidak verifiable publik | By design Modul 3 — bukan bug F02 |
| AC “prefix tidak tabrakan” | Tidak ada Bukti uji tabrakan terpisah | Inferred dari RPC; uji eksplisit opsional |
| Warning console `next-themes` / Server Action ID | Bukan bug Modul 2 | `docs/AS_BUILT/00-KNOWN-WARNINGS.md` |

## Untuk manual book Hexatara

- Halaman Verifikasi Sertifikat bisa dibuka siapa saja; tidak perlu akun.
- Cara cek: ketik nomor sertifikat, atau scan QR pada sertifikat.
- Yang tampil hanya nama, nomor, tanggal terbit, masa berlaku, dan status.
- Sertifikat Free Track tampil Berlaku dengan keterangan “Tanpa masa berlaku”.
- Nomor salah / tidak terdaftar = Tidak ditemukan (beda dari Invalid = sudah lewat tanggal).
- Admin → Sertifikat: tambah satu per satu atau Impor Massal; baris error dilaporkan per nomor baris, baris benar tetap masuk.
- Nomor kosong saat simpan → sistem buat nomor otomatis sesuai jenis.
- Jika pengaturan rate limit diaktifkan, terlalu banyak pencarian berturut-turut bisa dibatasi.
