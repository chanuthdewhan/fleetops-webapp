import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  ON_TRIP: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  OFF_DUTY: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  MAINTENANCE: "bg-red-100 text-red-700 hover:bg-red-100",
  PENDING: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  ASSIGNED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  IN_TRANSIT: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  DELIVERED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  CANCELLED: "bg-red-100 text-red-700 hover:bg-red-100",
  STARTED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  IN_PROGRESS: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  COMPLETED: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", STATUS_STYLES[status] ?? "")}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
