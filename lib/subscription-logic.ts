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

/** Segunda-feira (00h) da semana de calendário em que `date` cai. */
function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = domingo, 1 = segunda, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Calcula o estado do plano de N cortes (1 crédito por semana de calendário,
 * segunda a domingo; crédito não usado até domingo é perdido) sem depender de
 * nenhum job agendado — tudo é derivado de `purchased_at` + os usos já
 * registrados. A semana 1 é a semana (segunda-domingo) em que o plano foi
 * comprado; toda segunda-feira seguinte libera o próximo crédito.
 */
export function computeSubscriptionState(
  subscription: Pick<SubscriptionRow, "purchased_at" | "total_credits">,
  uses: Pick<SubscriptionUseRow, "week_number" | "used_at">[],
  now: Date = new Date()
): SubscriptionState {
  const firstMonday = mondayOf(new Date(subscription.purchased_at));
  const currentMonday = mondayOf(now);
  const elapsedWeeks = Math.round((currentMonday.getTime() - firstMonday.getTime()) / WEEK_MS);
  const weekIndexNow = Math.max(1, elapsedWeeks + 1);

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
