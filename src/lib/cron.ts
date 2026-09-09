import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export interface CronRun {
  date: Date;
  key: string; // yyyy-mm-dd in local time
}

export interface CronParseResult {
  ok: true;
  description: string;
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
 * Validate a cron expression and produce its human-readable description.
 * Cheap — does not compute any fire times.
 */
export function describeCron(expression: string): CronResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { ok: false, error: "Masukkan cron expression terlebih dahulu." };
  }

  try {
    const description = cronstrue.toString(trimmed, { verbose: true });
    CronExpressionParser.parse(trimmed);
    return { ok: true, description };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Cron expression tidak valid.",
    };
  }
}

// Safety cap so a pathological expression can't hang the UI. Comfortably
// covers "every minute" across a full 6-week (42 day) calendar grid (~60k runs).
const MAX_RANGE_RUNS = 65_000;

/**
 * Compute every fire time between `start` and `end` (inclusive).
 * Assumes `expression` already passed `describeCron`.
 */
export function getRunsInRange(expression: string, start: Date, end: Date): CronRun[] {
  const runs: CronRun[] = [];
  try {
    const interval = CronExpressionParser.parse(expression.trim(), {
      currentDate: new Date(start.getTime() - 1),
    });
    for (let i = 0; i < MAX_RANGE_RUNS; i++) {
      const date = interval.next().toDate();
      if (date > end) break;
      runs.push({ date, key: dayKey(date) });
    }
  } catch {
    // leave runs as whatever was collected so far
  }
  return runs;
}

/**
 * Compute the next `count` fire times starting from `from` (defaults to now).
 * Assumes `expression` already passed `describeCron`.
 */
export function getNextRuns(expression: string, count: number, from: Date = new Date()): CronRun[] {
  const runs: CronRun[] = [];
  try {
    const interval = CronExpressionParser.parse(expression.trim(), { currentDate: from });
    for (let i = 0; i < count; i++) {
      const date = interval.next().toDate();
      runs.push({ date, key: dayKey(date) });
    }
  } catch {
    // leave runs as whatever was collected so far
  }
  return runs;
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
