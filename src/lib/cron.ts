import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export interface CronRun {
  date: Date;
  key: string; // yyyy-mm-dd in local time
}

export interface CronParseResult {
  ok: true;
  description: string;
  runs: CronRun[];
}

export interface CronParseError {
  ok: false;
  error: string;
}

export type CronResult = CronParseResult | CronParseError;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * Parse a cron expression and compute the next `count` fire times
 * starting from `from` (defaults to now).
 */
export function parseCron(
  expression: string,
  count = 300,
  from: Date = new Date(),
): CronResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { ok: false, error: "Masukkan cron expression terlebih dahulu." };
  }

  let description: string;
  try {
    description = cronstrue.toString(trimmed, { verbose: true });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Cron expression tidak valid.",
    };
  }

  try {
    const interval = CronExpressionParser.parse(trimmed, { currentDate: from });
    const runs: CronRun[] = [];
    for (let i = 0; i < count; i++) {
      const next = interval.next();
      const date = next.toDate();
      runs.push({ date, key: dayKey(date) });
    }
    return { ok: true, description, runs };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Cron expression tidak valid.",
    };
  }
}

export const CRON_PRESETS: { label: string; expression: string }[] = [
  { label: "Setiap menit", expression: "* * * * *" },
  { label: "Setiap 5 menit", expression: "*/5 * * * *" },
  { label: "Setiap 15 menit", expression: "*/15 * * * *" },
  { label: "Setiap jam", expression: "0 * * * *" },
  { label: "Setiap hari jam 00:00", expression: "0 0 * * *" },
  { label: "Setiap hari kerja jam 09:00", expression: "0 9 * * 1-5" },
  { label: "Setiap Senin jam 08:00", expression: "0 8 * * 1" },
  { label: "Setiap awal bulan", expression: "0 0 1 * *" },
  { label: "Setiap akhir tahun", expression: "0 0 31 12 *" },
  { label: "Setiap 6 jam", expression: "0 */6 * * *" },
];
