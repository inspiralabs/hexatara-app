import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { ProfilForm } from './profil-form';
import { GantiPasswordForm } from './ganti-password-form';

export default async function SettingPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, whatsapp')
    .eq('id', claims.sub)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Setting</h1>
        <p className="mt-1 text-base text-muted-foreground">Ubah nomor WhatsApp dan kata sandi akun.</p>
      </div>

      <section className="max-w-md rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">WhatsApp</h2>
        <div className="mt-4">
          <ProfilForm
            variant="kontak"
            defaultValues={{
              nama_lengkap: profile?.nama_lengkap ?? '',
              whatsapp: profile?.whatsapp ?? '',
            }}
          />
        </div>
      </section>

      <section className="max-w-md rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Kata Sandi</h2>
        <div className="mt-4">
          <GantiPasswordForm />
        </div>
      </section>
    </div>
  );
}
