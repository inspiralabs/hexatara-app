# Prompt untuk Cursor — Temuan UAT Internal #1 (Dashboard, Tombol WA Pelatihan, Nomor WA Dinamis)

```
Baca dulu feature-registry.md (Definition of Done Bagian 14) dan CLAUDE.md sebelum
mulai. Tiga temuan dari uji internal Alif (UAT gladi resik, 24 September 2026),
masing-masing independen — boleh dikerjakan berurutan, tapi verifikasi tiap temuan
terpisah sebelum lanjut ke temuan berikutnya. JANGAN tandai DONE di
feature-registry.md — itu hanya boleh Alif setelah dia sendiri buka di browser dan
konfirmasi.

Di awal kerja, OVERWRITE isi plan.md (isi lama soal F05.5/F05.6/F05.7 sudah beres
dan sudah terekam permanen di ENGINEERING.md + feature-registry.md, jadi aman
ditimpa) dengan rencana kerja untuk tiga temuan ini, memakai struktur di bagian
"ISI PLAN.MD YANG DIMINTA" di bawah. Update plan.md itu lagi setiap satu temuan
selesai, supaya Alif bisa pantau progres tanpa kehilangan konteks kalau sesi
executor terputus.

===============================================================================
TEMUAN 1 — Dashboard user belum ada kartu ajakan upgrade
===============================================================================

MASALAH:
Di src/app/[locale]/(user)/dashboard/page.tsx, satu-satunya kartu informatif yang
tampil saat ini adalah "Lengkapi data identitas" (untuk profil belum lengkap).
Untuk user yang statusnya BELUM upgrade — baik yang baru saja menyelesaikan
kuis/LMS (free_track_selesai_at terisi) MAUPUN yang sudah lama selesai tapi belum
pernah mengajukan upgrade sama sekali (belum ada baris di certificate_orders) —
TIDAK ADA kartu ajakan/pemberitahuan untuk upgrade supaya dapat QR code aktif.
Padahal sertifikatnya masih dalam status Pratinjau (QR blur) sampai upgrade
disetujui — dan tanpa kartu ini, user tidak tahu langkah selanjutnya yang harus
diambil.

YANG DIMINTA:
Tambahkan SATU kartu informatif baru di dashboard (pola visual sama seperti kartu
"Lengkapi data identitas" yang sudah ada: ikon, judul, deskripsi, tombol CTA di
kanan — lihat kode existing untuk `!identitasLengkap` sebagai referensi styling),
dengan LOGIKA TAMPIL sebagai berikut:

1. Kartu MUNCUL kalau: `profile.free_track_selesai_at` terisi (user sudah
   menyelesaikan kuis) DAN belum ada pesananUtama yang statusnya 'disetujui'
   (artinya: belum pernah upgrade sama sekali, ATAU sudah mengajukan tapi masih
   menunggu/ditolak — cek ulang dulu apakah untuk kasus "sedang menunggu
   verifikasi" atau "ditolak" kartu ini tetap relevan tampil dengan teks yang
   disesuaikan, atau justru kartu ini hanya untuk yang BELUM PERNAH mengajukan
   sama sekali dan status "menunggu/ditolak" sudah cukup terwakili oleh StatTile
   "Status Pembayaran" yang sudah ada — pertimbangkan mana yang lebih jelas buat
   user, lalu jelaskan keputusannya di plan.md).
2. Kartu TIDAK MUNCUL kalau: pesananUtama.status === 'disetujui' (user sudah
   resmi upgrade, QR sudah aktif) — sudah cukup terwakili StatTile "Sertifikat:
   Aktif".
3. Isi teks kartu: jelaskan singkat bahwa sertifikat masih pratinjau (QR blur),
   dan upgrade diperlukan untuk mendapat sertifikat resmi yang bisa diverifikasi
   publik.
4. Tombol CTA kartu ini mengarah ke /dashboard/transaksi (bukan /dashboard/upgrade
   yang sudah jadi redirect-only, ADR F06.17).

TAMBAHAN — kartu informatif merchandise, KHUSUS di menu Sertifikat:
Alif menyebutkan: dulu ada juga kartu informatif untuk mendapatkan merchandise,
yang HANYA tampil di halaman /dashboard/sertifikat (bukan di dashboard utama),
di BAWAH kartu "Lihat Sertifikat" yang sudah ada sekarang — dan bedanya dari
kartu upgrade di atas: kartu merchandise ini relevan untuk kasus user yang
paketnya 'cert_only' (sertifikat saja, tanpa merchandise) TAPI ingin tahu bahwa
ada opsi upgrade paket ke 'cert_merch' (+ merchandise). Cek dulu ke
src/app/[locale]/(user)/dashboard/sertifikat/ (halaman & komponennya) apakah
kartu semacam ini pernah ada lalu terhapus (cek git log/git blame di folder itu),
atau ini memang permintaan fitur baru yang belum pernah dibangun — laporkan
temuannya di plan.md sebelum menambahkan kartu ini, karena ini menentukan apakah
ini "mengembalikan yang hilang" atau "fitur baru".

FILE YANG KEMUNGKINAN RELEVAN (cek dulu isinya, jangan asumsi):
- src/app/[locale]/(user)/dashboard/page.tsx (kartu dashboard utama)
- src/app/[locale]/(user)/dashboard/sertifikat/ (kartu merchandise, kalau ada)
- src/app/[locale]/(user)/dashboard/transaksi/ (tujuan tombol CTA)
- Cek certificate_orders: kolom status, paket, status_pengiriman relevan untuk
  menentukan kondisi tampil kartu

===============================================================================
TEMUAN 2 — Terlalu banyak tombol WhatsApp di halaman detail pelatihan (ambigu)
===============================================================================

MASALAH:
Di src/app/[locale]/(public)/pelatihan/[slug]/page.tsx saat ini ada TIGA sumber
tombol WA berbeda yang semuanya tampil sekaligus di halaman yang sama:
1. `waTanyaLink` (dari NEXT_PUBLIC_WA_ADMIN langsung, BUKAN lewat getWhatsappAdmin())
   — muncul di card "Dukungan" (tombol "Hubungi Admin") DAN di CTA akhir halaman
   (tombol final).
2. `waRegulerLink` (dari kontak_pelatihan.wa_reguler, fallback ke getWhatsappAdmin())
   — muncul di dalam card gabungan Syarat+Fasilitas, LABEL: waRegulerLabel.
3. `waPrivateLink` (dari kontak_pelatihan.wa_private) — muncul di card yang sama,
   LABEL: waPrivateLabel.

Ini membuat SATU halaman detail pelatihan bisa menampilkan sampai 4 tombol WA
sekaligus (2 di card syarat/fasilitas + 1 di card dukungan + 1 di CTA akhir),
membingungkan bagi Abi karena tidak jelas tombol mana untuk kebutuhan apa.

YANG DIMINTA (restrukturisasi penempatan, BUKAN menghapus salah satu link):
1. HILANGKAN kedua tombol WA (waRegulerLink dan waPrivateLink) dari dalam card
   gabungan Syarat+Fasilitas — card itu HANYA berisi daftar syarat & fasilitas,
   tanpa tombol WA sama sekali.
2. Card "Dukungan Peserta" (yang sekarang isinya cuma "Hubungi Admin" generik
   pakai waTanyaLink) — GANTI supaya isinya tombol "Tanya Batch Reguler" yang
   memakai link **waRegulerLink** (bukan waTanyaLink lagi), dengan pesan WA yang
   sesuai (pakai t("waAskBatchNamed", { name: "Admin", judul }) seperti yang
   sudah dipakai waRegulerLink saat ini, bukan pesan generik waTanyaLink).
3. Tombol CTA akhir halaman (yang sekarang memakai waTanyaLink dengan label
   finalCtaButton, key i18n "Tanya di WhatsApp" atau serupa — cek
   messages/id.json/en.json namespace batch untuk key persisnya) — GANTI supaya
   memakai **waPrivateLink** dengan pesan yang sesuai (pakai
   t("waAskBatchNamed", { name: "Abiyyi", judul }) seperti yang sudah dipakai
   waPrivateLink saat ini).
4. Sesuaikan teks/label tombol supaya konsisten dengan tujuannya yang baru —
   kalau CTA akhir sekarang jadi mengarah ke WA Private/Inhouse (Abiyyi), teks
   tombol dan heading finalCtaHeading/finalCtaDesc di sekitarnya juga perlu
   ditinjau supaya tidak lagi terkesan "tanya admin umum" tapi jelas mengarah ke
   private/inhouse training. Cek namespace i18n terkait di messages/id.json dan
   messages/en.json, sesuaikan key-nya (boleh ubah teksnya, JANGAN ubah struktur
   key i18n secara sembarangan tanpa mengecek semua tempat key itu dipakai).
5. HASIL AKHIR yang diharapkan: setiap card di halaman detail pelatihan hanya
   berisi SATU tombol WA dengan tujuan yang jelas dari konteksnya —
   - Card "Syarat & Fasilitas": tanpa tombol WA.
   - Card "Dukungan Peserta": SATU tombol → WA Batch Reguler (Admin).
   - CTA akhir halaman: SATU tombol → WA Private & Inhouse (Abiyyi).
6. Variabel `nomorWa` (baris ~144, dari process.env.NEXT_PUBLIC_WA_ADMIN
   langsung) dan fungsi waTanyaLink kemungkinan jadi TIDAK TERPAKAI lagi setelah
   perubahan ini — cek dengan pnpm lint/tsc, hapus kalau memang sudah tidak
   direferensikan di manapun di file ini (jangan hapus kalau ternyata masih
   dipakai di tempat lain yang belum diperiksa).

FILE YANG RELEVAN:
- src/app/[locale]/(public)/pelatihan/[slug]/page.tsx (logic waTanyaLink/
  waRegulerLink/waPrivateLink, baris ~144-165, dan penempatan tombol baris
  ~319-365, ~449-460)
- messages/id.json, messages/en.json — namespace "batch": key waAskBatch,
  waAskBatchNamed, waRegulerLabel, waPrivateLabel, contactAdmin, supportHeading,
  supportDescription, finalCtaHeading, finalCtaDesc, finalCtaButton — cek semua
  key ini, sesuaikan teksnya kalau perlu

===============================================================================
TEMUAN 3 — Nomor WA "default" (floating & lainnya) tidak bisa diganti dari Admin
===============================================================================

MASALAH (penting: temuan Alif TIDAK SEPENUHNYA akurat — verifikasi dulu sebelum
mengerjakan, supaya perbaikannya tepat sasaran):

Sudah ada fungsi `getWhatsappAdmin()` di src/lib/site-settings.ts yang SEHARUSNYA
jadi satu-satunya sumber nomor WA "default/umum" — urutan baca: dulu cek
site_settings.kontak.wa (field WhatsApp yang sudah ada di form Pengaturan →
Kontak Publik, dekat field "Email kontak resmi (footer)"), fallback ke env
NEXT_PUBLIC_WA_ADMIN kalau kosong di database.

MASALAH SEBENARNYA: beberapa halaman/komponen memang sudah pakai
`getWhatsappAdmin()` dengan benar (floating-whatsapp.tsx, hero-section.tsx, dan
sebagian pelatihan/[slug]/page.tsx via variabel waUmum) — TAPI beberapa file lain
membaca `process.env.NEXT_PUBLIC_WA_ADMIN` LANGSUNG, melewati
`getWhatsappAdmin()` sepenuhnya, sehingga TIDAK PERNAH membaca dari database:
- src/app/[locale]/(public)/katalog/page.tsx (baris ~99, variabel nomorWa)
- src/app/[locale]/(public)/katalog/[slug]/page.tsx (baris ~117, langsung di
  buildWaProdukLink)
- src/app/[locale]/(public)/pelatihan/page.tsx (baris ~92, langsung di
  buildWaCustomLink)
- src/app/[locale]/(public)/pelatihan/[slug]/page.tsx (baris ~144, variabel
  nomorWa terpisah dari waUmum — dipakai utk waTanyaLink, lihat Temuan 2 soal
  nasib waTanyaLink)

YANG DIMINTA:
1. Ganti KEEMPAT titik di atas supaya semuanya memanggil `getWhatsappAdmin()`
   (async, sudah ada, tinggal import dan await — pola sudah persis sama dengan
   floating-whatsapp.tsx dan hero-section.tsx), BUKAN membaca
   process.env.NEXT_PUBLIC_WA_ADMIN secara langsung.
2. Field "WhatsApp" yang SUDAH ADA di Admin → Pengaturan (dekat "Email kontak
   resmi (footer)", id="wa", register('wa')) SUDAH TEPAT sebagai sumber nomor WA
   default ini — TIDAK PERLU menambah field baru di Pengaturan untuk ini. Yang
   dibutuhkan murni perbaikan kode supaya keempat halaman itu membaca dari field
   yang sudah ada, bukan dari env.
3. Setelah perbaikan ini, urutan prioritas nomor WA "default/umum" (dipakai
   floating WA, WA di katalog, WA custom di listing pelatihan, dst.) jadi
   konsisten: site_settings.kontak.wa (Admin → Pengaturan) dulu → baru fallback
   ke env NEXT_PUBLIC_WA_ADMIN kalau field di Pengaturan masih kosong. Ini
   penting supaya kalau Abi mau ganti nomor WA-nya sendiri (concern beliau soal
   nomor saat ini berpotensi diblokir), dia BISA ganti sendiri dari Admin tanpa
   perlu InspiraLabs redeploy ubah env.
4. env NEXT_PUBLIC_WA_ADMIN JANGAN dihapus dari kode/'.env — tetap dipertahankan
   sebagai fallback kalau field di database belum pernah diisi Admin (governance
   proyek: DB-first, env sebagai fallback, pola yang sama seperti
   admin_notify_email).
5. TIDAK ADA field WA terpisah untuk "WA Batch Reguler" dan "WA Private/Inhouse"
   yang perlu diubah — dua field itu SUDAH ADA di Pengaturan (kontak_pelatihan:
   wa_reguler, wa_private) dan SUDAH benar cara bacanya (lewat
   getKontakPelatihan(), sudah DB-first). Yang jadi masalah HANYA nomor WA
   "umum/default" yang dipakai di luar konteks pelatihan (floating button,
   katalog produk, listing pelatihan tanpa slug spesifik).

=== KONFIRMASI & DETAIL TAMBAHAN UNTUK TEMUAN 3 (uji langsung Alif) ===

Alif sudah menguji langsung di Admin → Pengaturan → Kontak Publik: field
WhatsApp diubah dan disimpan (tombol "Simpan kontak"), TAPI saat mengecek
tombol "Hubungi via WhatsApp" di halaman detail produk (/katalog/[slug]),
nomor yang terbuka TETAP nomor lama dari env (6281210374787 — cocok persis
dengan nilai NEXT_PUBLIC_WA_ADMIN di .env.local), BUKAN nomor baru yang sudah
disimpan di Pengaturan.

ROOT CAUSE SUDAH DIKONFIRMASI (verifikasi ulang saat eksekusi, jangan asumsi
ulang dari nol): src/app/[locale]/(public)/katalog/[slug]/page.tsx baris ~117
memanggil:
    const waLink = buildWaProdukLink(process.env.NEXT_PUBLIC_WA_ADMIN, ...)
— ini membaca env SECARA LANGSUNG, sama sekali tidak memanggil getWhatsappAdmin()
atau getKontak(), sehingga apa pun yang disimpan Admin di Kontak Publik TIDAK
PERNAH terbaca oleh halaman ini. Ini BUKAN soal cache/revalidate — cek dulu
apakah simpanKontakAction (di actions.ts) sudah benar revalidatePath('/') (sudah
ada, baris ~46), tapi TIDAK revalidate halaman /katalog/[slug] atau /katalog
secara eksplisit. Meski begitu, akar masalah utamanya tetap SALAH SUMBER BACA
(env, bukan getWhatsappAdmin()) — perbaikan revalidatePath saja TIDAK CUKUP
kalau sumber bacanya masih env.

Pastikan perbaikan Temuan 3 (mengganti keempat titik baca env langsung dengan
getWhatsappAdmin()) benar-benar menuntaskan kasus ini. Setelah perbaikan,
tambahkan juga revalidatePath yang relevan di simpanKontakAction — minimal
revalidatePath('/[locale]/katalog', 'layout') atau pola revalidate yang sudah
dipakai fungsi lain di file yang sama (contoh: simpanKontakPelatihanAction
baris ~63 revalidate '/pelatihan') — supaya begitu Admin simpan, SEMUA halaman
publik yang menampilkan nomor WA (bukan hanya landing) langsung ikut update
tanpa perlu redeploy/tunggu cache expired.

=== TAMBAHAN — PERJELAS UX FORM KONTAK PUBLIK (supaya tidak ambigu lagi) ===

Alif menunjukkan screenshot form Kontak Publik saat ini:
- Card "Kontak publik" — deskripsi kecil di bawah judul: "Tampil di footer situs
  (bukan email notifikasi lead di bawah). WA format: 62… tanpa +." — berisi
  field: WhatsApp, Email kontak resmi (footer), Instagram URL, Jam operasional
  (ID/EN).
- Card terpisah "Email notifikasi Admin" di bawahnya.

MASALAH UX yang Alif temukan: deskripsi card "Kontak publik" bilang field-field
di situ "tampil di footer situs" — kesannya HANYA untuk tampilan footer. Padahal
field WhatsApp di situ SEHARUSNYA (setelah Temuan 3 diperbaiki) juga jadi sumber
nomor WA "default/umum" yang dipakai floating button, katalog produk, dan
listing pelatihan — bukan cuma footer. Ini membingungkan Admin (Abi/Alif) karena
deskripsinya tidak mencerminkan cakupan pemakaian nomor itu yang sebenarnya
sudah luas.

YANG DIMINTA:
1. Update teks deskripsi kecil di card "Kontak publik" (yang sekarang: "Tampil
   di footer situs (bukan email notifikasi lead di bawah). WA format: 62… tanpa
   +.") supaya mencerminkan cakupan sebenarnya SETELAH Temuan 3 selesai —
   jelaskan bahwa field WhatsApp di situ dipakai di floating WA, katalog,
   listing pelatihan, dan footer (bukan cuma footer). Cek komponen Card/
   CardDescription di pengaturan-forms.tsx untuk teks ini.
2. PERTIMBANGKAN (opsional, diskusikan dulu di plan.md sebelum eksekusi kalau
   ini perubahan besar): apakah field WhatsApp "kontak publik" ini sebaiknya
   dipisah secara visual/label dari field Email & Instagram (yang memang murni
   untuk footer), supaya jelas bedanya — misalnya label field diganti dari
   "WhatsApp" jadi "WhatsApp (default/umum)" atau ditambah sub-teks kecil di
   bawah field itu sendiri, BUKAN hanya di deskripsi card. Field Email kontak
   resmi & Instagram TETAP murni untuk tampilan footer, tidak perlu diubah.
3. JANGAN pindahkan field WhatsApp ini ke sebelah card "Email notifikasi Admin"
   seperti sempat disebut sebagai opsi — dua hal itu levelnya beda: "Email
   notifikasi Admin" adalah alamat tujuan notifikasi internal (bukan sesuatu
   yang tampil ke publik sama sekali), sedangkan nomor WA ini justru dipakai di
   BANYAK tempat publik sekaligus. Menaruhnya di sebelah "Email notifikasi
   Admin" akan malah menambah kebingungan kategori. Cukup perbaiki
   deskripsi/labelnya di tempat yang sudah ada sekarang (card "Kontak publik").

FILE YANG RELEVAN UNTUK BAGIAN UX INI:
- src/app/admin/(protected)/pengaturan/pengaturan-forms.tsx (card "Kontak
  publik" — CardDescription dan Label WhatsApp, sekitar baris 90-195 dari hasil
  investigasi sebelumnya)

TAMBAHKAN JUGA DI LAPORAN plan.md UNTUK TEMUAN 3:
- Konfirmasi eksplisit: setelah perbaikan, uji manual (boleh dijelaskan
  langkahnya untuk Alif uji sendiri di browser, JANGAN klaim sudah diuji kalau
  bukan Alif yang mengklik) — ubah nomor WA di Kontak Publik, lalu cek keempat
  tempat ini benar-benar ikut berubah TANPA perlu restart/redeploy:
  1. Tombol floating WhatsApp (semua halaman publik)
  2. Tombol "Hubungi via WhatsApp" di /katalog/[slug]
  3. Tombol WA di listing /katalog (kalau ada, cek juga)
  4. Tombol "custom"/WA umum di listing /pelatihan
  5. Tombol "Dukungan Peserta" (WA Batch Reguler) di /pelatihan/[slug] — HANYA
     kalau field wa_reguler di Kontak Pelatihan dikosongkan (karena fallback-nya
     ke getWhatsappAdmin() sesuai kode saat ini, lihat baris ~159 di
     pelatihan/[slug]/page.tsx: kontakPelatihan.wa_reguler?.trim() || waUmum)
- Konfirmasi revalidatePath yang ditambahkan di simpanKontakAction, dan apakah
  ada cara lebih sederhana/konsisten dengan pola project (misal revalidateTag
  kalau project sudah pakai pola itu di tempat lain — cek dulu, jangan
  perkenalkan pola caching baru tanpa alasan)

===============================================================================
SETELAH SELESAI KETIGA TEMUAN
===============================================================================

Laporkan di plan.md:
- Ringkasan perubahan per temuan
- File yang diubah
- Hasil pnpm tsc --noEmit dan pnpm lint
- Untuk Temuan 1: keputusan final soal kondisi tampil kartu upgrade (kasus
  menunggu/ditolak ikut ditampilkan atau tidak) beserta alasannya, dan apakah
  kartu merchandise di menu Sertifikat itu "mengembalikan fitur lama" atau
  "fitur baru" (dari hasil cek git log)
- Untuk Temuan 2: konfirmasi bahwa waTanyaLink/nomorWa lama sudah bersih
  (terhapus) atau masih dipakai di tempat lain yang tidak terduga
- Untuk Temuan 3: hasil uji manual 5 titik + status revalidatePath (lihat bagian
  "KONFIRMASI & DETAIL TAMBAHAN" di atas)

SEMUA INI BELUM BOLEH ditandai DONE di feature-registry.md — itu hanya boleh
Alif, setelah dia sendiri buka di browser dan konfirmasi tiap temuan. Tulis di
plan.md sebagai "siap diuji Alif di browser", tunggu konfirmasi eksplisit
sebelum ada status yang berubah.

PENGINGAT PENUTUP — WAJIB, jangan lewat: setelah Alif mengonfirmasi ketiga
temuan ini sudah diuji dan beres di browser (di sesi/percakapan terpisah, bukan
sesi Cursor ini), langkah TERAKHIR yang harus dilakukan adalah UPDATE
feature-registry.md: tambahkan baris log kronologis baru di bagian akhir file
(pola yang sama dengan entri log 2026-09-24 yang sudah ada untuk F08.1-F08.4 dan
dropdown bahasa) yang mencatat ringkas ketiga temuan ini beserta perbaikannya,
dan — kalau salah satu dari tiga temuan ini ternyata terkait ke nomor fitur yang
sudah tercatat DONE sebelumnya di registry (misalnya F04.4/F04.5 terkait tombol
WA katalog, atau F01.9 terkait floating WA) — perbarui juga kolom Bukti pada
baris fitur terkait supaya mencerminkan kondisi terbaru, TAPI HANYA setelah Alif
eksplisit konfirmasi, bukan atas inisiatif sendiri (sesuai aturan CLAUDE.md:
"Agent tidak pernah menandai DONE atas inisiatif sendiri"). Kalau sesi Cursor
yang mengerjakan perbaikan ini BUKAN sesi yang sama dengan sesi yang menerima
konfirmasi Alif, catat pengingat ini juga di plan.md supaya tidak terlewat di
sesi berikutnya.

===============================================================================
ISI PLAN.MD YANG DIMINTA (struktur, isi detail menyesuaikan progres asli)
===============================================================================

# Plan — Temuan UAT Internal #1 (24 September 2026)

> Status: IN PROGRESS. Tiga temuan dari gladi resik internal Alif sebelum UAT
> resmi bersama Hexatara. Referensi lengkap ada di prompt asli (disimpan di
> percakapan Cowork, tidak diulang di sini).

## Ringkasan tiga temuan

| # | Temuan | Status |
|---|---|---|
| 1 | Dashboard belum ada kartu ajakan upgrade + kartu merchandise di menu Sertifikat | TODO |
| 2 | Tombol WA di detail pelatihan terlalu banyak & ambigu | TODO |
| 3 | Nomor WA default sebagian masih baca langsung dari env, bukan Pengaturan (+ root cause dikonfirmasi di /katalog/[slug]) | TODO |

## Temuan 1 — Detail

(diisi Cursor: file yang diubah, keputusan kondisi tampil, hasil cek git log
kartu merchandise, dst.)

## Temuan 2 — Detail

(diisi Cursor: file yang diubah, konfirmasi label/pesan WA per tombol, status
waTanyaLink lama)

## Temuan 3 — Detail

(diisi Cursor: 4 file yang diperbaiki, konfirmasi getWhatsappAdmin() dipakai
konsisten, revalidatePath yang ditambahkan, hasil uji manual 5 titik, perbaikan
teks/label form Kontak Publik)

## Verifikasi

| Cek | Hasil |
|---|---|
| pnpm tsc --noEmit | |
| pnpm lint | |
| Siap diuji Alif di browser? | |

## Catatan untuk Alif

(ringkasan singkat non-teknis: apa yang berubah, apa yang perlu dicek manual di
browser untuk tiap temuan)

## Pengingat setelah Alif konfirmasi semua beres

☐ Update feature-registry.md (baris log kronologis baru + kolom Bukti fitur
  terkait bila relevan) — HANYA setelah konfirmasi eksplisit Alif, bukan
  inisiatif sendiri.
```

---

## Catatan untuk Alif (di luar prompt Cursor)

Beberapa hal yang saya (InspiraLabs/Cowork) putuskan dulu sebelum menulis prompt di atas, supaya Cursor tidak menebak-nebak:

- **Temuan 1 (kartu upgrade):** saya sengaja tidak memaksa satu jawaban pasti soal "kartu muncul juga saat status menunggu/ditolak atau tidak" — saya minta Cursor melapor dulu opsi mana yang lebih jelas buat user, supaya Kakak yang putuskan setelah lihat opsinya, bukan saya asumsikan sepihak.
- **Kartu merchandise:** saya minta Cursor cek dulu git log — kalau ternyata pernah ada lalu terhapus di suatu commit, itu perlu dicatat sebagai regresi (bukan permintaan fitur baru), yang mungkin relevan dimasukkan ke `04-catatan-perubahan-inspiralabs.md` juga.
- **Temuan 3 — koreksi & konfirmasi:** awalnya saya duga field WA di Pengaturan belum ada, ternyata sudah ada (dekat "Email kontak resmi (footer)") tapi 4 halaman publik salah baca sumber (langsung dari env, bukan lewat `getWhatsappAdmin()`). Kakak lalu menguji langsung dan mengonfirmasi persis dugaan ini — sudah saya lacak sampai baris kodenya (`katalog/[slug]/page.tsx` baris ~117). Saya juga menyarankan field WA **tidak** dipindah ke sebelah "Email notifikasi Admin" (dua hal beda kategori: satu internal, satu dipakai luas di halaman publik) — cukup perbaiki teks deskripsinya saja supaya tidak menyesatkan lagi.
- **Pengingat feature-registry.md:** sudah saya tambahkan sebagai langkah penutup wajib di prompt, dengan penegasan itu hanya boleh dilakukan setelah Kakak konfirmasi eksplisit, sesuai aturan "Agent tidak pernah menandai DONE atas inisiatif sendiri" di CLAUDE.md — dan kalau sesi Cursor yang mengerjakan beda dengan sesi yang menerima konfirmasi Kakak, itu dicatat di plan.md supaya tidak terlewat.

Prompt ini sekarang satu file utuh, siap langsung ditempel ke Cursor dari atas sampai bawah.
