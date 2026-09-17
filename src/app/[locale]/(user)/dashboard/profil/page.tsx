import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';
import { isProfilIdentitasLengkap } from '@/lib/identitas';
import { ProfilForm } from '../setting/profil-form';
import { IdentitasForm } from './identitas-form';

async function signedIdentitasUrl(path: string | null) {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from('identity-documents')
    .createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

export default async function ProfilPage() {
  const claims = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, { data: authUser }, identitasLengkap] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'nama_lengkap, whatsapp, nomor_ktp, tempat_lahir, tanggal_lahir, alamat_lengkap, foto_ktp_url, pas_foto_url',
      )
      .eq('id', claims.sub)
      .single(),
    supabase.auth.getUser(),
    isProfilIdentitasLengkap(claims.sub),
  ]);

  const email = authUser.user?.email ?? '';
  const [previewKtpUrl, previewPasFotoUrl] = await Promise.all([
    signedIdentitasUrl(profile?.foto_ktp_url ?? null),
    signedIdentitasUrl(profile?.pas_foto_url ?? null),
  ]);

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

      <section className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Data Identitas (untuk Sertifikasi RPC)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dipakai ulang saat mendaftar pelatihan RPC berikutnya.
            </p>
          </div>
          <p
            className={
              identitasLengkap
                ? 'shrink-0 text-sm font-medium text-primary'
                : 'shrink-0 text-sm font-medium text-muted-foreground'
            }
          >
            {identitasLengkap ? 'Data identitas lengkap ✓' : 'Data identitas belum lengkap'}
          </p>
        </div>
        <IdentitasForm
          defaultValues={{
            nomor_ktp: profile?.nomor_ktp ?? '',
            tempat_lahir: profile?.tempat_lahir ?? '',
            tanggal_lahir: profile?.tanggal_lahir ?? '',
            alamat_lengkap: profile?.alamat_lengkap ?? '',
          }}
          previewKtpUrl={previewKtpUrl}
          previewPasFotoUrl={previewPasFotoUrl}
        />
      </section>
    </div>
  );
}
