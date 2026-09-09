# cron-visualizer

Paste a cron expression and see exactly when it will run — on an interactive monthly calendar.

## Features

- Standard 5-field cron expression input (`* * * * *`) with real-time validation.
- Plain-English description of what the expression means.
- 10 built-in presets (every 5 minutes, weekdays at 9am, first day of the month, etc.).
- Interactive monthly calendar — every date with a scheduled run shows a count badge; click a date to see its exact run times.
- Chronological list of the next 10 upcoming runs.
- Month navigation (previous / next / today).

## Tech stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- [`cron-parser`](https://www.npmjs.com/package/cron-parser) — computes upcoming fire times
- [`cronstrue`](https://www.npmjs.com/package/cronstrue) — turns the cron expression into a human-readable description

## Getting started

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build to ./dist
npm run preview   # preview the production build
```

## Project structure

```
src/
  lib/cron.ts             # cron parsing + preset list
  components/
    Calendar.tsx           # monthly calendar view
    NextRuns.tsx            # upcoming-runs list
  App.tsx                   # main page
```

## License

MIT
