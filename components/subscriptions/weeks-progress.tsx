import { Check, X, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionState } from "@/lib/subscription-logic";

const ICON_BY_STATE = {
  used: Check,
  forfeited: X,
  available: Clock,
  upcoming: Circle,
};

const STYLE_BY_STATE: Record<string, string> = {
  used: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  forfeited: "bg-destructive/15 text-destructive",
  available: "bg-gold/15 text-gold animate-pulse",
  upcoming: "bg-muted text-muted-foreground",
};

export function WeeksProgress({ state }: { state: SubscriptionState }) {
  return (
    <div className="flex items-center gap-2">
      {state.weeks.map((week) => {
        const Icon = ICON_BY_STATE[week.state];
        return (
          <div key={week.week} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                STYLE_BY_STATE[week.state]
              )}
              title={`Semana ${week.week}: ${week.state}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-muted-foreground">S{week.week}</span>
          </div>
        );
      })}
    </div>
  );
}
