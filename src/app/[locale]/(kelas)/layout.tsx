import { ForceLightDocument } from "@/components/shell/force-light-document";

export default function KelasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceLightDocument />
      {children}
    </>
  );
}
