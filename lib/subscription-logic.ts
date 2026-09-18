import type { SubscriptionRow, SubscriptionUseRow } from "@/types/database.types";

export type WeekState = "used" | "available" | "forfeited" | "upcoming";

export interface WeekInfo {
  week: number;
  state: WeekState;
  usedAt: string | null;
}

export interface SubscriptionState {
  weekIndexNow: number;
  weeks: WeekInfo[];
  creditsUsed: number;
  creditsForfeited: number;
  /** Há um crédito disponível para ser usado agora (na janela da semana atual). */
  isActiveNow: boolean;
  /** Status derivado da regra de negócio (independe do que está salvo no banco). */
  derivedStatus: "active" | "completed" | "expired";
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Calcula o estado do plano de N cortes (1 crédito por semana, a partir da
 * compra; crédito não usado na semana é perdido) sem depender de nenhum job
 * agendado — tudo é derivado de `purchased_at` + os usos já registrados.
 */
export function computeSubscriptionState(
  subscription: Pick<SubscriptionRow, "purchased_at" | "total_credits">,
  uses: Pick<SubscriptionUseRow, "week_number" | "used_at">[],
  now: Date = new Date()
): SubscriptionState {
  const purchasedAt = new Date(subscription.purchased_at).getTime();
  const elapsedWeeks = Math.floor((now.getTime() - purchasedAt) / WEEK_MS) + 1;
  const weekIndexNow = Math.max(1, elapsedWeeks);

  const usesByWeek = new Map(uses.map((u) => [u.week_number, u.used_at]));

  const weeks: WeekInfo[] = [];
  for (let week = 1; week <= subscription.total_credits; week++) {
    const usedAt = usesByWeek.get(week) ?? null;
    let state: WeekState;
    if (usedAt) {
      state = "used";
    } else if (week < weekIndexNow) {
      state = "forfeited";
    } else if (week === weekIndexNow) {
      state = "available";
    } else {
      state = "upcoming";
    }
    weeks.push({ week, state, usedAt });
  }

  const creditsUsed = weeks.filter((w) => w.state === "used").length;
  const creditsForfeited = weeks.filter((w) => w.state === "forfeited").length;
  const isActiveNow = weeks.some((w) => w.week === weekIndexNow && w.state === "available");

  let derivedStatus: SubscriptionState["derivedStatus"] = "active";
  if (creditsUsed === subscription.total_credits) {
    derivedStatus = "completed";
  } else if (weekIndexNow > subscription.total_credits) {
    derivedStatus = "expired";
  }

  return { weekIndexNow, weeks, creditsUsed, creditsForfeited, isActiveNow, derivedStatus };
}
