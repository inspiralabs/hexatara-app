import { requireUser } from "@/lib/auth/guard";
import { createClient } from "@/lib/supabase/server";
import { DashboardUserShell } from "@/components/shell/dashboard-user-shell";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const claims = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_lengkap")
    .eq("id", claims.sub)
    .maybeSingle();

  const email = typeof claims.email === "string" ? claims.email : "";

  return (
    <DashboardUserShell namaLengkap={profile?.nama_lengkap ?? ""} email={email}>
      {children}
    </DashboardUserShell>
  );
}
