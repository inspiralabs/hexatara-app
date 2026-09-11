import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function BatchRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  redirect({ href: `/pelatihan/${slug}`, locale });
}
