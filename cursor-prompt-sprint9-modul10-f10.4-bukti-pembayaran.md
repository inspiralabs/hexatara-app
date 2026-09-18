# Prompt Cursor — F10.4: Bukti Pembayaran saat Menyetujui Pendaftaran Batch (ADR-023)

> Acuan: `ENGINEERING.md` ADR-023 (Bagian 10), `PRD.md` §5.1f dan §9e (khusus 9e.6), `feature-registry.md` Sprint 9.
> Sprint 9 / Modul 10. **SQL SUDAH dijalankan Alif dan dikonfirmasi berhasil** (`usulan-sql-modul10-adr023.sql`, satu kolom baru `batch_registrations.bukti_url`) — aman untuk mulai.
>
> Governance yang tetap berlaku penuh (CLAUDE.md/PRD.md §13.1): JANGAN menambah tabel/kolom di luar `batch_registrations.bukti_url` yang sudah didefinisikan di PRD.md §5.1f. JANGAN menjalankan DDL apa pun sendiri — SQL sudah dijalankan manual oleh Alif. JANGAN menambah dependency baru tanpa izin eksplisit — bucket storage dan pola signed URL yang dibutuhkan sudah tersedia lewat `@supabase/supabase-js` yang terpasang.

## 0. Konteks yang WAJIB dipahami dulu sebelum mengubah kode

Baca dulu file-file ini secara utuh:

- `src/app/[locale]/(user)/actions.ts` — CONTOH POLA upload bukti pembayaran yang sudah jalan (`certificate_orders.bukti_url`, bucket `payment-proofs`, path `${orderId}.${ext}`). Tiru pola storage-nya, TAPI actor-nya beda (di sana USER upload, di F10.4 ADMIN yang upload).
- `src/app/admin/(protected)/upgrade/page.tsx` — CONTOH POLA menampilkan bukti lewat signed URL (`createSignedUrl(path, 300)`) ke Admin. Tiru persis untuk menampilkan bukti di `peserta-pendaftaran-detail.tsx`.
- `src/app/admin/(protected)/pendaftaran-batch/actions.ts` — `setujuiPendaftaranBatchAction`/`tolakPendaftaranBatchAction` yang akan diubah.
- `src/app/admin/(protected)/pendaftaran-batch/pendaftaran-batch-row-actions.tsx` — popup konfirmasi Setujui yang akan diberi input upload.
- `src/app/admin/(protected)/peserta-pendaftaran/peserta-pendaftaran-detail.tsx` dan `src/app/admin/(protected)/peserta-pendaftaran/actions.ts` — tempat bukti pembayaran ditampilkan, cek dulu bagaimana foto KTP/pas foto sudah ditampilkan di dialog yang sama untuk mengikuti pola visualnya.
- `src/lib/supabase/admin.ts` — `createAdminClient()`, dipakai untuk operasi storage bucket privat.
- `src/types/database.ts` — cek ulang `batch_registrations.bukti_url` sudah muncul di tipe `Row`/`Insert`/`Update` setelah regenerate.

---

## Konteks — pola yang sudah terbukti, JANGAN dirancang ulang dari nol

Proyek ini SUDAH punya alur bukti pembayaran yang jalan di `certificate_orders.bukti_url` (alur upgrade sertifikat) — bucket privat `payment-proofs`, path stabil `${orderId}.${ext}`, `createSignedUrl(path, 300)` untuk ditampilkan ke Admin. Lihat `src/app/[locale]/(user)/actions.ts` (upload) dan `src/app/admin/(protected)/upgrade/page.tsx` (baca lewat signed URL).

**BEDA PENTING dengan pola itu:** di `certificate_orders`, USER yang upload bukti sendiri. Di sini, sesuai permintaan Alif, ADMIN yang upload bukti (mewakili peserta) DI DALAM popup konfirmasi "Setujui" — bukan peserta yang upload sendiri lewat form publik. Jangan disamakan actor-nya, cuma pola storage/signed-URL-nya yang direuse.

Bucket `payment-proofs` DIREUSE (bukan bucket baru) — path baru `batch-${registrasiId}.${ext}` supaya tidak bentrok dengan path `certificate_orders` yang sudah pakai `${orderId}.${ext}` polos.

---

## 1. Skema & tipe

- `src/types/database.ts` — regenerate ulang setelah SQL `usulan-sql-modul10-adr023.sql` dijalankan Alif, pastikan `batch_registrations.bukti_url` muncul di tipe `Row`/`Insert`/`Update`.

## 2. Server action — upload bukti + setujui jadi satu langkah

Edit `src/app/admin/(protected)/pendaftaran-batch/actions.ts`. Fungsi `setujuiPendaftaranBatchAction` saat ini:

```ts
export async function setujuiPendaftaranBatchAction(registrasiId: number) {
  const claims = await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('batch_registrations')
    .update({
      status: 'disetujui',
      alasan_tolak: null,
      verified_by: claims.sub,
      verified_at: new Date().toISOString(),
    })
    .eq('id', registrasiId)
    .eq('status', 'menunggu_verifikasi')
    .select('id')
    .single();
  // ...
}
```

Ubah signature-nya menerima `FormData` (berisi file bukti), upload dulu ke bucket `payment-proofs` pakai admin client (pola sama `lib/supabase/admin.ts` yang sudah dipakai di modul lain), BARU update status kalau upload berhasil:

```ts
import { createAdminClient } from '@/lib/supabase/admin';

export async function setujuiPendaftaranBatchAction(registrasiId: number, formData: FormData) {
  const claims = await requireAdmin();
  const supabase = await createClient();

  const file = formData.get('bukti');
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    return { ok: false as const, pesan: 'Bukti pembayaran wajib diunggah (berkas gambar).' };
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `batch-${registrasiId}.${ext}`;
  const supabaseAdmin = createAdminClient();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('payment-proofs')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error('[pendaftaran-batch] gagal unggah bukti:', uploadError);
    return { ok: false as const, pesan: 'Gagal mengunggah bukti pembayaran. Coba lagi.' };
  }

  const { data, error } = await supabase
    .from('batch_registrations')
    .update({
      status: 'disetujui',
      bukti_url: path,
      alasan_tolak: null,
      verified_by: claims.sub,
      verified_at: new Date().toISOString(),
    })
    .eq('id', registrasiId)
    .eq('status', 'menunggu_verifikasi')
    .select('id')
    .single();

  if (error || !data) {
    console.error('[pendaftaran-batch] gagal setujui:', error);
    return { ok: false as const, pesan: 'Gagal menyetujui pendaftaran. Coba lagi.' };
  }

  return { ok: true as const };
}
```

`tolakPendaftaranBatchAction` TIDAK berubah — penolakan tidak butuh bukti pembayaran.

## 3. UI — popup Setujui minta upload bukti dulu

Edit `src/app/admin/(protected)/pendaftaran-batch/pendaftaran-batch-row-actions.tsx`. Tambahkan state file bukti, input upload gambar di dalam `AlertDialogContent` "Setujui pendaftaran ini?", dan validasi tombol Setuju tetap disabled sampai ada file dipilih:

```tsx
const [buktiFile, setBuktiFile] = useState<File | null>(null);

function konfirmasiSetujui() {
  if (!buktiFile) return;
  startTransition(async () => {
    const fd = new FormData();
    fd.append('bukti', buktiFile);
    const hasil = await setujuiPendaftaranBatchAction(registrasiId, fd);
    if (!hasil.ok) {
      toast.error(hasil.pesan);
      return;
    }
    setSetujuiOpen(false);
    setBuktiFile(null);
    toast.success('Pendaftaran disetujui.');
    router.refresh();
  });
}
```

Di dalam `AlertDialogContent` popup Setujui, tambahkan input file sebelum footer (boleh reuse pola input file sederhana yang sudah ada di komponen lain, atau `<input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files?.[0] ?? null)} />` yang distyling mengikuti `Input`/`FormControl` yang sudah ada di proyek). Tampilkan nama file yang dipilih sebagai konfirmasi visual. Tombol `AlertDialogAction` (Setuju) diberi `disabled={pending || !buktiFile}`.

Terapkan varian warna tombol dari F10.1 kalau F10.1 sudah dikerjakan duluan (`variant="success"` untuk tombol Setuju) — kalau belum, biarkan varian default dulu, tidak menghalangi F10.4 selesai lebih dulu.

## 4. Tampilkan bukti di detail Peserta Pendaftaran

Edit `src/app/admin/(protected)/peserta-pendaftaran/page.tsx` (atau file query datanya kalau terpisah) — tambahkan `bukti_url` ke kolom yang di-select dari `batch_registrations`, lalu generate signed URL mengikuti pola PERSIS `admin/upgrade/page.tsx`:

```ts
const supabaseAdmin = createAdminClient();
// ... setelah query utama
const pesertaDenganBukti = await Promise.all(
  (peserta ?? []).map(async (p) => {
    let buktiUrl: string | null = null;
    if (p.bukti_url) {
      const { data: signed } = await supabaseAdmin.storage
        .from('payment-proofs')
        .createSignedUrl(p.bukti_url, 300);
      buktiUrl = signed?.signedUrl ?? null;
    }
    return { ...p, buktiUrl };
  })
);
```

Teruskan `buktiUrl` ke `peserta-pendaftaran-detail.tsx` (dialog Detail) dan tampilkan sebagai gambar di dalam dialog — cek dulu bagaimana foto KTP/pas foto sudah ditampilkan di dialog yang sama (kemungkinan pola serupa: `<img>` dengan `onClick` untuk perbesar, atau langsung ditampilkan) dan ikuti pola visual yang sama, taruh section "Bukti Pembayaran" setelah section identitas/foto yang sudah ada.

---

## Sebelum melapor selesai

1. `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` bersih.
2. Uji manual: buka `admin/pendaftaran-batch`, klik Setuju pada satu baris "menunggu_verifikasi" — pastikan tombol Setuju TIDAK BISA diklik sebelum file bukti dipilih, upload satu gambar, klik Setuju — status berubah jadi disetujui.
3. Buka `admin/peserta-pendaftaran`, cari peserta yang baru saja disetujui, buka Detail — pastikan bukti pembayaran yang baru diupload tampil sebagai gambar (bukan link mentah/rusak).
4. Cek peserta LAMA (disetujui sebelum fitur ini ada, `bukti_url` NULL) — detail tetap terbuka normal tanpa error, section bukti pembayaran ditampilkan kosong/tidak ada (bukan crash).
5. Diuji di viewport 375px (popup Setujui dan dialog Detail di layar kecil).
6. Laporkan ke Alif.
7. Sesuai `CLAUDE.md` (Urutan kerja wajib, butir 6): **JANGAN tandai F10.4 DONE di `feature-registry.md` sampai Alif eksplisit mengonfirmasi sudah menguji sendiri di browser.** Begitu dikonfirmasi, update baris F10.4 — status DONE, kolom Berkas diisi file yang benar-benar diubah, kolom Diuji/Bukti diisi ringkasan hasil uji Alif.
