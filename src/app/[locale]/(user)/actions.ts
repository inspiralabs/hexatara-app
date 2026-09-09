'use server';

import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { requireUser } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

export async function logoutAction() {
  await requireUser();

  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect({ href: '/login', locale });
}
