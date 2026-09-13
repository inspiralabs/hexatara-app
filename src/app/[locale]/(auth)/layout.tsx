import { ForceLightDocument } from "@/components/shell/force-light-document";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLightDocument />
      {children}
    </>
  );
}
