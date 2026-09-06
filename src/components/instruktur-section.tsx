import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export async function InstrukturSection() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instructors")
    .select("id, nama, foto_url, jabatan_id")
    .eq("is_active", true)
    .order("urutan", { ascending: true });

  if (error) console.error("[instruktur] gagal memuat:", error);
  if (!data || data.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">Instruktur Kami</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.map((instruktur) => (
          <div key={instruktur.id} className="flex flex-col items-center gap-2 text-center">
            <div className="relative size-24 overflow-hidden rounded-full bg-warna-latar-2 sm:size-32">
              {instruktur.foto_url && (
                <Image
                  src={instruktur.foto_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            <p className="text-base font-semibold text-warna-teks">{instruktur.nama}</p>
            {instruktur.jabatan_id && (
              <p className="text-sm text-warna-teks-2">{instruktur.jabatan_id}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
