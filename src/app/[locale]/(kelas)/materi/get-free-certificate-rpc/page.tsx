import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getMateriAktifId } from '@/lib/materi';

// Pintu bernama. URL akhir browser tetap /materi/{id} setelah redirect —
// yang dibagikan dari UI adalah nama ini, bukan angka.
export default async function GetFreeCertificatePage() {
  const locale = await getLocale();
  const id = await getMateriAktifId();
  redirect({ href: id == null ? '/pelatihan' : `/materi/${id}`, locale });
}
