import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export async function CompanyProfileSection() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_profile")
    .select("judul_id, konten_id, gambar_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) console.error("[company-profile] gagal memuat:", error);
  if (!data || (!data.judul_id.trim() && !data.konten_id.trim())) return null;

  return (
    <section className="bg-warna-latar-2">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:flex sm:items-center sm:gap-8">
        {data.gambar_url && (
          <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-xl sm:mb-0 sm:w-1/2">
            <Image
              src={data.gambar_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        )}
        <div className={data.gambar_url ? "sm:w-1/2" : ""}>
          {data.judul_id && (
            <h2 className="text-xl font-bold text-warna-teks sm:text-2xl">{data.judul_id}</h2>
          )}
          {data.konten_id && (
            // konten_id diisi lewat Tiptap di Admin Panel (ENGINEERING §5.8) — HTML dari
            // Admin, bukan input publik, jadi dangerouslySetInnerHTML aman di sini.
            <div
              className="mt-3 space-y-3 text-base text-warna-teks-2 [&_a]:underline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-warna-teks [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: data.konten_id }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
