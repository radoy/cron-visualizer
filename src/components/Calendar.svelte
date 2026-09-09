<script lang="ts">
  import { getRunsInRange, type CronRun } from "../lib/cron";

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

  interface Props {
    expression: string;
    onSelectDay?: (key: string, runs: CronRun[]) => void;
    selectedKey?: string | null;
  }

  let { expression, onSelectDay, selectedKey = null }: Props = $props();

  function buildRunsByDay(runs: CronRun[]): Map<string, CronRun[]> {
    const map = new Map<string, CronRun[]>();
    for (const run of runs) {
      const list = map.get(run.key);
      if (list) list.push(run);
      else map.set(run.key, [run]);
    }
    return map;
  }

  const today = new Date();
  let viewYear = $state(today.getFullYear());
  let viewMonth = $state(today.getMonth());

  const cells = $derived.by(() => {
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
  });

  const runsByDay = $derived.by(() => {
    const first = cells[0].date;
    const last = cells[cells.length - 1].date;
    const start = new Date(first.getFullYear(), first.getMonth(), first.getDate(), 0, 0, 0, 0);
    const end = new Date(last.getFullYear(), last.getMonth(), last.getDate(), 23, 59, 59, 999);
    return buildRunsByDay(getRunsInRange(expression, start, end));
  });

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;

  function goPrev() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear -= 1;
    } else {
      viewMonth -= 1;
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear += 1;
    } else {
      viewMonth += 1;
    }
  }

  function goToday() {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
  }
</script>

<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-base font-semibold text-slate-800 dark:text-slate-100">
      {MONTH_NAMES[viewMonth]} {viewYear}
    </h2>
    <div class="flex items-center gap-1">
      <button
        onclick={goToday}
        class="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        Hari ini
      </button>
      <button
        onclick={goPrev}
        aria-label="Bulan sebelumnya"
        class="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        ‹
      </button>
      <button
        onclick={goNext}
        aria-label="Bulan berikutnya"
        class="grid h-7 w-7 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        ›
      </button>
    </div>
  </div>

  <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
    {#each DAY_NAMES as d (d)}
      <div class="py-1">{d}</div>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each cells as { date, inMonth, key } (key)}
      {@const dayRuns = runsByDay.get(key) ?? []}
      {@const isToday = key === todayKey}
      {@const isSelected = key === selectedKey}
      {@const count = dayRuns.length}
      <button
        disabled={count === 0}
        onclick={() => onSelectDay?.(key, dayRuns)}
        class={[
          "flex h-16 flex-col items-center justify-start gap-1 rounded-lg border p-1 text-sm transition-colors sm:h-20",
          inMonth ? "border-transparent" : "border-transparent opacity-30",
          isSelected
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
            : count > 0
              ? "hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
              : "cursor-default",
          isToday && !isSelected ? "ring-1 ring-indigo-400" : "",
        ].join(" ")}
      >
        <span class={isToday ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200"}>
          {date.getDate()}
        </span>
        {#if count > 0}
          <span class="rounded-full bg-indigo-100 px-1.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {count > 99 ? "99+" : count}×
          </span>
        {/if}
      </button>
    {/each}
  </div>
</div>
