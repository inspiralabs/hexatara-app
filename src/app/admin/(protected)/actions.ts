'use server';

import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { createClient } from '@/lib/supabase/server';

export async function logoutAdminAction() {
  // Dipanggil di sini, bukan cuma diandalkan dari layout — Server Action
  // punya endpoint sendiri dan bisa dipanggil langsung tanpa melewati layout.
  await requireAdmin();

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
