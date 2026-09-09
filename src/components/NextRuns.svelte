<script lang="ts">
  import type { CronRun } from "../lib/cron";

  interface Props {
    runs: CronRun[];
    limit?: number;
  }

  let { runs, limit = 10 }: Props = $props();

  const formatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const shown = $derived(runs.slice(0, limit));
</script>

<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
  <h2 class="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">
    {limit} eksekusi berikutnya
  </h2>
  <ol class="space-y-1.5">
    {#each shown as run, i (run.date.getTime() + i)}
      <li class="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm odd:bg-slate-50 dark:odd:bg-slate-800/50">
        <span class="w-5 shrink-0 text-right text-xs font-medium text-slate-400">
          {i + 1}
        </span>
        <span class="text-slate-700 dark:text-slate-200">
          {formatter.format(run.date)}
        </span>
      </li>
    {/each}
    {#if shown.length === 0}
      <li class="px-2 py-1.5 text-sm text-slate-400">Tidak ada jadwal.</li>
    {/if}
  </ol>
</div>
