import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types/database.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Agendado",
  in_progress: "Em atendimento",
  completed: "Finalizado",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
};

const STATUS_VARIANT: Record<AppointmentStatus, "gold" | "success" | "destructive" | "default"> = {
  scheduled: "gold",
  in_progress: "gold",
  completed: "success",
  cancelled: "destructive",
  no_show: "destructive",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
