import { useMemo, useState } from "react";
import { CRON_PRESETS, parseCron, type CronRun } from "./lib/cron";
import Calendar from "./components/Calendar";
import NextRuns from "./components/NextRuns";

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export default function App() {
  const [expression, setExpression] = useState("0 9 * * 1-5");
  const [selectedDay, setSelectedDay] = useState<{ key: string; runs: CronRun[] } | null>(
    null,
  );

  const result = useMemo(() => parseCron(expression, 400), [expression]);

  function handleSelectDay(key: string, runs: CronRun[]) {
    setSelectedDay((prev) => (prev?.key === key ? null : { key, runs }));
  }

  function applyPreset(expr: string) {
    setExpression(expr);
    setSelectedDay(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
            cron-visualizer
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lihat jadwal eksekusi cron dalam kalender visual
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Paste cron expression di bawah, lihat kapan job kamu akan berjalan —
            lengkap dengan kalender bulanan dan daftar eksekusi berikutnya.
          </p>
        </header>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label
            htmlFor="cron-input"
            className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            Cron expression
          </label>
          <input
            id="cron-input"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              setSelectedDay(null);
            }}
            spellCheck={false}
            placeholder="* * * * *"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-lg tracking-wide text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.expression}
                onClick={() => applyPreset(preset.expression)}
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  expression === preset.expression
                    ? "border-indigo-500 bg-indigo-500 text-white"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300",
                ].join(" ")}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {result.ok ? (
              <div className="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                <span className="font-medium">Arti: </span>
                {result.description}
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {result.error}
              </div>
            )}
          </div>
        </div>

        {result.ok && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
              <Calendar
                runs={result.runs}
                onSelectDay={handleSelectDay}
                selectedKey={selectedDay?.key}
              />
              <NextRuns runs={result.runs} limit={10} />
            </div>

            {selectedDay && (
              <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                    {dayFormatter.format(new Date(selectedDay.key))}
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-xs font-medium text-indigo-500 hover:underline"
                  >
                    Tutup
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDay.runs.map((run, i) => (
                    <span
                      key={i}
                      className="rounded-lg bg-white px-2.5 py-1 text-sm font-mono text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                    >
                      {timeFormatter.format(run.date)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <footer className="mt-12 text-center text-xs text-slate-400">
          Dibuat dengan React + TypeScript · parsing via{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
            cron-parser
          </code>{" "}
          &{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
            cronstrue
          </code>
        </footer>
      </div>
    </div>
  );
}
