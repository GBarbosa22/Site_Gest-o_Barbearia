import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toISODateString } from "@/lib/utils";

function addDays(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toISODateString(date);
}

function buildHref(date: string, barberId?: string) {
  const params = new URLSearchParams({ date });
  if (barberId) params.set("barber", barberId);
  return `/agenda?${params.toString()}`;
}

export function DateNav({ date, barberId }: { date: string; barberId?: string }) {
  const today = toISODateString(new Date());
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${date}T00:00:00`));

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-2">
      <Link
        href={buildHref(addDays(date, -1), barberId)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground active:bg-accent"
        aria-label="Dia anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
      <div className="text-center">
        <p className="text-sm font-medium capitalize">{label}</p>
        {date !== today ? (
          <Link href={buildHref(today, barberId)} className="text-xs text-gold">
            Voltar para hoje
          </Link>
        ) : null}
      </div>
      <Link
        href={buildHref(addDays(date, 1), barberId)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground active:bg-accent"
        aria-label="Próximo dia"
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}
