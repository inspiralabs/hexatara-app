import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

// Hub upgrade digabung ke /dashboard/transaksi (satu tempat: form → unggah → status).
// URL lama /dashboard/upgrade tetap hidup untuk tautan email Admin (revalidate + redirect).
export default async function UpgradePage() {
  const claims = await requireUser();
  const locale = await getLocale();
  const supabase = await createClient();

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
        <Link href="/kuis" className="mt-3 inline-block text-sm underline underline-offset-4">
          Mulai Kuis
        </Link>
      </div>
    );
  }

  redirect({ href: '/dashboard/transaksi', locale });
}
