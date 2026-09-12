import { requireAdmin } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/shell/admin-shell";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const claims = await requireAdmin();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap")
    .eq("id", claims.sub)
    .maybeSingle();

  const email = typeof claims.email === "string" ? claims.email : "";

  return (
    <AdminShell nama={profile?.nama_lengkap?.trim() || "Admin"} email={email}>
      {children}
    </AdminShell>
  );
}
