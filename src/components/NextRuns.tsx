import type { CronRun } from "../lib/cron";

interface NextRunsProps {
  runs: CronRun[];
  limit?: number;
}

const formatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function NextRuns({ runs, limit = 10 }: NextRunsProps) {
  const shown = runs.slice(0, limit);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
        {limit} eksekusi berikutnya
      </h2>
      <ol className="space-y-1.5">
        {shown.map((run, i) => (
          <li
            key={run.date.getTime() + i}
            className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm odd:bg-slate-50 dark:odd:bg-slate-800/50"
          >
            <span className="w-5 shrink-0 text-right text-xs font-medium text-slate-400">
              {i + 1}
            </span>
            <span className="text-slate-700 dark:text-slate-200">
              {formatter.format(run.date)}
            </span>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="px-2 py-1.5 text-sm text-slate-400">Tidak ada jadwal.</li>
        )}
      </ol>
    </div>
  );
}
