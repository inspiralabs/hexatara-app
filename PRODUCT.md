# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tiga peran (PRD.md §3): pengunjung anonim (calon peserta pelatihan drone, calon pembeli drone Autel, pihak ketiga yang memverifikasi sertifikat seperti HRD), pengguna Free Track (mendaftar mandiri untuk materi + kuis + sertifikat gratis), dan Admin Hexatara (satu tim non-teknis yang mengoperasikan seluruh sistem sendiri). Rentang usia pengunjung 17-70 tahun, literasi digital campuran, mayoritas mengakses lewat smartphone (PRD.md §1.2).

## Product Purpose

hexatara.com Fase 1 mengganti tiga proses manual Hexatara Indonesia (penyelenggara pelatihan pilot drone bersertifikat RPC dan penjual drone profesional Autel, Bekasi): katalog produk yang sebelumnya dikirim satu per satu lewat WhatsApp, keabsahan sertifikat yang sebelumnya dicek manual di spreadsheet, dan calon peserta yang sebelumnya dikenali lewat Google Form. Modul baru: jalur gratis (Free Track) — materi dan kuis gratis yang menghasilkan sertifikat, menarik calon peserta ke pelatihan berbayar (PRD.md §1.1).

## Positioning

Satu-satunya sistem verifikasi sertifikat pilot drone RPC di Indonesia yang bisa diperiksa publik tanpa login dan tanpa menghubungi Admin (BRD §2.3). Bukan LMS penuh dan bukan e-commerce — katalog adalah etalase dan penangkap lead, bukan toko; freemium adalah pintu masuk ke pelatihan berbayar, bukan sertifikasi bernilai penuh.

## Operating Context

**DKPPU Kementerian Perhubungan memeriksa website ini rutin tiap periode pelatihan bulanan** — downtime saat pemeriksaan adalah masalah kepatuhan, bukan sekadar bug. Ketersediaan menang atas fitur; tidak ada deploy berisiko menjelang periode pelatihan.

**Data sertifikat tidak dapat direkonstruksi kalau hilang** (BRD §8) — Supabase free tier tanpa point-in-time recovery, backup manual wajib teruji.

Sertifikat fisik bertanda tangan basah tetap diterbitkan untuk kepatuhan DKPPU; sistem verifikasi ini adalah alat bantu, bukan pengganti legalitas fisik. Delivery pelatihan berbayar (batch RPC) tetap manual lewat WhatsApp Group + Zoom — tidak ada LMS untuk kelas berbayar di Fase 1.

## Capabilities and Constraints

Stack terkunci (PRD.md §2, ADR-001 s/d ADR-017 di ENGINEERING.md): Next.js 15 App Router, TypeScript strict, Tailwind 4, shadcn/ui, Supabase (Postgres + Auth + Storage), next-intl (`localePrefix: 'as-needed'`, URL Indonesia tanpa prefix — dikunci permanen begitu QR sertifikat pertama dicetak), Resend, pdf-lib + qrcode, Tiptap, xlsx dari CDN SheetJS. Arsitektur monolit tertata, satu developer solo. Kode wajib portabel — sistem pindah dari Vercel ke Hostinger VPS setelah stabil, tidak ada API khusus Vercel.

25 larangan eksplisit (PRD.md §13) mencegah scope creep berulang: tanpa payment gateway, tanpa kupon/diskon/hitung mundur, tanpa ambang nilai kuis, tanpa validasi domain email/MX lookup di form B2B, tanpa WhatsApp Gateway/blast/chatbot, tanpa LMS untuk batch berbayar. Kuis freemium selalu berakhir 100% (correctable, bukan pass/fail). Sertifikat `free_track` tidak pernah kedaluwarsa; `existing_manual`/`rpc_certified` kedaluwarsa 2 tahun.

Dwibahasa Indonesia/Inggris lewat kolom ganda `_id`/`_en` untuk konten yang dikelola Admin (bukan tabel terjemahan terpisah), fallback ke Indonesia kalau kolom `_en` kosong. Admin Panel berbahasa Indonesia saja, di luar prefix locale.

## Brand Commitments

Nama produk: Hexatara / hexatara.com. Font tunggal Inter, tanpa font kedua, tanpa dark mode. Warna dasar terkunci di ENGINEERING.md §7 dan `design-system-v2.md`: `--warna-utama` #1E40AF (biru), `--warna-aksen` #F59E0B (oranye, satu-satunya warna CTA, flat tanpa gradient), `--warna-sukses` #059669, `--warna-bahaya` #DC2626. Filosofi visual: minimalis, elegan, profesional, tema putih (`design-system-v2.md`) — lihat DESIGN.md untuk sistem visual lengkap begitu ditulis.

## Evidence on Hand

Konten produksi (foto produk, dokumentasi instruktur, testimoni, materi PPT, bank soal kuis dua bahasa, template PDF sertifikat) sebagian besar masih ditunggu dari pihak Hexatara (lihat PRD.md §16) — jangan fabrikasi konten placeholder yang terlihat seperti data nyata di halaman publik manapun. Data sertifikat existing dan konten Bahasa Inggris tidak menahan go-live (fallback tersedia).

## Product Principles

- **Keterbacaan 3 detik** — penawaran inti (pelatihan drone dan penjualan drone) dipahami tanpa scroll dan tanpa membaca teks panjang.
- **Ketersediaan menang atas fitur** — konsekuensi langsung dari jadwal pemeriksaan DKPPU.
- **Mobile-first mutlak** — tulis untuk 375px dulu, lebarkan ke atas.
- **Aksesibilitas bukan preferensi gaya** — font besar dan kontras tinggi adalah persyaratan yang diuji, karena rentang usia pengguna sampai 70 tahun.
- **Kemandirian Admin** — setiap kemampuan CRUD dirancang supaya staf non-teknis Hexatara bisa mengoperasikannya sendiri tanpa bantuan developer.

## Accessibility & Inclusion

WCAG AA minimum (kontras 4.5:1), font dasar 16px (jangan lebih kecil), teks sekunder minimum 14px, area sentuh minimum 44x44px (PRD.md §12.3). Persyaratan ini diuji sebagai acceptance criteria, bukan aspirasi desain.
