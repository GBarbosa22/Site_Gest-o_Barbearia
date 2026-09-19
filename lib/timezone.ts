/**
 * Cálculos de data sempre no horário de Brasília (America/Sao_Paulo), não no
 * timezone do processo Node (na Vercel roda em UTC por padrão). Brasil não
 * observa mais horário de verão desde 2019, então o offset é fixo em -03:00 —
 * evita depender de bibliotecas de timezone só por causa disso.
 */
const SAO_PAULO_OFFSET_HOURS = 3;

function saoPauloParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === "24" ? "0" : parts.hour),
  };
}

export function saoPauloMidnightUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, SAO_PAULO_OFFSET_HOURS, 0, 0, 0));
}

/** Início do dia (00:00 em Brasília) contendo `base`, como Date em UTC. */
export function startOfDaySaoPaulo(base: Date = new Date()): Date {
  const { year, month, day } = saoPauloParts(base);
  return saoPauloMidnightUTC(year, month, day);
}

/** Início da semana (segunda-feira 00:00 em Brasília) contendo `base`. */
export function startOfWeekSaoPaulo(base: Date = new Date()): Date {
  const { year, month, day } = saoPauloParts(base);
  // meio-dia UTC evita qualquer problema de borda de dia ao calcular o dia da semana
  const noonUTC = new Date(Date.UTC(year, month - 1, day, 12));
  const dow = noonUTC.getUTCDay(); // 0=domingo..6=sábado
  const diffFromMonday = (dow + 6) % 7;
  noonUTC.setUTCDate(noonUTC.getUTCDate() - diffFromMonday);
  return saoPauloMidnightUTC(noonUTC.getUTCFullYear(), noonUTC.getUTCMonth() + 1, noonUTC.getUTCDate());
}

/** Início do mês (dia 1, 00:00 em Brasília) contendo `base`. */
export function startOfMonthSaoPaulo(base: Date = new Date()): Date {
  const { year, month } = saoPauloParts(base);
  return saoPauloMidnightUTC(year, month, 1);
}

/** Mês/dia atuais em Brasília — usado para "aniversariante hoje". */
export function todayMonthDaySaoPaulo(base: Date = new Date()): { month: number; day: number } {
  const { month, day } = saoPauloParts(base);
  return { month, day };
}

export function startOfDayISOSaoPaulo(base: Date = new Date()): string {
  return startOfDaySaoPaulo(base).toISOString();
}

export function startOfWeekISOSaoPaulo(base: Date = new Date()): string {
  return startOfWeekSaoPaulo(base).toISOString();
}

export function startOfMonthISOSaoPaulo(base: Date = new Date()): string {
  return startOfMonthSaoPaulo(base).toISOString();
}

/** Meia-noite em Brasília de uma data "YYYY-MM-DD" (ex.: vinda de um <input type="date">). */
export function dateStringToSaoPauloMidnightISO(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return saoPauloMidnightUTC(year, month, day).toISOString();
}
