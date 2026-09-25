# Prompt untuk Cursor — Investigasi & Perbaikan: Routing /materi/[id] Membingungkan

```
Baca dulu feature-registry.md (Definition of Done) dan CLAUDE.md sebelum mulai.
Ini TEMUAN BARU dari Alif saat UAT internal 25 September 2026, TERPISAH dari
temuan-temuan sebelumnya (dashboard/WA pelatihan/WA dinamis, dan bug approval
merch_addon) — jangan digabung laporannya di plan.md, buat bagian baru sendiri.

KONTEKS TEMUAN (root cause SUDAH ditemukan lewat investigasi kode, JANGAN
investigasi ulang dari nol — verifikasi ulang saja saat eksekusi):
Alif mencoba akses beberapa URL /materi/[id] secara manual dan hasilnya:
- /materi          -> 404 "Halaman tidak ditemukan"
- /materi/1        -> tampil, tapi isinya berantakan/data uji coba
                      ("uji_materi_ppt", "asdds", "asdsddssd")
- /materi/2        -> tampil, tapi pesan "Materi ini belum punya bab.
                      Silakan cek kembali nanti."
- /materi/3        -> tampil NORMAL, ini course sungguhan yang aktif dipakai
- /materi/4        -> 404 (id ini memang tidak ada baris di database)
Satu-satunya jalan masuk resmi ke Materi adalah tombol "Mulai Sekarang" di
halaman /pelatihan, yang selalu mengarah ke /materi/3. Tapi kalau user iseng
ubah angka di URL secara manual, dia akan menemukan /materi/1 dan /materi/2
yang terlihat rusak/aneh — ini berisiko disalahartikan sebagai bug oleh Abi
saat presentasi.

ROOT CAUSE (sudah dikonfirmasi baca kode langsung, bukan dugaan):
1. TIDAK ADA route /materi (index/listing) sama sekali di
   src/app/[locale]/(kelas)/materi/ -- hanya ada /materi/[id]/page.tsx. Ini
   MEMANG DISENGAJA, tertulis eksplisit di komentar src/lib/materi.ts:
   "tidak ada lagi listing /materi untuk fallback". Jadi /materi 404 itu
   BUKAN bug, itu perilaku yang disengaja sejak awal.
2. src/lib/materi.ts -> getMateriHeroHref() (dipakai tombol "Mulai Sekarang"
   di /pelatihan) memilih course lewat query:
   `.from("materials").select("id, material_chapters!inner(id)")
     .eq("is_active", true).order("urutan").limit(1)`
   -- ini SUDAH BENAR, akan selalu mengarah ke course aktif pertama yang
   punya bab. Ini yang membuat /materi/3 jadi satu-satunya pintu masuk resmi.
3. src/lib/materi/singleton.ts -> getMateriId() (dipakai halaman Admin ->
   Materi) PUNYA KOMENTAR EKSPLISIT yang menjelaskan akar masalah ini:
   "sisa baris uji coba era pra-LMS (uji_materi_ppt/uji_materi_pdf, F03.12
   lama) masih ada di database dan id-nya lebih kecil dari course sungguhan".
   Jadi baris materials dengan id 1 dan 2 itu MEMANG data uji coba lama dari
   fase pengembangan sebelumnya (bukan data yang sedang dipakai), dan baris
   itu MASIH is_active = true (kalau tidak, /materi/[id]/page.tsx akan
   notFound() untuk id itu juga -- karena baris itu TETAP tampil alih-alih
   404, is_active pasti masih true).
4. src/app/[locale]/(kelas)/materi/[id]/page.tsx: siapa pun yang tahu/menebak
   angka id di URL (1, 2, 3, ...) bisa langsung akses route ini secara
   langsung, TIDAK ADA validasi bahwa id itu adalah course yang "sedang
   aktif dipakai" (cuma cek is_active = true, dan is_active TIDAK auto-false
   untuk course lama yang sudah tidak dipakai lagi).
5. Halaman Admin -> Materi (src/app/admin/(protected)/materi/page.tsx) HANYA
   menampilkan SATU baris materials (dipilih otomatis lewat getMateriId()),
   TIDAK ADA daftar/listing semua baris materials di Admin sama sekali --
   jadi Alif/Abi TIDAK PUNYA CARA dari UI Admin untuk melihat, menonaktifkan,
   atau menghapus baris id 1 dan id 2 itu. Ini bagian dari root cause juga:
   bukan cuma soal data lama tersisa, tapi memang belum ada tempat di Admin
   untuk membereskannya sendiri.

KESIMPULAN UNTUK DIJELASKAN KE ALIF (tulis ulang dengan kata-katamu sendiri
di plan.md, tapi intinya):
- /materi 404 = disengaja, bukan bug (memang tidak ada halaman listing).
- /materi/3 = pintu masuk resmi satu-satunya, dan itu SUDAH BENAR (dipilih
  otomatis oleh sistem sebagai course aktif, bukan angka acak/kebetulan).
- /materi/1 dan /materi/2 = sisa data uji coba dari fase pengembangan lama
  (sebelum LMS berbab dibangun), BUKAN course yang sedang dipakai user
  mana pun. Ini bukan "kerusakan" pada course yang aktif, tapi sisa data
  lama yang seharusnya sudah dibersihkan/dinonaktifkan dan belum ada
  jalannya dari Admin.
- Risiko nyata: siapa pun (termasuk Abi) yang iseng ubah angka di URL akan
  menemukan halaman ini dan bisa salah kira ini bug produksi yang aktif.

YANG DIMINTA DIPERBAIKI (investigasi dulu opsi mana yang paling sesuai pola
project yang sudah ada, laporkan pilihanmu di plan.md sebelum eksekusi kalau
ada keputusan besar/ambigu -- JANGAN putuskan sendiri kalau pilihannya
signifikan, tanyakan dulu lewat catatan di plan.md):

1. GANTI PINTU MASUK RESMI JADI URL BERNAMA (bukan angka id) — INI PERMINTAAN
   UTAMA Alif, supaya angka "3" tidak pernah terlihat/ditanyakan orang lain.
   Keputusan yang SUDAH DIAMBIL Alif (jangan tanya ulang, langsung eksekusi
   ini): dibuat REDIRECT STATIS, BUKAN kolom slug baru di database, dan BUKAN
   menghapus [id] dari struktur route (route /materi/[id] TETAP ADA apa
   adanya untuk kompatibilitas internal, cuma tidak dipublikasikan lagi).

   Cek dulu tabel `materials` di src/types/database.ts -- TIDAK ADA kolom
   slug (cuma id angka), jadi pendekatan slug dinamis dari database TIDAK
   dipakai untuk sekarang, sesuai keputusan Alif.

   Langkah konkret:
   a. Buat route baru:
      src/app/[locale]/(kelas)/materi/get-free-certificate-rpc/page.tsx
      Isinya cukup Server Component yang memanggil getMateriHeroHref() (dari
      src/lib/materi.ts, sudah ada, jangan diubah logikanya) lalu redirect ke
      hasilnya. Pakai pola redirect yang SUDAH ada di codebase ini (BUKAN
      redirect() dari "next/navigation", pakai redirect() dari
      "@/i18n/navigation" dengan bentuk `redirect({ href, locale })` --
      cek contoh pola ini persis di
      src/app/[locale]/(public)/batch/[slug]/page.tsx baris ~47 dan
      src/app/[locale]/(user)/dashboard/upgrade/page.tsx baris ~36 sebelum
      menulis kode, supaya konsisten). Kalau getMateriHeroHref() return null
      (belum ada course aktif berbab), redirect ke /pelatihan saja (jangan
      notFound() supaya user tidak bingung).
   b. Ganti SEMUA tempat di kode yang men-generate link ke /materi/[id]
      supaya mengarah ke /materi/get-free-certificate-rpc, BUKAN lagi ke
      /materi/${id}. Sejauh investigasi saya ada 2 titik (VERIFIKASI ULANG,
      mungkin ada titik lain yang terlewat -- grep dulu
      `grep -rn "materi/\${" src` dan `grep -rn "getMateriHeroHref" src`):
      - src/lib/materi.ts -> getMateriHeroHref() SEBAIKNYA diubah supaya
        return string konstan '/materi/get-free-certificate-rpc' (bukan lagi
        `/materi/${id}`) -- ini titik paling penting karena dipakai tombol
        "Mulai Sekarang" di /pelatihan. Pertimbangkan apakah fungsi ini masih
        perlu query ke database sama sekali kalau cuma untuk cek "ada course
        aktif berbab atau tidak" (return null vs path) -- boleh disederhanakan
        asal perilaku "sembunyikan tombol kalau belum ada course aktif" tetap
        sama persis seperti sekarang.
      - src/app/[locale]/(user)/dashboard/kursus/page.tsx baris ~135, saat ini
        `href={`/materi/${material.id}`}` -- ganti ke
        `href="/materi/get-free-certificate-rpc"` (atau turunkan dari
        getMateriHeroHref() kalau lebih konsisten dengan pola file itu -- cek
        dulu bagaimana file ini sudah mengambil data materialnya).
   c. Route lama /materi/[id]/page.tsx TETAP ADA dan tetap bisa diakses kalau
      idnya benar (id 3 sekarang) -- TIDAK perlu di-redirect/diblokir, karena
      /materi/get-free-certificate-rpc di atas toh akan langsung redirect ke
      URL id itu (redirect Next.js akan mengubah URL browser jadi
      /materi/3 pada akhirnya, itu WAJAR dan tidak masalah -- yang penting
      LINK YANG DIBAGIKAN/DIKLIK dari dalam aplikasi selalu pakai nama, bukan
      angka). JANGAN mencoba menyembunyikan angka id dari URL akhir browser,
      itu di luar scope permintaan ini (Next.js redirect selalu mengganti URL
      terlihat, ini best-effort untuk hal yang mereka klik dari UI, bukan
      untuk menyembunyikan URL final sepenuhnya).
   d. Tetap kerjakan PROTEKSI berikut supaya id lama/tidak aktif tidak bisa
      diakses langsung juga (INI POIN TERPISAH dari poin a-c di atas, tetap
      diperlukan): di /materi/[id]/page.tsx, SETELAH fetch `material`,
      tambahkan pengecekan -- kalau materialId ini BUKAN course yang dipilih
      getMateriHeroHref() (perbandingan berbasis ID hasil query yang sama,
      bukan hardcode angka 3), redirect ke /materi/get-free-certificate-rpc
      (pakai pola redirect yang sama seperti poin a) ATAU notFound() --
      pilih salah satu yang lebih konsisten dengan pola redirect/notFound
      lain yang sudah ada di codebase ini, laporkan pilihanmu di plan.md.

2. BERESKAN DATA LAMA supaya tidak nyasar lagi:
   Karena agent TIDAK PERNAH eksekusi DDL/UPDATE/DELETE langsung ke database,
   tulis SQL USULAN di file terpisah bernama
   `usulan-sql-nonaktifkan-materi-lama.sql` di root project (JANGAN
   dieksekusi sendiri), isinya:
   - UPDATE materials SET is_active = false WHERE id IN (<isi id yang
     terbukti data uji coba lama, verifikasi dulu lewat query SELECT id,
     judul_id, is_active FROM materials ORDER BY id -- supaya yakin id mana
     saja yang memang harus dinonaktifkan, JANGAN asal pakai id 1 dan 2 dari
     laporan Alif tanpa verifikasi ulang lewat SELECT, karena data bisa saja
     sudah berubah sejak laporan ini ditulis>);
   - JANGAN DELETE baris-nya (lebih aman set is_active = false saja, supaya
     kalau ada foreign key/relasi lain yang masih mereferensikan baris itu
     tidak jadi error, dan datanya masih bisa dilihat kalau suatu saat
     diperlukan histori).
   - Tambahkan komentar SQL yang menjelaskan kenapa (sama seperti pola
     komentar di usulan-sql-fix-aktivasi-merch-addon.sql sebelumnya -- ada
     bagian ROOT CAUSE dan CARA UJI di akhir file).

3. (OPSIONAL, laporkan dulu kelayakannya di plan.md sebelum eksekusi -- ini
   perbaikan jangka menengah, bukan wajib sekarang): pertimbangkan menambah
   listing sederhana di halaman Admin -> Materi yang menampilkan SEMUA baris
   materials (bukan cuma satu course aktif seperti sekarang), dengan
   kemampuan toggle is_active per baris -- supaya ke depannya Alif/Abi bisa
   membereskan sendiri kalau ada data uji coba baru lagi, tanpa perlu minta
   tolong lagi. KALAU ini terlihat sebagai perubahan besar di luar scope
   temuan ini, JANGAN dikerjakan sekarang -- cukup dicatat sebagai usulan di
   plan.md untuk didiskusikan terpisah dengan Alif, karena ini menyentuh
   desain UI Admin yang sudah ada.

JANGAN ubah apa pun di luar file-file yang relevan untuk poin 1 dan 2 di
atas (dan file SQL usulan baru). getMateriHeroHref() BOLEH diubah sesuai
poin 1b, itu memang bagian dari permintaan ini -- getMateriId() (dipakai
Admin -> Materi, file singleton.ts) JANGAN diubah sama sekali, di luar
scope prompt ini.

SETELAH SELESAI:
- Jalankan pnpm tsc --noEmit dan pnpm lint.
- WAJIB tulis hasil kerja ke plan.md -- TAMBAHKAN bagian baru "Temuan Baru —
  Routing /materi/[id] Membingungkan" (JANGAN timpa/hapus bagian-bagian lain
  yang sudah ada di plan.md, ini laporan terpisah di file yang sama), isinya:
  - Ringkasan bug & root cause (boleh salin inti penjelasan di atas)
  - File yang diubah, dan pilihan Opsi A/notFound-vs-redirect yang diambil
    (sertakan alasannya)
  - Konfirmasi SQL usulan (usulan-sql-nonaktifkan-materi-lama.sql) BELUM
    dijalankan Alif -- status "menunggu Alif jalankan manual di Supabase SQL
    Editor, SETELAH itu baru perilaku /materi/1 dan /materi/2 berubah jadi
    404 (karena is_active jadi false)"
  - Hasil tsc/lint
  - Cara uji untuk Alif, urutan yang jelas:
    1. Akses /materi/get-free-certificate-rpc langsung di browser -- harus
       redirect otomatis ke course aktif (URL akhirnya akan berubah jadi
       /materi/3, itu normal, yang penting halamannya tampil benar seperti
       sebelumnya)
    2. Klik tombol "Mulai Sekarang" di /pelatihan -- cek link yang dituju
       sekarang /materi/get-free-certificate-rpc (bukan lagi /materi/3),
       dan hasil akhirnya tetap course yang sama seperti sebelumnya
    3. Cek juga link "Materi" dari /dashboard/kursus -- pastikan ikut
       konsisten pakai URL baru
    4. Sebelum SQL dijalankan: akses /materi/1 dan /materi/2 manual --
       harus SUDAH notFound()/redirect kalau proteksi poin 1d jalan (tanpa
       perlu SQL sama sekali, karena ini proteksi di kode, independen dari
       status is_active)
    5. Jalankan SQL usulan di Supabase SQL Editor
    6. Ulangi cek /materi/1 dan /materi/2 -- pastikan tetap konsisten
    7. Pastikan /materi/3 (akses langsung by id) tetap berfungsi normal
       seperti sebelumnya (regresi, ini bukan yang dibagikan ke user tapi
       tidak boleh rusak)
  - Catatan usulan poin 3 (listing+toggle di Admin) kalau tidak dikerjakan
    sekarang, tulis sebagai "usulan belum dikerjakan, untuk didiskusikan
    terpisah" supaya tidak hilang dari radar.
- SARANKAN SATU PESAN COMMIT git yang ringkas dan jelas (format singkat,
  bahasa Indonesia atau Inggris konsisten dengan histori commit project ini
  -- cek dulu `git log --oneline -10` untuk menyesuaikan gaya), taruh di
  akhir laporan plan.md dan juga tampilkan di ringkasan akhir ke Alif supaya
  gampang disalin.
- JANGAN tandai apa pun DONE di feature-registry.md -- sama seperti
  temuan-temuan sebelumnya, ini menunggu Alif buka sendiri di browser dan
  konfirmasi SETELAH SQL dijalankan manual olehnya. Tambahkan pengingat yang
  sama di plan.md.
```

---

## Penjelasan untuk Alif

Ini bukan bug pada course yang sedang dipakai — sistem sudah punya logika otomatis (`getMateriHeroHref()`) yang memilih course aktif untuk tombol "Mulai Sekarang" di halaman pelatihan, dan logika itu sudah benar sejak awal. Yang jadi masalah cuma: angka id (`3`) itu ikut terlihat di URL, dan kalau ada yang iseng ganti jadi `1` atau `2` (sisa data uji coba lama dari sebelum LMS berbab dibangun — ada komentar di kode yang menjelaskan ini persis), dia akan melihat tampilan berantakan yang bisa disalahartikan sebagai bug.

Untuk permintaan Kakak — ganti `/materi/3` jadi URL bernama seperti `/materi/get-free-certificate-rpc` — saya pilihkan pendekatan **redirect statis**: dibuat halaman baru di URL itu yang begitu diakses langsung meneruskan (redirect) ke course aktif. Ini paling cepat dikerjakan dan tidak perlu ubah struktur database, dengan catatan: URL di address bar browser akan tetap berubah jadi `/materi/3` setelah redirect terjadi (itu perilaku normal redirect, bukan bisa dihindari) — tapi yang penting, **link yang diklik dari dalam aplikasi** (tombol "Mulai Sekarang", menu dashboard) semuanya akan pakai nama, bukan angka, jadi tidak akan pernah terlihat mengetik/membagikan angka `3` secara eksplisit.

Kalau ke depan Kakak mau URL akhirnya juga tidak pernah menampilkan angka sama sekali (termasuk setelah redirect), itu perlu pendekatan berbeda (kolom slug di database) — saya catat sebagai opsi lain kalau nanti dibutuhkan, tapi untuk sekarang redirect statis ini paling cukup untuk masalah yang Kakak khawatirkan.

**Perbaikan yang saya minta Cursor kerjakan:**
1. URL baru `/materi/get-free-certificate-rpc` yang redirect otomatis ke course aktif — dipakai di semua link dari dalam aplikasi (tombol "Mulai Sekarang", menu dashboard kursus).
2. Proteksi: kalau ada yang coba akses `/materi/1` atau `/materi/2` langsung, sistem akan menolak/redirect, bukan menampilkan data lama yang berantakan.
3. SQL usulan untuk menonaktifkan (bukan menghapus, supaya aman) baris data uji coba lama itu — akan saya siapkan untuk Kakak jalankan manual seperti biasa.
4. Saya juga minta Cursor mempertimbangkan (tapi belum tentu dikerjakan sekarang) menambah daftar semua materi di halaman Admin, supaya ke depannya kalau ada data uji coba baru lagi, Kakak/Abi bisa langsung nonaktifkan sendiri tanpa perlu ini terulang.

Saya sudah minta Cursor menulis hasil kerjanya ke `plan.md` sebagai bagian terpisah, dan menyarankan satu pesan commit di akhir supaya gampang Kakak pakai.

**Urutan kerja yang perlu Kakak lakukan:**
1. Tempel prompt di atas ke Cursor.
2. Setelah Cursor selesai, baca `plan.md` bagian baru untuk lihat detail perubahan dan pesan commit yang disarankan.
3. Uji urutan yang saya minta Cursor tulis di plan.md (cek URL baru, tombol "Mulai Sekarang", link dashboard, lalu /materi/1 dan /materi/2 sebelum & sesudah SQL, lalu regresi /materi/3 by id).
4. Jalankan SQL usulan (`usulan-sql-nonaktifkan-materi-lama.sql`) manual di Supabase SQL Editor — Cursor akan siapkan filenya, tapi verifikasi dulu isi id yang mau dinonaktifkan sebelum run, sesuai instruksi di file SQL-nya.
5. Kalau semua sudah diuji dan sesuai, baru konfirmasi ke saya supaya feature-registry.md bisa diupdate.
