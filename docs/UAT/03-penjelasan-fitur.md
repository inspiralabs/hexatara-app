# Penjelasan Fitur — Untuk Hexatara

**Tujuan dokumen ini:** menjelaskan setiap fitur dalam bahasa yang mudah dipahami, tanpa istilah teknis, dari sudut pandang pertanyaan yang biasanya muncul: **apa ini, kenapa dibutuhkan, bagaimana cara pakainya, apa batasannya, apa syaratnya.**

Urutan bagian dan nomor di dokumen ini **sama persis** dengan `02-skenario-uji-uat.md`, supaya waktu Hexatara bertanya "yang nomor A3 itu maksudnya apa", jawabannya ada di sini dengan nomor yang sama.

---

## Bagian A — Halaman Publik (bisa dibuka siapa saja, tanpa akun)

### A1. Halaman Depan (Landing Page)

**Apa ini?**
Halaman pertama yang dilihat pengunjung saat membuka website Hexatara. Isinya memperkenalkan dua hal: pelatihan pilot drone dan penjualan drone.

**Kenapa dibutuhkan?**
Ini "etalase" utama — tempat pengunjung pertama kali menilai Hexatara sebelum memutuskan mendaftar pelatihan atau membeli produk.

**Bagaimana cara pakainya?**
Hexatara tidak perlu programmer untuk mengubah isinya. Semua bagian yang berubah-ubah — pengumuman (pop-up), banner promo, foto besar di atas (hero), jadwal pelatihan, profil instruktur, cerita perusahaan, testimoni pelanggan — semuanya diatur dari menu Admin. Begitu disimpan di Admin, perubahan langsung tampil di situs, tanpa perlu "upload ulang" atau menunggu.

**Apa batasannya?**
Banner promo hanya berupa tulisan yang bisa dinyalakan/dimatikan — **tidak** bisa dibuat jadi mesin diskon otomatis, kupon, harga dicoret, atau hitung mundur waktu. Kalau nanti butuh itu, itu pengembangan tambahan di luar yang sudah dibangun sekarang.

**Apa syaratnya?**
Supaya halaman depan tidak kosong/aneh saat pertama kali dilihat Abi, sebaiknya sudah diisi dulu: profil perusahaan, minimal satu jadwal pelatihan aktif, dan nomor WhatsApp yang benar.

---

### A2. Halaman Pelatihan & Formulir Pendaftaran

**Apa ini?**
Daftar semua jadwal pelatihan yang dibuka Hexatara, lengkap dengan halaman detail per jadwal (manfaat ikut pelatihan, syarat, materi yang diajarkan, peralatan yang dipakai, pertanyaan umum, foto-foto kegiatan) dan formulir pendaftaran resmi.

**Kenapa dibutuhkan?**
Ini pengganti cara lama yang tadinya hanya menangkap "minat" (nama + WhatsApp saja) lalu dilanjutkan manual di WhatsApp. Sekarang datanya lebih lengkap — termasuk identitas dan dokumen — langsung tersimpan rapi di sistem, sehingga Admin tidak perlu menyalin-nyalin data dari chat WhatsApp.

**Bagaimana cara pakainya?**
Calon peserta memilih jadwal, membaca detailnya, lalu mengisi formulir pendaftaran lengkap. Data tersimpan otomatis ke sistem — Admin bisa melihatnya di menu "Peserta Pendaftaran". Setelah itu, komunikasi lanjutan (konfirmasi, pembayaran pelatihan, dsb.) tetap dilakukan manual oleh Admin lewat WhatsApp, karena ini bukan sistem pembayaran online.

**Apa batasannya?**
Setelah peserta mengisi formulir, sistem **tidak** otomatis membuka WhatsApp atau mengirim pesan apa pun ke peserta. Itu langkah manual yang dilakukan Admin. Juga, sistem **belum** mengirim email otomatis ke Admin setiap ada pendaftaran baru masuk (ini yang ditahan untuk Fase 2 — lihat penjelasan di bagian D).

**Apa syaratnya?**
Setiap jadwal pelatihan yang dibuka minimal harus punya: nama, tanggal, status (aktif/tutup), dan nomor WhatsApp yang sesuai jenis pelatihannya (reguler atau private/inhouse punya nomor kontak Admin yang berbeda).

---

### A3. Verifikasi Sertifikat

**Apa ini?**
Halaman publik di mana siapa saja — misalnya calon klien Hexatara yang ingin memastikan seorang pilot benar-benar bersertifikat — bisa mengecek keaslian sertifikat hanya dengan memasukkan nomor sertifikat, atau memindai (scan) kode QR yang ada di sertifikat fisik/PDF.

**Kenapa dibutuhkan?**
Ini fitur kepercayaan (trust). Sertifikat yang bisa diverifikasi publik jauh lebih kredibel dibanding sertifikat kertas yang tidak bisa dicek ulang. Ini juga melindungi Hexatara dari sertifikat palsu yang mengatasnamakan Hexatara.

**Bagaimana cara pakainya?**
Pengunjung membuka halaman Verifikasi, mengetik nomor sertifikat (atau memindai QR di sertifikat), lalu sistem menampilkan salah satu dari empat kemungkinan: sertifikat **masih berlaku**, sertifikat **sudah kedaluwarsa**, sertifikat **tanpa masa berlaku** (khusus Sertifikat Gratis), atau nomor **tidak ditemukan** sama sekali.

**Apa batasannya?**
Untuk menjaga privasi, halaman ini **sengaja hanya** menampilkan lima informasi: nama pemegang, nomor sertifikat, tanggal terbit, masa berlaku, dan status. Data pribadi lain seperti email, nomor telepon, atau alamat **tidak pernah** ditampilkan di halaman ini. Halaman ini juga tidak bisa mencari berdasarkan nama — hanya berdasarkan nomor atau QR, supaya orang tidak bisa "mengintip" semua nama peserta Hexatara hanya dengan menebak-nebak.

**Apa syaratnya?**
Sertifikat yang ingin bisa dicek di sini harus sudah dimasukkan ke sistem oleh Admin (satu per satu, atau lewat impor massal). Sertifikat lama yang pernah diterbitkan Hexatara sebelum sistem ini ada **tidak otomatis muncul** di sini — itu perlu proses pemindahan data (migrasi) terlebih dulu, lihat dokumen persiapan.

---

### A4. Katalog Produk

**Apa ini?**
Halaman "etalase" drone yang dijual Hexatara — bukan toko online. Pengunjung bisa melihat produk, lalu menghubungi Hexatara lewat WhatsApp atau mengisi formulir minta penawaran harga.

**Kenapa dibutuhkan?**
Menangkap minat calon pembeli drone secara terstruktur, tanpa harus membangun sistem pembayaran/checkout online yang rumit dan belum tentu dibutuhkan di tahap ini.

**Bagaimana cara pakainya?**
Admin mengatur produk apa saja yang tampil, dengan foto, deskripsi, dan harga. Untuk produk tertentu yang harganya tidak ingin ditampilkan terbuka (misalnya karena nego per klien), Admin bisa mematikan tampilan harga — pengunjung akan melihat tulisan "Hubungi kami untuk harga" sebagai gantinya. Pengunjung yang tertarik bisa langsung chat WhatsApp (pesannya otomatis sudah menyebut nama produk), atau mengisi formulir "Minta Penawaran" yang membuat Admin menerima email pemberitahuan otomatis.

**Apa batasannya?**
Tidak ada keranjang belanja, tidak ada checkout, tidak ada pembayaran online untuk produk. Semua transaksi produk tetap dilakukan manual antara Admin dan calon pembeli. Sistem juga tidak menghasilkan dokumen penawaran (quotation) atau invoice otomatis — itu tetap dibuat manual oleh tim Hexatara.

**Apa syaratnya?**
Alamat email tujuan notifikasi permintaan penawaran harus sudah diisi di Pengaturan, kalau tidak, Admin tidak akan tahu ada permintaan baru kecuali membuka menu Leads secara manual.

---

### A5. Materi Belajar & Kuis (Jalur Sertifikat Gratis)

**Apa ini?**
Bagian belajar mandiri gratis: pengunjung membaca materi keselamatan terbang drone yang disusun berbab (seperti bab dalam buku), lalu mengerjakan kuis untuk menguji pemahaman. Ini semua bisa dilakukan **tanpa perlu bikin akun dulu** — akun baru dibutuhkan saat pengunjung ingin mendapatkan sertifikatnya.

**Kenapa dibutuhkan?**
Ini jalur "Sertifikat Gratis" Hexatara — cara memberi nilai tambah dan menjaring calon pelanggan lewat edukasi gratis, sebelum mereka memutuskan upgrade ke sertifikat resmi berbayar.

**Bagaimana cara pakainya?**
Pengunjung membaca bab demi bab secara berurutan — bab berikutnya baru terbuka setelah bab sebelumnya selesai dibaca sampai akhir. Setelah semua bab selesai, tab kuis terbuka. Kuis ini bersifat "boleh coba lagi" — kalau jawaban salah, langsung muncul penjelasan kenapa salah, dan peserta boleh mengganti jawaban. Tidak ada status "gagal ujian".

**Apa batasannya?**
Tidak ada batas waktu pengerjaan kuis, tidak ada nilai minimum kelulusan, dan sistem tidak menyimpan riwayat berapa kali seseorang mencoba. Materi ini juga khusus untuk jalur Sertifikat Gratis — bukan materi pelatihan berbayar (pelatihan reguler/private tetap dengan metode tatap muka/WhatsApp Group + Zoom seperti biasa, tidak lewat sistem belajar online ini).

**Apa syaratnya?**
Materi (bab-bab) dan soal kuis (lengkap dengan penjelasan tiap pilihan jawaban, bukan cuma kunci jawaban) harus disiapkan oleh Hexatara — ini bagian konten yang paling perlu segera dilengkapi karena tanpa ini, jalur Sertifikat Gratis tidak bisa diuji sama sekali.

---

## Bagian B — Untuk Pengguna Terdaftar (setelah punya akun)

### B1. Daftar Akun & Verifikasi Email

**Apa ini?**
Proses membuat akun setelah menyelesaikan kuis, supaya sistem tahu siapa yang berhak atas sertifikat tersebut.

**Kenapa dibutuhkan?**
Sertifikat adalah dokumen yang terikat ke identitas seseorang — sistem perlu tahu itu benar-benar akun orang tersebut, bukan orang lain yang kebetulan tahu hasil kuisnya.

**Bagaimana cara pakainya?**
Setelah kuis selesai, pengunjung mengisi data untuk membuat akun, lalu menerima email berisi link verifikasi. Setelah link diklik, akun aktif dan langsung masuk ke dashboard pribadi. Kalau sebelumnya sudah punya akun dan sudah login, langkah daftar ulang ini dilewati otomatis.

**Apa batasannya?**
Tidak ada login lewat Google/media sosial — hanya email dan kata sandi.

**Apa syaratnya?**
Pengiriman email verifikasi bergantung pada layanan email yang sudah dikonfigurasi (Resend) — kalau domain email produksi Hexatara belum aktif, pengiriman tetap bisa berjalan lewat email sementara, tapi sebaiknya diuji dulu bahwa email benar-benar masuk ke inbox (bukan folder spam).

---

### B2. Dashboard Peserta

**Apa ini?**
Halaman pribadi setelah login, tempat peserta melihat sertifikat (masih pratinjau atau sudah resmi), mengajukan upgrade ke sertifikat resmi, melihat status transaksi, dan mengatur profil.

**Kenapa dibutuhkan?**
Satu tempat terpusat bagi peserta untuk memantau progres mereka, dari selesai kuis sampai punya sertifikat resmi di tangan.

**Bagaimana cara pakainya?**
Sebelum upgrade, peserta hanya melihat pratinjau sertifikat dengan kode QR yang sengaja diburamkan (belum bisa dipakai/discan) — ini menandakan sertifikat belum resmi. Untuk membuat sertifikat resmi, peserta membuka menu "Transaksi Saya", memilih paket (sertifikat saja, atau sertifikat plus merchandise), lalu mengunggah bukti transfer sesuai nominal dan rekening yang tertera (data ini diambil dari yang diatur Admin di Pengaturan).

**Apa batasannya?**
Sistem **tidak** memverifikasi pembayaran secara otomatis (misalnya cek mutasi rekening) — bukti transfer yang diunggah tetap harus dicek dan disetujui manual oleh Admin.

**Apa syaratnya?**
Nomor rekening dan nominal harga upgrade wajib sudah diisi Admin di Pengaturan, kalau tidak, peserta akan melihat data kosong atau salah saat mengajukan upgrade.

---

### B3. Setelah Upgrade Disetujui

**Apa ini?**
Tahap ketika Admin sudah mengecek dan menyetujui bukti transfer, sehingga sertifikat resmi otomatis diterbitkan.

**Kenapa dibutuhkan?**
Ini titik pertemuan sistem manual (transfer bank) dengan sistem otomatis (penerbitan sertifikat) — begitu Admin klik setuju, semuanya berjalan sendiri tanpa perlu langkah teknis tambahan.

**Bagaimana cara pakainya?**
Setelah disetujui: QR di dashboard peserta tidak lagi buram, email pemberitahuan terkirim ke peserta, dan nomor sertifikatnya langsung bisa dicek siapa saja lewat halaman Verifikasi publik (A3).

**Apa batasannya?**
Kalau pembuatan file PDF sertifikatnya gagal karena sebab teknis, persetujuan **tetap tercatat** dan sertifikat tetap aktif di database — hanya file PDF-nya yang perlu dibuat ulang. Ini sengaja dirancang begitu supaya kegagalan kecil di satu bagian tidak membatalkan keseluruhan proses.

**Apa syaratnya?**
Desain resmi PDF sertifikat dari Hexatara — tanpa ini, PDF yang dihasilkan memakai desain sementara yang belum tentu sesuai standar visual Hexatara.

---

## Bagian C — Untuk Admin Hexatara

### C1. Kelola Konten & Pelatihan

**Apa ini?**
Menu-menu di Admin untuk mengatur semua isi halaman publik — landing page, jadwal pelatihan, dan kategorinya — tanpa perlu tahu coding sama sekali.

**Kenapa dibutuhkan?**
Supaya Hexatara mandiri mengelola kontennya sendiri sehari-hari, tanpa harus selalu minta bantuan programmer setiap kali ada perubahan jadwal atau foto.

**Bagaimana cara pakainya?**
Semua menu di Admin memakai formulir isi-simpan yang sama sederhananya dengan mengisi Google Form. Ada fitur "salin dari batch" untuk membuat jadwal baru dengan cepat berdasarkan jadwal yang sudah ada, tinggal ubah tanggal dan detail yang berbeda.

**Apa batasannya?**
Perubahan yang dilakukan di Admin langsung tayang ke publik — tidak ada mode "draft" yang perlu di-publish terpisah. Jadi perlu hati-hati sebelum menyimpan perubahan besar saat jam sibuk.

**Apa syaratnya?**
Akun Admin dengan hak akses yang sesuai.

---

### C2. Kelola Sertifikat & Persetujuan Upgrade

**Apa ini?**
Menu untuk menambah/mengubah/menghapus data sertifikat, mengimpor banyak sertifikat sekaligus dari file Excel/CSV, serta menyetujui atau menolak pengajuan upgrade dari peserta.

**Kenapa dibutuhkan?**
Ini "dapur" dari seluruh sistem sertifikat dan Verifikasi publik — data yang Admin masukkan di sinilah yang menentukan apa yang bisa dicek orang lain di halaman Verifikasi.

**Bagaimana cara pakainya?**
Untuk sertifikat satuan, Admin cukup isi form, nomor bisa dibuat otomatis oleh sistem. Untuk banyak sertifikat sekaligus (misalnya migrasi data lama), Admin bisa mengunggah file — sistem akan memproses baris demi baris dan melaporkan baris mana yang berhasil dan mana yang gagal (beserta alasannya), tanpa membatalkan baris yang sudah benar. Untuk persetujuan upgrade, Admin melihat daftar pengajuan beserta bukti transfernya, lalu klik setuju atau tolak.

**Apa batasannya?**
Sistem tidak mengecek keaslian bukti transfer secara otomatis (bukan OCR atau cek ke bank) — itu tetap penilaian manual Admin melihat gambar/PDF bukti yang diunggah peserta.

**Apa syaratnya?**
Kalau ingin memakai fitur impor massal untuk sertifikat lama, siapkan datanya dalam bentuk Excel/CSV, dan tentukan dulu apakah nomor lama dipakai apa adanya atau diberi nomor baru sesuai format sistem.

---

### C3. Kelola Materi & Soal Kuis

**Apa ini?**
Menu untuk mengisi bab-bab materi belajar beserta lampiran berkas, dan mengelola bank soal kuis lengkap dengan penjelasan tiap pilihan jawaban.

**Kenapa dibutuhkan?**
Konten inilah yang membuat jalur Sertifikat Gratis benar-benar berfungsi sebagai sarana edukasi, bukan cuma kuis tebak-tebakan.

**Bagaimana cara pakainya?**
Admin menambahkan bab satu per satu (bisa dilampiri file pendukung), lalu menambahkan soal-soal dengan beberapa pilihan jawaban dan penjelasan untuk tiap pilihan — termasuk kenapa pilihan yang salah itu salah, bukan cuma menandai jawaban benarnya saja.

**Apa batasannya?**
Tidak ada fitur untuk mengatur nilai kelulusan minimum atau membatasi jumlah percobaan kuis peserta — desain sistem ini memang mengutamakan pemahaman lewat pengulangan, bukan lewat sistem lulus/gagal.

**Apa syaratnya?**
Naskah materi dan soal dari Hexatara — ini salah satu yang paling ditunggu tim InspiraLabs karena tanpa ini, jalur Sertifikat Gratis tidak bisa diuji.

---

### C4. Kelola Produk & Permintaan Penawaran

**Apa ini?**
Menu untuk mengatur produk yang tampil di katalog, serta melihat dan menindaklanjuti daftar orang yang mengisi formulir "Minta Penawaran".

**Kenapa dibutuhkan?**
Ini yang mengubah pengunjung katalog yang sekadar lihat-lihat menjadi calon pembeli yang bisa ditindaklanjuti tim sales Hexatara.

**Bagaimana cara pakainya?**
Admin mengatur produk (foto, harga, kategori, urutan tampil, status aktif/nonaktif), dan bisa melihat semua permintaan penawaran yang masuk di satu daftar, mengubah statusnya (misalnya dari "Baru" jadi "Dihubungi" lalu "Selesai" setelah ditindaklanjuti), serta mengunduh semuanya sebagai file Excel untuk direkap.

**Apa batasannya?**
Tidak ada fitur mengirim balasan otomatis ke calon pembeli dari dalam sistem — tindak lanjut (WhatsApp, telepon, email) tetap dilakukan manual oleh tim Hexatara di luar sistem.

**Apa syaratnya?**
Alamat email notifikasi Admin harus diisi supaya setiap ada penawaran baru masuk, Admin langsung tahu lewat email, tidak perlu terus-menerus membuka Admin untuk mengecek.

---

### C5. Kelola Pendaftaran Pelatihan

**Apa ini?**
Menu untuk melihat siapa saja yang mendaftar tiap jadwal pelatihan, lengkap dengan data dan dokumen yang mereka isi.

**Kenapa dibutuhkan?**
Menggantikan cara lama mencatat pendaftar manual dari chat WhatsApp satu-satu — sekarang semua data pendaftar rapi dalam satu tempat, bisa difilter per jadwal.

**Bagaimana cara pakainya?**
Admin membuka daftar pendaftar, bisa menyaring berdasarkan jadwal pelatihan tertentu, dan membuka detail tiap pendaftar untuk melihat kelengkapan datanya.

**Apa batasannya?**
Saat ini, sistem **belum** mengirim email otomatis ke Admin setiap kali ada pendaftar baru masuk — Admin perlu membuka menu ini secara berkala untuk mengecek pendaftar terbaru. Notifikasi email otomatis untuk pendaftaran ini sudah direncanakan tapi **ditahan untuk Fase 2** (sudah dipersiapkan di dalam kode, tinggal diaktifkan nanti).

**Apa syaratnya?**
Tidak ada syarat data tambahan — menu ini otomatis terisi begitu ada yang mendaftar lewat A2.

---

### C6. Pengaturan Umum

**Apa ini?**
Satu halaman pusat berisi semua data yang dipakai di berbagai bagian sistem: rekening bank, nomor-nomor WhatsApp, email kontak dan email notifikasi, jam operasional, dan harga upgrade sertifikat.

**Kenapa dibutuhkan?**
Supaya Admin tidak perlu mengubah data yang sama di banyak tempat berbeda — cukup ubah sekali di sini, semua halaman yang memakainya otomatis ikut berubah.

**Bagaimana cara pakainya?**
Admin membuka menu Pengaturan, mengisi/mengubah data di form yang tersedia, lalu simpan. Perubahan langsung berlaku ke seluruh sistem — tidak perlu restart atau proses tambahan apa pun.

**Apa batasannya?**
Ini bukan tempat untuk mengubah desain atau layout situs — hanya data/isi (rekening, kontak, harga, jam operasional).

**Apa syaratnya?**
Inilah halaman yang **paling wajib diisi lengkap dan benar sebelum UAT dimulai** — lihat dokumen `01-persiapan-hexatara.md`.

---

### C7. Login & Ringkasan Admin

**Apa ini?**
Pintu masuk khusus Admin (terpisah dari akun peserta biasa) dan halaman ringkasan (Overview) yang menampilkan gambaran umum aktivitas sistem.

**Kenapa dibutuhkan?**
Memisahkan hak akses — Admin punya akses penuh ke semua data, sementara peserta hanya bisa melihat datanya sendiri.

**Bagaimana cara pakainya?**
Admin login lewat halaman Admin (bukan halaman login peserta biasa), lalu langsung melihat ringkasan angka-angka penting (jumlah pendaftar, sertifikat, penawaran masuk, dsb.) di halaman Overview.

**Apa batasannya?**
Akun Admin sistem ini terpisah dari akun media sosial atau email pribadi Hexatara — perlu dibuatkan/diatur khusus.

**Apa syaratnya?**
Data login Admin yang aman dan hanya diketahui pihak yang berwenang.

---

## Bagian D — Hal yang Sengaja Belum Ada (Pertanyaan yang Mungkin Muncul)

Bagian ini menjawab lebih dulu pertanyaan yang kemungkinan besar muncul dari Hexatara saat melihat sistem berjalan.

**"Kenapa saat saya isi form pendaftaran pelatihan, tidak ada email masuk ke Admin?"**
Karena notifikasi email otomatis untuk pendaftaran pelatihan **sengaja ditahan** untuk Fase 2 — ini keputusan yang sudah dicatat dan disepakati (24 September 2026), bukan sesuatu yang terlewat dibangun. Kode untuk fitur ini sudah disiapkan sebagian, tinggal diaktifkan saat Fase 2 berjalan. Untuk saat ini, Admin mengecek pendaftar baru lewat menu Peserta Pendaftaran secara berkala. Notifikasi email untuk permintaan penawaran produk (katalog) **sudah aktif** — bedanya karena jalur itu memang yang disepakati aktif di Fase 1.

**"Kenapa tidak bisa bayar online langsung di website?"**
Karena Fase 1 sengaja memakai proses transfer manual + verifikasi Admin, bukan payment gateway otomatis. Payment gateway direncanakan untuk Fase 2.

**"Kenapa form 'minat cepat' yang dulu ada sekarang hilang?"**
Karena sudah digantikan dengan form pendaftaran lengkap yang lebih detail (termasuk identitas dan dokumen), sehingga Admin tidak perlu lagi menyalin data dari chat WhatsApp satu per satu. Data lama dari form tersebut tidak dihapus, hanya tidak lagi dipakai.

**"Apakah sertifikat lama Hexatara (sebelum sistem ini) bisa dicek juga di halaman Verifikasi?"**
Bisa, tapi perlu proses pemindahan data terlebih dulu (lihat dokumen persiapan `01-persiapan-hexatara.md`) — sistem tidak otomatis "tahu" data sertifikat yang diterbitkan sebelum sistem ini dipakai.

**"Kenapa ada dua tempat pelatihan — satu di 'Pelatihan' dan satu di materi belajar gratis?"**
Karena keduanya memang dua hal berbeda: halaman Pelatihan adalah untuk mendaftar pelatihan tatap muka berbayar (reguler/private/inhouse), sedangkan materi belajar gratis adalah jalur edukasi mandiri online yang berujung pada Sertifikat Gratis. Keduanya sengaja dipisah karena alurnya memang berbeda.

---

*Dokumen ini mengikuti kondisi sistem per 24 September 2026. Untuk detail teknis lebih dalam (nama tabel database, nama berkas kode), lihat `docs/AS_BUILT/` — dokumen itu untuk keperluan internal InspiraLabs dan pengembang di masa depan, bukan untuk dibagikan ke Hexatara.*
