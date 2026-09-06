import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_BATCH_LABEL, formatRupiah, formatTanggalBatch } from "@/lib/batch";
import type { Database } from "@/types/database";

type Batch = Pick<
  Database["public"]["Tables"]["batches"]["Row"],
  "id" | "slug" | "judul_id" | "kategori_id" | "lokasi_id" | "harga" | "status" | "tanggal_mulai" | "tanggal_selesai"
>;

function BatchCard({ batch }: { batch: Batch }) {
  const tanggal = formatTanggalBatch(batch.tanggal_mulai, batch.tanggal_selesai);
  const status = STATUS_BATCH_LABEL[batch.status];

  return (
    <article className="flex flex-col gap-2 rounded-xl border border-warna-latar-2 bg-warna-latar p-4">
      <div className="flex flex-wrap items-center gap-2">
        {batch.kategori_id && (
          <span className="rounded-full bg-warna-utama/10 px-2.5 py-0.5 text-xs font-medium text-warna-utama">
            {batch.kategori_id}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>
      <h3 className="text-lg font-bold text-warna-teks">{batch.judul_id}</h3>
      {tanggal && <p className="text-sm text-warna-teks-2">{tanggal}</p>}
      {batch.lokasi_id && <p className="text-sm text-warna-teks-2">{batch.lokasi_id}</p>}
      {batch.harga != null && (
        <p className="text-base font-semibold text-warna-teks">{formatRupiah(batch.harga)}</p>
      )}
      {batch.status !== "closed" && (
        <Link
          href={`/batch/${batch.slug}`}
          className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-lg bg-warna-aksen px-5 text-base font-semibold text-warna-teks"
        >
          Daftar Sekarang
        </Link>
      )}
    </article>
  );
}

export async function JadwalBatchSection() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batches")
    .select("id, slug, judul_id, kategori_id, lokasi_id, harga, status, tanggal_mulai, tanggal_selesai")
    .eq("is_active", true)
    .order("tanggal_mulai", { ascending: true });

  if (error) console.error("[jadwal-batch] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section id="jadwal" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">Jadwal Pelatihan Mendatang</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((batch) => (
          <BatchCard key={batch.id} batch={batch} />
        ))}
      </div>
    </section>
  );
}
