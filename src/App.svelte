<script lang="ts">
  import { CRON_PRESETS, parseCron, type CronRun } from "./lib/cron";
  import Calendar from "./components/Calendar.svelte";
  import NextRuns from "./components/NextRuns.svelte";

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

  let expression = $state("0 9 * * 1-5");
  let selectedDay = $state<{ key: string; runs: CronRun[] } | null>(null);

  const result = $derived(parseCron(expression, 400));

  function handleSelectDay(key: string, runs: CronRun[]) {
    selectedDay = selectedDay?.key === key ? null : { key, runs };
  }

  function applyPreset(expr: string) {
    expression = expr;
    selectedDay = null;
  }

  function onInput(e: Event) {
    expression = (e.currentTarget as HTMLInputElement).value;
    selectedDay = null;
  }
</script>

<div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <header class="mb-8 text-center">
      <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-500">
        cron-visualizer
      </p>
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Lihat jadwal eksekusi cron dalam kalender visual
      </h1>
      <p class="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
        Paste cron expression di bawah, lihat kapan job kamu akan berjalan —
        lengkap dengan kalender bulanan dan daftar eksekusi berikutnya.
      </p>
    </header>

    <div class="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label
        for="cron-input"
        class="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300"
      >
        Cron expression
      </label>
      <input
        id="cron-input"
        value={expression}
        oninput={onInput}
        spellcheck="false"
        placeholder="* * * * *"
        class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 font-mono text-lg tracking-wide text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      <div class="mt-3 flex flex-wrap gap-1.5">
        {#each CRON_PRESETS as preset (preset.expression)}
          <button
            onclick={() => applyPreset(preset.expression)}
            class={[
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              expression === preset.expression
                ? "border-indigo-500 bg-indigo-500 text-white"
                : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300",
            ].join(" ")}
          >
            {preset.label}
          </button>
        {/each}
      </div>

      <div class="mt-4">
        {#if result.ok}
          <div class="rounded-xl bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <span class="font-medium">Arti: </span>
            {result.description}
          </div>
        {:else}
          <div class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {result.error}
          </div>
        {/if}
      </div>
    </div>

    {#if result.ok}
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Calendar runs={result.runs} onSelectDay={handleSelectDay} selectedKey={selectedDay?.key} />
        <NextRuns runs={result.runs} limit={10} />
      </div>

      {#if selectedDay}
        <div class="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
              {dayFormatter.format(new Date(selectedDay.key))}
            </h3>
            <button
              onclick={() => (selectedDay = null)}
              class="text-xs font-medium text-indigo-500 hover:underline"
            >
              Tutup
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            {#each selectedDay.runs as run, i (i)}
              <span class="rounded-lg bg-white px-2.5 py-1 text-sm font-mono text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                {timeFormatter.format(run.date)}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    {/if}

    <footer class="mt-12 text-center text-xs text-slate-400">
      Dibuat dengan Svelte + TypeScript · parsing via
      <code class="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">cron-parser</code>
      &
      <code class="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">cronstrue</code>
    </footer>
  </div>
</div>
