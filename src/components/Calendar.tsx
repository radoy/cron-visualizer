import { useMemo, useState } from "react";
import type { CronRun } from "../lib/cron";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface CalendarProps {
  runs: CronRun[];
  onSelectDay?: (key: string, runs: CronRun[]) => void;
  selectedKey?: string | null;
}

function buildRunsByDay(runs: CronRun[]): Map<string, CronRun[]> {
  const map = new Map<string, CronRun[]>();
  for (const run of runs) {
    const list = map.get(run.key);
    if (list) list.push(run);
    else map.set(run.key, [run]);
  }
  return map;
}

export default function Calendar({ runs, onSelectDay, selectedKey }: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const runsByDay = useMemo(() => buildRunsByDay(runs), [runs]);

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;

    const result: { date: Date; inMonth: boolean; key: string }[] = [];
    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekday + 1;
      const date = new Date(viewYear, viewMonth, dayNum);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate(),
      ).padStart(2, "0")}`;
      result.push({ date, inMonth: date.getMonth() === viewMonth, key });
    }
    return result;
  }, [viewYear, viewMonth]);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  function goPrev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Hari ini
          </button>
          <button
            onClick={goPrev}
            aria-label="Bulan sebelumnya"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            aria-label="Bulan berikutnya"
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date, inMonth, key }) => {
          const dayRuns = runsByDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const count = dayRuns.length;
          return (
            <button
              key={key}
              disabled={count === 0}
              onClick={() => onSelectDay?.(key, dayRuns)}
              className={[
                "flex h-16 flex-col items-center justify-start gap-1 rounded-lg border p-1 text-sm transition-colors sm:h-20",
                inMonth
                  ? "border-transparent"
                  : "border-transparent opacity-30",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                  : count > 0
                    ? "hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                    : "cursor-default",
                isToday && !isSelected ? "ring-1 ring-indigo-400" : "",
              ].join(" ")}
            >
              <span
                className={
                  isToday
                    ? "font-semibold text-indigo-600 dark:text-indigo-400"
                    : "text-slate-700 dark:text-slate-200"
                }
              >
                {date.getDate()}
              </span>
              {count > 0 && (
                <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {count > 99 ? "99+" : count}×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
