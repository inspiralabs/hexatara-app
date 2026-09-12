import { getTranslations } from 'next-intl/server';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { logoutAction } from '../../actions';
import { ProfilForm } from './profil-form';
import { GantiPasswordForm } from './ganti-password-form';

export default async function SettingPage() {
  const claims = await requireUser();
  const t = await getTranslations('dashboard');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('nama_lengkap, whatsapp')
    .eq('id', claims.sub)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-warna-teks sm:text-3xl">Setting</h1>
        <p className="mt-1 text-base text-warna-teks-2">Kelola profil dan keamanan akunmu.</p>
      </div>

      <section className="max-w-md rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
        <h2 className="text-base font-bold text-warna-teks">Profil</h2>
        <div className="mt-4">
          <ProfilForm
            defaultValues={{
              nama_lengkap: profile?.nama_lengkap ?? '',
              whatsapp: profile?.whatsapp ?? '',
            }}
          />
        </div>
      </section>

      <section className="max-w-md rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
        <h2 className="text-base font-bold text-warna-teks">Kata Sandi</h2>
        <div className="mt-4">
          <GantiPasswordForm />
        </div>
      </section>

      <section className="max-w-md rounded-xl border border-warna-latar-2 bg-warna-latar p-5">
        <h2 className="text-base font-bold text-warna-teks">Sesi</h2>
        <form action={logoutAction} className="mt-4">
          <Button type="submit" variant="outline">
            {t('keluar')}
          </Button>
        </form>
      </section>
    </div>
  );
}
