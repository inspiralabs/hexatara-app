# Prompt Cursor — Perbaikan Grup 4: Banner /dashboard/pelatihan + Toast Pesan Merchandise

## Konteks

Temuan uji Alif setelah F13.4. Tidak ada perubahan skema/SQL.

**#6 — Banner "Upgrade Sekarang" di `/dashboard/pelatihan` tetap muncul walau
sertifikat sudah disetujui.**
Akar masalah sudah ketemu di `src/app/[locale]/(user)/dashboard/pelatihan/page.tsx`,
fungsi `sudahPaketTertinggi()`:

```ts
function sudahPaketTertinggi(opts) {
  if (pesananUtama?.paket === 'cert_merch' && pesananUtama.status === 'disetujui') return true;
  if (pesananUtama?.paket === 'cert_only' && pesananUtama.status === 'disetujui' && pesananMerch?.status === 'disetujui') {
    return true;
  }
  return false;
}
```

Fungsi ini cuma kenal 2 kondisi: "belum apa-apa" dan "sudah paket TERTINGGI lengkap
(termasuk merch)". Tidak ada kondisi antara "cert_only sudah disetujui, merch belum"
— padahal itu kondisi valid (user boleh pilih tidak beli merchandise). Akibatnya
banner generik "Upgrade Sekarang" (`tDash('upgradeSekarang')`) tetap tampil terus
walau sertifikatnya sudah aktif, padahal harusnya berubah jadi ajakan khusus
merchandise.

**#7 — Toast setelah submit pesanan merchandise masih generik.**
`src/app/[locale]/(user)/pesanan-upgrade-form.tsx` baris ~81:
`toast.success('Pesanan berhasil dibuat. Silakan unggah bukti transfer.')` — sama
persis untuk `cert_only`, `cert_merch`, maupun `merch_addon`. Untuk user yang cuma
nambah merchandise (paket sudah dimiliki), pesan ini tidak menyebutkan konteksnya
sama sekali.

## Langkah

1. Baca ulang kedua file di atas untuk pastikan kondisi masih sama. Kalau beda,
   berhenti dan laporkan.

## 1. `dashboard/pelatihan/page.tsx` — banner 3 kondisi

Ubah `sudahPaketTertinggi()` (atau pecah jadi fungsi baru yang mengembalikan salah
satu dari 3 status, bukan boolean) supaya membedakan:

- **Belum ada order cert_only/cert_merch sama sekali, atau order masih
  proses/ditolak** → banner sekarang ("Upgrade Sekarang", ke `/dashboard/transaksi`)
  — perilaku existing, tidak berubah.
- **cert_only ATAU cert_merch sudah `disetujui`, TAPI merchandise belum ada order
  `disetujui`** (baik belum pernah order merch_addon, atau order merch_addon
  terakhir belum/tidak disetujui) → banner BARU: "Dapatkan Merchandise" / copy
  senada, CTA ke `/dashboard/merchandise`.
- **Sertifikat disetujui DAN merchandise juga sudah disetujui (dari cert_merch
  ATAU dari merch_addon terpisah)** → banner hilang (perilaku existing kondisi
  `paketTertinggi` yang sudah benar, pertahankan).

Sesuaikan juga teks `tDash('upgradeSekarang')`/terjemahan terkait kalau perlu
tambah key baru di file i18n (cek pola `next-intl` yang dipakai project, jangan
hardcode teks kalau semua string lain di halaman ini melalui `t()`).

**Catatan penting:** setelah Prompt Grup 3 dijalankan (merchandise boleh dipesan
berulang), definisi "merchandise sudah disetujui" di sini sebaiknya cek APAKAH ADA
MINIMAL SATU order merch_addon dengan status disetujui (bukan cuma order terakhir) —
supaya banner tidak balik muncul lagi kalau user pesan merch kedua kalinya dan order
itu belum diproses. Kalau Grup 3 belum dijalankan saat prompt ini dikerjakan, tetap
pakai logic `.maybeSingle()` yang ada sekarang dan tinggalkan catatan di plan.md
untuk disesuaikan setelah Grup 3 jalan.

## 2. `pesanan-upgrade-form.tsx` — toast sesuai paket

Ganti toast submit jadi berbeda per `paketDipilih`:

```ts
const PESAN_SUKSES: Record<Paket, string> = {
  cert_only: 'Pesanan sertifikat berhasil dibuat. Silakan unggah bukti transfer.',
  cert_merch: 'Pesanan sertifikat + merchandise berhasil dibuat. Silakan unggah bukti transfer.',
  merch_addon: 'Pesanan merchandise berhasil dibuat. Silakan unggah bukti transfer. Sertifikat Anda tidak berubah.',
};
// toast.success(PESAN_SUKSES[paketDipilih])
```

Sesuaikan nama variabel/pola dengan kode yang ada (cek dulu apakah `paketDipilih`
sudah tersedia di scope `onSubmit`).

## Testing sequence

1. User yang belum pernah order apa pun → buka `/dashboard/pelatihan` → banner
   "Upgrade Sekarang" tampil (tidak berubah).
2. User dengan cert_only DISETUJUI, belum pernah order merch → buka
   `/dashboard/pelatihan` → banner berubah jadi ajakan merchandise, CTA ke
   `/dashboard/merchandise`.
3. User dengan cert_only disetujui DAN merch_addon disetujui → buka
   `/dashboard/pelatihan` → banner hilang total.
4. User dengan cert_merch disetujui (sertifikat+merch sekaligus) → banner hilang
   (perilaku existing, cek tidak regresi).
5. Submit order cert_only → cek toast: "Pesanan sertifikat berhasil dibuat...".
6. Submit order merch_addon (dari user yang sudah cert_only) → cek toast: "Pesanan
   merchandise berhasil dibuat... Sertifikat Anda tidak berubah."
7. Submit order cert_merch → cek toast versi gabungan.

## Dokumentasi

1. **`plan.md`**: ringkas 2 perbaikan ini + file, status "menunggu uji Alif".
2. **`ENGINEERING.md`** — perluas `### ADR-026` (bukan ADR baru), sub-bagian
   "Diperluas [tanggal]": banner 3-kondisi di /dashboard/pelatihan, toast submit
   dibedakan per paket. Update Bagian 11.
3. **`feature-registry.md`** — baris F13.4: catat di kolom Bukti, status TETAP
   seperti sebelumnya sampai Alif konfirmasi uji.
4. **Jangan pernah menandai DONE atas inisiatif sendiri.**

## Saran pesan commit

```
fix(dashboard-user): banner pelatihan 3-kondisi + toast pesan sesuai paket

- /dashboard/pelatihan: banner upgrade sekarang tidak lagi nyangkut setelah
  sertifikat disetujui — sekarang ganti ajakan "Dapatkan Merchandise" kalau
  merchandise belum diambil
- Toast sukses submit pesanan dibedakan teksnya per paket (cert_only/cert_merch/
  merch_addon), tidak generik lagi

Ref: ADR-026, F13.4 (temuan UAT)
```
