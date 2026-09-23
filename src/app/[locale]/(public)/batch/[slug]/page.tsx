import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { pick } from "@/lib/i18n/pick";
import { pageMetadata, plainDescription } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const supabase = await createClient();
  const { data: batch } = await supabase
    .from("batches")
    .select("judul_id, judul_en, deskripsi_id, deskripsi_en")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const title =
    (batch ? pick(batch.judul_id, batch.judul_en, locale) : null) ??
    t("pelatihanDetailFallbackTitle");
  const description =
    plainDescription(
      batch ? pick(batch.deskripsi_id, batch.deskripsi_en, locale) : null,
    ) || t("pelatihanDetailFallbackDescription");

  // Canonical ke /pelatihan/[slug] — /batch/[slug] hanya redirect.
  return pageMetadata({
    locale,
    path: `/pelatihan/${slug}`,
    title,
    description,
  });
}

export default async function BatchRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  redirect({ href: `/pelatihan/${slug}`, locale });
}
