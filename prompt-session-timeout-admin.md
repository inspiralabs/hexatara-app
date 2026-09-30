# Prompt untuk Cursor — Session Timeout Otomatis untuk Admin (Keamanan)

```
Baca dulu feature-registry.md (Definition of Done), ENGINEERING.md
(terutama pola ADR-023/ADR-024 sebagai contoh format ADR), dan CLAUDE.md
sebelum mulai. Ini PERMINTAAN BARU dari Abi (klien Hexatara), disampaikan
langsung saat UAT 30 September 2026, soal KEAMANAN — TERPISAH dari
permintaan-permintaan lain yang sudah dikerjakan sebelumnya (temuan UAT
internal InspiraLabs sudah tercatat ADR-025/Sprint 11/Modul 12, DONE,
jangan disentuh). Buat bagian baru sendiri di plan.md.

KONTEKS PENOMORAN ADR/SPRINT: kerja ini adalah salah satu dari 5
permintaan Abi langsung saat UAT klien, bagian dari Sprint 12/Modul 13
(ADR-026). CEK DULU apakah ENGINEERING.md SUDAH punya entri `### ADR-026`
(kemungkinan sudah dibuat dari prompt navbar+kartu sertifikat yang
mungkin sudah dikerjakan lebih dulu):
- KALAU ADR-026 SUDAH ADA: PERLUAS entri itu (pola sama seperti ADR-024
  yang ditulis beberapa kali "Diperluas [tanggal]" untuk temuan susulan)
  — tambahkan sub-bagian baru untuk session timeout di bawah Keputusan
  yang sudah ada, JANGAN timpa/hapus isi yang sudah ditulis untuk
  navbar/kartu sertifikat.
- KALAU ADR-026 BELUM ADA (berarti prompt ini dikerjakan lebih dulu):
  buat entri BARU `### ADR-026 — Modul 13: Permintaan Abi Langsung saat
  UAT Klien (Navbar, Kartu Ajakan Upgrade, Session Timeout Admin,
  Merchandise jadi Produk, Pendaftaran Perusahaan)`, status **"Berlaku —
  sebagian, 4 poin lain menyusul"**, bagian Konteks jelaskan SEMUA 5
  permintaan Abi (supaya riwayat lengkap), bagian Keputusan HANYA isi
  untuk session timeout (yang dikerjakan di prompt ini).

KONTEKS (sudah dikonfirmasi lewat investigasi kode, jangan investigasi
ulang dari nol): Abi minta Admin otomatis logout kalau tidak ada aktivitas
dalam waktu tertentu, untuk keamanan (supaya kalau Admin lupa logout dari
komputer publik/bersama, sesi tidak tetap terbuka selamanya). Project ini
TIDAK PUNYA middleware.ts sama sekali — sesi Admin murni mengikuti Supabase
Auth (token diperpanjang otomatis oleh Supabase client SELAMA tab terbuka,
TANPA memandang ada aktivitas atau tidak). Jadi fitur idle-timeout ini HARUS
diimplementasikan manual di sisi client — Supabase sendiri tidak punya
mekanisme ini.

KEPUTUSAN YANG SUDAH DIAMBIL (jangan tanya ulang):
- Durasi idle: 30 menit tanpa aktivitas apa pun → otomatis logout
- Ada modal peringatan di menit ke-28 (2 menit sebelum logout): "Sesi akan
  berakhir dalam 2 menit karena tidak ada aktivitas, klik untuk tetap
  login" — kalau Admin klik/berinteraksi dengan modal itu, timer direset,
  TIDAK jadi logout
- HANYA berlaku untuk area Admin (halaman di bawah /admin), TIDAK untuk
  halaman publik atau dashboard user biasa — Abi cuma minta soal keamanan
  Admin
- HALAMAN /admin/login DIKECUALIKAN (belum ada sesi untuk di-timeout di
  situ)

TITIK PEMASANGAN (sudah dikonfirmasi lewat baca kode, pakai ini, jangan
bikin pendekatan baru):
- src/app/admin/(protected)/layout.tsx adalah Server Component yang
  membungkus SEMUA halaman Admin terproteksi (kecuali /admin/login) dengan
  <AdminShell>. Ini titik yang tepat untuk memastikan idle-timeout aktif di
  SEMUA halaman Admin tanpa perlu dipasang berulang per halaman.
- src/components/shell/admin-shell.tsx adalah Client Component ('use
  client', dipakai untuk dropdown menu Admin yang sudah ada) — timer idle
  SEBAIKNYA dipasang di sini atau sebagai komponen client BARU yang
  di-mount dari sini/dari layout, supaya konsisten dengan pola yang sudah
  ada (bukan bikin wrapper baru yang terpisah dari AdminShell tanpa alasan
  kuat — investigasi dulu mana yang lebih bersih, laporkan pilihanmu di
  plan.md).
- src/app/admin/(protected)/actions.ts SUDAH ADA Server Action
  `logoutAdminAction()` yang dipakai tombol logout manual Admin sekarang
  (memanggil supabase.auth.signOut() lalu redirect ke /admin/login) — PAKAI
  ULANG fungsi ini untuk auto-logout, JANGAN bikin logic signOut baru yang
  terpisah/duplikat.

YANG DIMINTA DIBUAT:
1. Komponen client baru (co-locate dekat admin-shell.tsx, atau di dalam
   file yang sama kalau lebih masuk akal — putuskan sendiri sesuai
   konvensi file project, tapi jangan taruh di folder yang tidak
   berhubungan) yang:
   a. Memasang event listener untuk aktivitas pengguna: klik (mousedown/
      click), keyboard (keydown), scroll, mousemove (throttle mousemove
      supaya tidak terlalu sering trigger re-render — cek apakah ada
      helper throttle/debounce yang sudah dipakai di project, atau tulis
      throttle sederhana sendiri)
   b. Reset timer setiap kali ada aktivitas
   c. Di menit ke-28 tanpa aktivitas: tampilkan modal peringatan (pakai
      komponen Dialog yang SUDAH ADA di project — cek src/components/ui/
      dialog.tsx atau sejenisnya, JANGAN bikin modal custom dari nol kalau
      sudah ada komponen Dialog reusable)
   d. Kalau Admin klik tombol "Tetap Login" di modal ATAU melakukan
      aktivitas apa pun lagi: modal ditutup, timer direset dari awal
   e. Di menit ke-30 (tanpa respons sejak modal muncul): panggil
      logoutAdminAction() (Server Action yang sudah ada), modal berubah
      pesan singkat "Sesi berakhir, mengalihkan ke halaman login..." atau
      langsung redirect (ikuti apa yang paling natural dari perilaku
      logoutAdminAction() yang sudah pakai redirect() sendiri)
2. Pasang komponen ini di layout Admin terproteksi (poin di atas) supaya
   aktif di SEMUA halaman /admin/* KECUALI /admin/login (yang punya
   layout terpisah, src/app/admin/layout.tsx — cek dulu apakah layout
   /admin/login ini benar-benar terpisah dari (protected)/layout.tsx,
   supaya yakin tidak akan aktif di halaman login)
3. Timer HARUS reset dengan benar saat navigasi antar halaman Admin (SPA
   navigation Next.js) — bukan cuma reset saat full page reload. Karena
   komponennya dipasang di layout yang membungkus children, ini seharusnya
   otomatis aman, tapi tetap PERLU DIUJI (klik-klik pindah menu Admin
   harus terus mereset timer, bukan cuma diam di satu halaman).

JANGAN pasang idle-timeout apa pun di halaman publik atau dashboard user —
di luar scope permintaan ini.

SETELAH SELESAI:
- Jalankan pnpm tsc --noEmit dan pnpm lint.
- WAJIB tulis ke plan.md — TAMBAHKAN bagian baru "Permintaan Abi (30
  September 2026) — Session Timeout Admin" (JANGAN timpa bagian lain di
  plan.md), isinya: ringkasan implementasi, file yang dibuat/diubah,
  penjelasan singkat KENAPA titik pemasangannya di situ, hasil tsc/lint,
  cara uji untuk Alif yang JELAS DAN BISA DIIKUTI TANPA MENUNGGU 30 MENIT
  SUNGGUHAN — SANGAT PENTING: sertakan instruksi untuk Alif MENGECILKAN
  SEMENTARA durasi timer (misal ubah ke 30 detik/1 menit lewat env var
  atau konstanta yang gampang ditemukan) KHUSUS untuk keperluan uji coba
  di localhost, dengan pengingat jelas untuk MENGEMBALIKAN ke 30 menit
  sebelum push ke production. Jelaskan juga cara paling gampang Alif
  mengubah angka itu (nama file & baris konstanta) supaya bisa uji cepat
  tanpa menunggu.
- SARANKAN SATU PESAN COMMIT git yang ringkas (cek `git log --oneline -10`
  untuk gaya konsisten), taruh di akhir laporan plan.md dan tampilkan juga
  di ringkasan akhir ke Alif.

- Di feature-registry.md: CEK DULU apakah section `## Sprint 12 — Modul
  13: Permintaan Abi Langsung saat UAT Klien` SUDAH ADA (dari prompt
  navbar+kartu, kalau sudah dikerjakan lebih dulu):
  - KALAU SUDAH ADA: cari baris F13.3 (Session timeout Admin) yang
    berstatus TODO, update kolom "Berkas" dengan nama file prompt ini —
    status TETAP TODO (bukan DONE), tunggu konfirmasi Alif.
  - KALAU BELUM ADA (prompt ini dikerjakan lebih dulu): buat section baru
    itu, isi baris F13.1 (Navbar, status TODO, catatan "menyusul"), F13.2
    (Kartu ajakan upgrade, status TODO, catatan "menyusul"), F13.3
    (Session timeout Admin — INI yang dikerjakan sekarang, status TODO,
    kolom Berkas isi nama file prompt ini), F13.4 (Merchandise jadi
    produk, status TODO, "menyusul"), F13.5 (Pendaftaran perusahaan,
    status TODO, "menyusul").
- Entri baru di tabel "RIWAYAT PERUBAHAN STRUKTUR" (bagian 11
  ENGINEERING.md), tanggal hari ini, ringkas: "ADR-026 diperluas — F13.3
  Session Timeout Admin dikerjakan" (atau "ADR-026 dibuka — F13.3 Session
  Timeout Admin dikerjakan" kalau ADR-026 baru dibuat di prompt ini).

- JANGAN tandai apa pun DONE di feature-registry.md — tunggu Alif
  konfirmasi eksplisit sudah uji sendiri di browser. Tambahkan pengingat
  yang sama di plan.md.
```

---

## Ringkasan untuk Alif

Fitur ini murni logika di sisi aplikasi (tanpa SQL) — Supabase sendiri tidak punya konsep "otomatis logout kalau idle", jadi ini benar-benar fitur baru yang dibangun dari nol, bukan mengaktifkan sesuatu yang sudah ada.

Sesuai yang Kakak putuskan: 30 menit idle, dengan modal peringatan di menit ke-28 supaya Admin yang sedang membaca (tapi tidak klik-klik) tidak tiba-tiba ter-logout di tengah kerjaan. Saya sudah arahkan Cursor untuk pakai ulang fungsi logout yang sudah ada (`logoutAdminAction`), bukan bikin logic baru — supaya perilakunya konsisten dengan tombol logout manual yang sudah ada sekarang.

Satu hal penting yang saya minta Cursor sertakan di laporan: cara Kakak uji coba TANPA harus menunggu 30 menit sungguhan (misal timer dikecilkan sementara jadi 30 detik saat testing di localhost). Pastikan Cursor kasih instruksi jelas untuk mengembalikan ke 30 menit lagi sebelum ini di-push ke production — jangan sampai kelupaan kebawa ke live.

**Urutan kerja:**
1. Tempel prompt di atas ke Cursor.
2. Baca `plan.md` bagian baru untuk lihat cara uji cepat (durasi dipercepat sementara).
3. Uji: biarkan tab Admin idle sampai muncul modal peringatan, coba klik "Tetap Login" (pastikan timer reset, tidak jadi logout), lalu uji juga biarkan sampai benar-benar logout otomatis.
4. Regresi penting: pastikan aktivitas normal (klik-klik kerja seperti biasa) TIDAK memicu logout di tengah jalan.
5. Pastikan durasi timer sudah dikembalikan ke 30 menit (bukan versi testing yang dipercepat) sebelum push ke production.
6. Konfirmasi ke saya kalau sudah oke, supaya feature-registry.md bisa diupdate.

Selanjutnya saya siapkan rencana SQL detail untuk poin merchandise-jadi-produk (#2) — itu poin besar berikutnya dalam urutan.
