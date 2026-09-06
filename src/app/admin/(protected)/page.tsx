import { Button } from '@/components/ui/button';
import { logoutAdminAction } from './actions';

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-medium">Selamat datang, Admin</h1>
      <form action={logoutAdminAction}>
        <Button type="submit" variant="outline">
          Keluar
        </Button>
      </form>
    </div>
  );
}
