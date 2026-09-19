import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandLogo } from '@/components/brand-logo';
import { AdminLoginForm } from './admin-login-form';

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
      <Card>
        <CardHeader className="items-center text-center">
          <BrandLogo variant="auto" size={48} priority className="mb-2 size-12" />
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>Khusus staf Hexatara. Bukan untuk pengguna Free Track.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
