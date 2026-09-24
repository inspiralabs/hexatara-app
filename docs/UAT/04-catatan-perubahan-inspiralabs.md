# Catatan Perubahan — Internal InspiraLabs

**Tujuan:** log kerja untuk mencatat semua masukan, ketidaksesuaian, atau permintaan perubahan yang muncul selama sesi UAT bersama Hexatara — supaya jelas bagian mana yang perlu ditindaklanjuti, dan tidak ada yang terlewat atau dikerjakan diam-diam tanpa tercatat.

**Cara pakai:** setiap kali ada temuan saat UAT (baik dari Hexatara, dari Alif, atau dari tim InspiraLabs sendiri), tambahkan satu baris baru di tabel bagian 2. Jangan langsung dikerjakan di tempat — kumpulkan dulu semua masukan, lalu dipilah sesuai aturan di Bagian 3 (sesuai `feature-registry.md`: perbaikan dalam scope dikerjakan, permintaan baru dicatat sebagai kandidat Fase 2).

---

## 1. Sesi UAT yang Tercatat di Dokumen Ini

| Tanggal | Sesi | Dihadiri | Fokus modul |
|---|---|---|---|
| _(isi saat sesi berlangsung)_ | | | |

---

## 2. Log Temuan

| No. | Tanggal | Ref. skenario (dari `02-skenario-uji-uat.md`) | Deskripsi temuan | Kategori | Status | Ditindaklanjuti oleh |
|---|---|---|---|---|---|---|
| | | | | | | |

**Kategori** (pilih salah satu saat mengisi):
- **Bug** — sistem tidak berjalan sesuai yang sudah dibangun (beda dari hasil yang diharapkan di dokumen UAT)
- **Ketidaksesuaian data** — bukan masalah sistem, hanya data yang belum diisi/salah isi (lihat `01-persiapan-hexatara.md`)
- **Permintaan perubahan (dalam scope Fase 1)** — penyesuaian kecil yang masih sesuai kesepakatan awal
- **Permintaan baru (kandidat Fase 2)** — di luar scope yang sudah disepakati, perlu kesepakatan tertulis kedua pihak sebelum dikerjakan

**Status** (pilih salah satu saat mengisi):
- **Baru dicatat** — belum ditindaklanjuti
- **Dikonfirmasi** — sudah dicek InspiraLabs, benar merupakan temuan
- **Bukan bug** — sudah dicek, ternyata sesuai desain (bisa dirujuk ke `03-penjelasan-fitur.md`)
- **Sedang dikerjakan**
- **Selesai**
- **Ditunda ke Fase 2**

---

## 3. Aturan Pemilahan Masukan

Mengikuti aturan yang sudah berlaku di proyek ini (`feature-registry.md`):

1. Masukan yang masuk **dipilah dulu** sebelum dikerjakan — jangan langsung dieksekusi di tempat saat UAT berlangsung.
2. Perbaikan yang **masih dalam scope Fase 1** yang sudah disepakati boleh dikerjakan.
3. Permintaan baru yang **di luar scope Fase 1** dicatat sebagai kandidat Fase 2, **bukan** langsung dikerjakan — perlu kesepakatan tertulis kedua pihak dulu. Ini untuk mencegah proyek melebar tanpa ada yang memutuskan secara sadar (pelajaran dari pengalaman proyek ini sendiri, yang sudah tumbuh jauh dari rencana awal).
4. Setiap fitur yang sudah ditandai **DONE** di `feature-registry.md` hanya boleh berubah statusnya lagi kalau ditemukan bug nyata — bukan karena permintaan fitur tambahan.

---

## 4. Ringkasan untuk Abi (diisi setelah UAT selesai)

_(Bagian ini diisi InspiraLabs setelah sesi UAT selesai, untuk merangkum ke Abi: apa saja yang sudah disetujui, apa saja yang masih perlu diperbaiki sebelum go-live, dan apa saja yang disepakati masuk Fase 2.)_

### Disetujui, siap go-live
-

### Perlu diperbaiki sebelum go-live
-

### Disepakati sebagai Fase 2 (di luar scope Fase 1)
-

---

*Dokumen ini kosong secara sengaja — diisi secara langsung (live) selama sesi UAT berlangsung.*
