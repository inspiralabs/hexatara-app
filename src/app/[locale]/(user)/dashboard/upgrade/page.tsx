import { redirect } from '@/i18n/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { getFreemiumLmsAccess } from '@/lib/site-settings';

// Hub upgrade digabung ke /dashboard/transaksi (satu tempat: form → unggah → status).
// URL lama /dashboard/upgrade tetap hidup untuk tautan email Admin (revalidate + redirect).
export default async function UpgradePage() {
  const claims = await requireUser();
  const locale = await getLocale();
  const supabase = await createClient();
  const { open: lmsOpen } = await getFreemiumLmsAccess();
  const tClosed = await getTranslations('lmsClosed');

  const { data: profile } = await supabase
    .from('profiles')
    .select('free_track_selesai_at')
    .eq('id', claims.sub)
    .single();

  if (!profile?.free_track_selesai_at) {
    return (
      <div className="mx-auto max-w-md py-10">
        <Link href="/dashboard" className="text-sm font-medium text-primary underline underline-offset-4">
          ← Kembali ke Dashboard
        </Link>
        <p className="mt-3 text-muted-foreground">
          Selesaikan kuis dan daftar akun dulu untuk mengajukan upgrade sertifikat.
        </p>
        {lmsOpen ? (
          <Link href="/kuis" className="mt-3 inline-block text-sm underline underline-offset-4">
            Mulai Kuis
          </Link>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{tClosed('softClosed')}</p>
        )}
      </div>
    );
  }

  redirect({ href: '/dashboard/transaksi', locale });
}
