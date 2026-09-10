import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const STATUS_CLASSNAME = {
  open: "bg-warna-sukses/10 text-warna-sukses",
  done: "bg-warna-sukses/10 text-warna-sukses",
  upcoming: "bg-warna-aksen/10 text-warna-aksen",
  wip: "bg-warna-aksen/10 text-warna-aksen",
  closed: "bg-warna-teks-2/10 text-warna-teks-2",
  todo: "bg-warna-teks-2/10 text-warna-teks-2",
  skip: "bg-warna-teks-2/10 text-warna-teks-2",
  blocked: "bg-warna-bahaya/10 text-warna-bahaya",
} as const;

export type StatusBadgeStatus = keyof typeof STATUS_CLASSNAME;

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: StatusBadgeStatus;
  label: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", STATUS_CLASSNAME[status], className)}>
      {label}
    </Badge>
  );
}
