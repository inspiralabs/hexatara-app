-- ============================================================
-- SQL 16 — LMS materi: video/gambar opsional per bab, lampiran file (ADR-018)
-- Dijalankan MANUAL oleh Alif di Supabase SQL Editor.
-- Jangan dieksekusi otomatis oleh AI coding assistant (larangan #2).
-- Referensi: ENGINEERING.md ADR-018, PANDUAN.md §12.5.3 (versi diperbarui)
--
-- KONTEKS: setelah uji coba pertama §12.5.3, ditemukan LMS materi butuh
-- video/gambar opsional per bab dan lampiran file yang bisa diunduh user
-- (pengganti kolom "komentar" di referensi visual, tidak relevan untuk
-- Hexatara). Ini murni PENAMBAHAN pada ADR-013 (material_chapters,
-- material_progress) yang SUDAH ADA — tidak mengubah/menghapus apa pun
-- dari SQL 15/15b.
--
-- Setelah dijalankan: pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================

-- ----------------------------------------------------------
-- BAGIAN 1 — video_url dan gambar_url opsional di material_chapters
-- Keduanya nullable dan independen: bab boleh teks saja, teks+video,
-- teks+gambar, atau teks+video+gambar. Admin bebas pilih kombinasi.
-- ----------------------------------------------------------

alter table material_chapters
  add column video_url text,
  add column gambar_url text;

comment on column material_chapters.video_url is 'URL video pengantar bab (opsional, embed player di atas konten). NULL = tidak ada video, bab teks-only atau teks+gambar saja.';
comment on column material_chapters.gambar_url is 'URL gambar pendukung bab (opsional, tampil di sela konten). NULL = tidak ada gambar. Independen dari video_url — bisa isi keduanya sekaligus.';


-- ----------------------------------------------------------
-- BAGIAN 2 — Lampiran file per bab (material_chapter_files)
-- Satu bab bisa punya banyak file (one-to-many), tiap file dwibahasa
-- untuk judul dan deskripsi, mengikuti konvensi proyek (_id/_en).
-- Tunduk pola reorder otomatis ADR-014 lewat kolom urutan.
-- ----------------------------------------------------------

create table material_chapter_files (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references material_chapters(id) on delete cascade,
  urutan integer not null default 0,
  judul_id text not null,
  judul_en text,
  deskripsi_id text,
  deskripsi_en text,
  url_file text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (chapter_id, urutan)
);

comment on table material_chapter_files is 'Lampiran file yang bisa diunduh user per bab materi (PDF, slide, dokumen referensi, dst). Pengganti fitur komentar di referensi visual LMS — Hexatara sengaja tidak punya fitur komentar/diskusi.';

create trigger set_updated_at before update on material_chapter_files
  for each row execute function set_updated_at();

alter table material_chapter_files enable row level security;

-- Publik (termasuk anonim) boleh baca daftar file — sama seperti bab materi sendiri,
-- konsisten dengan akses materi freemium tanpa login (PRD §8.1)
create policy "publik baca file lampiran bab" on material_chapter_files
  for select using (true);

create policy "admin kelola file lampiran bab" on material_chapter_files
  for all using (public.is_admin()) with check (public.is_admin());

-- CATATAN ADR-014 (reorder otomatis): kolom urutan di atas sudah cukup untuk
-- pola drag-and-drop reorder di sisi aplikasi, sama seperti material_chapters.


-- ============================================================
-- BAGIAN 3 — Data dummy: materi baru "Dasar Keselamatan Penerbangan Drone"
-- Dibuat SEBAGAI MATERI BARU (bukan mengisi uji_materi_pdf/ppt yang sudah
-- ada), supaya representatif untuk uji coba UI/UX LMS sebelum Admin panel
-- CRUD bab materi (§12.5.4) selesai dibuat. Boleh dihapus manual nanti
-- setelah Admin panel siap dan Admin mulai input materi asli.
--
-- Variasi bab sengaja dibuat berbeda-beda supaya semua kondisi kepakai
-- saat testing: ada bab teks-saja, ada teks+gambar, ada teks+video, ada
-- yang punya lampiran file dan yang tidak.
-- ============================================================

-- Skema materials dikonfirmasi lewat information_schema.columns terhadap
-- database live (2026-09-10): id bigint, judul_id text NOT NULL, judul_en
-- text, deskripsi_id text, deskripsi_en text, file_url text NOT NULL,
-- urutan integer NOT NULL default 0, is_active boolean NOT NULL default
-- true, updated_at timestamptz NOT NULL default now(), poster_url text.
--
-- CATATAN PENTING: file_url NOT NULL adalah sisa desain LAMA (materi flat
-- PDF/PPT, sebelum LMS berbab ADR-013). Kolom ini TIDAK dipakai lagi oleh
-- alur LMS baru (kontennya sekarang ada di material_chapters.konten_id/en),
-- tapi tetap wajib diisi karena constraint NOT NULL belum dilonggarkan —
-- diisi string kosong ('') di bawah sebagai nilai placeholder yang aman,
-- BUKAN dihapus constraint-nya (mengubah constraint kolom lama berisiko
-- memengaruhi materi lain yang mungkin masih memakai alur flat lama;
-- di luar scope ADR-018 ini).
--
-- CATATAN: bagian ini SENGAJA tidak memakai RETURNING/\gset (sintaks psql,
-- tidak berjalan di Supabase SQL Editor berbasis browser). Semua INSERT
-- di bawah memakai subquery "select id from materials where judul_id = ..."
-- untuk mengambil id materi yang baru dibuat — aman dijalankan langsung,
-- satu blok, dari atas ke bawah, tanpa langkah manual dua-tahap.

insert into materials (judul_id, judul_en, deskripsi_id, deskripsi_en, file_url, urutan, is_active)
values (
  'Dasar Keselamatan Penerbangan Drone',
  'Drone Flight Safety Basics',
  'Pelajari dasar keselamatan penerbangan drone sebelum mengerjakan kuis sertifikasi — mencakup pra-terbang, wilayah udara, dan prosedur darurat.',
  'Learn the basics of drone flight safety before taking the certification quiz — covering pre-flight checks, airspace, and emergency procedures.',
  '',
  0,
  true
);

-- Bab 1 — teks saja, tanpa video/gambar, tanpa lampiran file
insert into material_chapters (material_id, urutan, judul_id, judul_en, konten_id, konten_en, video_url, gambar_url)
select id, 1,
  'Pengenalan Keselamatan Penerbangan',
  'Introduction to Flight Safety',
  '<p>Keselamatan penerbangan drone dimulai dari persiapan sebelum lepas landas. Setiap penerbangan, sekecil apa pun tujuannya, wajib melalui pengecekan dasar terhadap kondisi baterai, firmware, dan area sekitar.</p><p>Modul ini akan membahas prinsip dasar yang berlaku untuk semua jenis drone, baik untuk keperluan hobi maupun operasional profesional seperti survei dan pemetaan.</p>',
  '<p>Drone flight safety begins with preparation before takeoff. Every flight, regardless of its purpose, requires basic checks on battery condition, firmware, and surrounding area.</p><p>This module covers fundamental principles that apply to all drone types, whether for hobby use or professional operations such as survey and mapping.</p>',
  null, null
from materials where judul_id = 'Dasar Keselamatan Penerbangan Drone';

-- Bab 2 — teks + gambar
insert into material_chapters (material_id, urutan, judul_id, judul_en, konten_id, konten_en, video_url, gambar_url)
select id, 2,
  'Pemeriksaan Pra-Terbang',
  'Pre-Flight Checklist',
  '<p>Sebelum menerbangkan drone, lakukan pemeriksaan berikut secara berurutan: kondisi fisik baling-baling, level baterai drone dan remote, kalibrasi kompas, dan sinyal GPS.</p><p>Gambar di bawah menunjukkan titik-titik pemeriksaan visual yang wajib dilakukan setiap kali sebelum lepas landas.</p>',
  '<p>Before flying a drone, perform the following checks in order: propeller physical condition, drone and remote battery level, compass calibration, and GPS signal.</p><p>The image below shows the visual inspection points required before every takeoff.</p>',
  null,
  'https://placehold.co/1200x675/1E40AF/FFFFFF?text=Contoh+Gambar+Pemeriksaan+Pra-Terbang'
from materials where judul_id = 'Dasar Keselamatan Penerbangan Drone';

-- Bab 3 — teks + video
insert into material_chapters (material_id, urutan, judul_id, judul_en, konten_id, konten_en, video_url, gambar_url)
select id, 3,
  'Memahami Wilayah Udara Terbatas',
  'Understanding Restricted Airspace',
  '<p>Tidak semua wilayah boleh diterbangi drone secara bebas. Wilayah seperti bandara, instalasi militer, dan area padat penduduk tertentu memiliki pembatasan ketinggian dan izin khusus.</p><p>Tonton video singkat berikut untuk memahami cara membaca peta wilayah udara sebelum merencanakan misi penerbangan.</p>',
  '<p>Not all areas allow free drone flight. Areas such as airports, military installations, and certain densely populated zones have altitude restrictions and special permit requirements.</p><p>Watch the short video below to understand how to read airspace maps before planning a flight mission.</p>',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null
from materials where judul_id = 'Dasar Keselamatan Penerbangan Drone';

-- Bab 4 — teks + gambar + video + lampiran file (kondisi paling lengkap)
insert into material_chapters (material_id, urutan, judul_id, judul_en, konten_id, konten_en, video_url, gambar_url)
select id, 4,
  'Prosedur Darurat dan Kehilangan Sinyal',
  'Emergency Procedures and Signal Loss',
  '<p>Kehilangan sinyal remote atau baterai kritis adalah dua skenario darurat paling umum. Ketahui fitur Return to Home (RTH) dan kapan harus melakukan pendaratan darurat manual.</p><p>Unduh lembar prosedur darurat di bagian File pada bab ini sebagai referensi cetak yang bisa dibawa saat terbang di lapangan.</p>',
  '<p>Remote signal loss or critical battery are the two most common emergency scenarios. Know the Return to Home (RTH) feature and when to perform a manual emergency landing.</p><p>Download the emergency procedure sheet in the File section of this chapter as a printable field reference.</p>',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://placehold.co/1200x675/F59E0B/111827?text=Diagram+Prosedur+Darurat'
from materials where judul_id = 'Dasar Keselamatan Penerbangan Drone';

-- Lampiran file untuk Bab 4 (dua file contoh, menunjukkan satu bab bisa
-- punya lebih dari satu lampiran)
insert into material_chapter_files (chapter_id, urutan, judul_id, judul_en, deskripsi_id, deskripsi_en, url_file)
select mc.id, 1,
  'Lembar Prosedur Darurat (Cetak)',
  'Emergency Procedure Sheet (Printable)',
  'Ringkasan satu halaman langkah-langkah darurat, cocok dicetak dan dibawa saat sesi terbang lapangan.',
  'One-page summary of emergency steps, suitable for printing and carrying during field flight sessions.',
  'https://example.com/dummy-files/prosedur-darurat-drone.pdf'
from material_chapters mc
join materials m on m.id = mc.material_id
where m.judul_id = 'Dasar Keselamatan Penerbangan Drone' and mc.urutan = 4;

insert into material_chapter_files (chapter_id, urutan, judul_id, judul_en, deskripsi_id, deskripsi_en, url_file)
select mc.id, 2,
  'Daftar Periksa Checklist RTH',
  'RTH Checklist',
  'Checklist konfigurasi Return to Home sebelum setiap misi penerbangan.',
  'Return to Home configuration checklist before every flight mission.',
  'https://example.com/dummy-files/checklist-rth.pdf'
from material_chapters mc
join materials m on m.id = mc.material_id
where m.judul_id = 'Dasar Keselamatan Penerbangan Drone' and mc.urutan = 4;

-- CATATAN: url_file dan gambar_url/video_url dummy di atas memakai domain
-- contoh (example.com, placehold.co, YouTube publik) HANYA untuk uji coba
-- tampilan. Ganti dengan URL bucket Supabase Storage yang sebenarnya
-- setelah Admin panel upload file (§12.5.4/§12.5.12) selesai dibuat, atau
-- upload manual dulu lewat Supabase Storage kalau ingin data dummy yang
-- benar-benar bisa diunduh.


-- ============================================================
-- SELESAI. Setelah dijalankan, generate ulang tipe TypeScript:
--   pnpm supabase gen types typescript --project-id REF > src/types/database.ts
-- ============================================================
