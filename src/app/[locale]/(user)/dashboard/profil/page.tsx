import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProfilForm } from '../setting/profil-form';

export default async function ProfilPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: authUser }] = await Promise.all([
    supabase.from('profiles').select('nama_lengkap, whatsapp').eq('id', claims.sub).single(),
    supabase.auth.getUser(),
  ]);

  const email = authUser.user?.email ?? '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Profil</h1>
        <p className="mt-1 text-base text-muted-foreground">Ubah nama yang tampil di akunmu.</p>
      </div>

      <section className="max-w-md rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {email || '—'}
          </p>
        </div>
        <ProfilForm
          variant="profil"
          defaultValues={{
            nama_lengkap: profile?.nama_lengkap ?? '',
            whatsapp: profile?.whatsapp ?? '',
          }}
        />
      </section>
    </div>
  );
}
