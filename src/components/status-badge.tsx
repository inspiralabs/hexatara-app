import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const STATUS_CLASSNAME = {
  open: "bg-emerald-600/10 text-emerald-600",
  done: "bg-emerald-600/10 text-emerald-600",
  upcoming: "bg-primary/10 text-foreground",
  wip: "bg-primary/10 text-foreground",
  closed: "bg-muted-foreground/10 text-muted-foreground",
  todo: "bg-muted-foreground/10 text-muted-foreground",
  skip: "bg-muted-foreground/10 text-muted-foreground",
  blocked: "bg-destructive/10 text-destructive",
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
