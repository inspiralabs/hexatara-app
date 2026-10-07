import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getMateriAktifId } from '@/lib/materi';
import { getFreemiumLmsAccess } from '@/lib/site-settings';
import { LmsClosedPage, lmsClosedMetadata } from '@/components/lms-closed-page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { allowed } = await getFreemiumLmsAccess();
  if (!allowed) return lmsClosedMetadata(locale);
  return { robots: { index: false, follow: false } };
}

// Pintu bernama. Gerbang SEBELUM redirect — jangan arahkan ke LMS saat tertutup.
export default async function GetFreeCertificatePage() {
  const { allowed } = await getFreemiumLmsAccess();
  if (!allowed) return <LmsClosedPage />;

  const locale = await getLocale();
  const id = await getMateriAktifId();
  redirect({ href: id == null ? '/pelatihan' : `/materi/${id}`, locale });
}
