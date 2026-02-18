# AGENTS.md — TrackIt Agent Guide

This file documents the architecture, conventions, and key decisions that an AI agent (or new developer) needs to know to work effectively on this codebase.

---

## Project Overview

**TrackIt** is a local-first time tracking web app. Users start/stop a timer for tasks, and the app records durations in a local SQLite database. The UI shows a weekly calendar and a daily summary with full task management.

- **Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · SQLite (`better-sqlite3`)
- **Runtime**: Node.js 20+, runs entirely locally — no external services or auth
- **Dev server**: `npm run dev` → `http://localhost:3000`

---

## Architecture

### Data Flow

```
Browser (React Client Components)
  ↕ fetch()
Next.js API Routes (app/api/)
  ↕ better-sqlite3 (synchronous)
SQLite file (database/trackit.db)
```

All DB access is **synchronous** via `better-sqlite3`. API routes are the only place that touch the DB — never import `db.ts` from client components.

### Key Files

| File | Role |
|------|------|
| `app/page.tsx` | Root page: fetches data, owns global state (`summaries`, `dailyTotals`), passes handlers down |
| `app/api/tasks/route.ts` | CRUD for tasks: `GET`, `POST`, `PATCH`, `DELETE` |
| `app/api/summary/route.ts` | Weekly summary aggregation |
| `app/api/tasks/active/route.ts` | Returns the currently running task (no `end_time`) |
| `components/TaskTimer.tsx` | Timer widget (top-right). Polls active task, starts/stops via API |
| `components/DailySummary.tsx` | Main list view: edit, delete (with undo toast), status badge, inline time editor |
| `components/WeeklyCalendar.tsx` | Week grid with daily totals and progress bars |
| `components/Toast.tsx` | Global toast system (module-level singleton pattern) |
| `lib/db.ts` | DB singleton + schema initialisation (runs `schema.sql` + idempotent migrations) |
| `lib/types.ts` | Shared TypeScript interfaces (`Task`, `DailySummary`, `TaskStatus`) |
| `lib/timeUtils.ts` | Pure formatting helpers (`formatMinutes`, `getDayName`, etc.) |
| `database/schema.sql` | Canonical schema. `ALTER TABLE` migrations are wrapped in `try/catch` in `db.ts` |

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT    NOT NULL,
  start_time  TEXT    NOT NULL,   -- ISO 8601 string
  end_time    TEXT,               -- NULL while task is running
  duration    INTEGER,            -- milliseconds
  status      TEXT DEFAULT 'done',-- 'todo' | 'in_progress' | 'done'
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

**Migration pattern**: SQLite does not support `ALTER TABLE … IF NOT EXISTS`. New columns are added in `lib/db.ts` inside a `try/catch` block so they are idempotent on existing databases.

---

## Task Status

Tasks have three statuses defined in `lib/types.ts`:

```ts
type TaskStatus = 'todo' | 'in_progress' | 'done';
```

| Trigger | Status set |
|---------|-----------|
| Timer started (`POST /api/tasks`) | `in_progress` |
| Timer stopped (`PATCH /api/tasks`) | `done` |
| User clicks status badge in DailySummary | any of the three |
| Manually created task (via "+ Add" form) | `done` (default) |

---

## Optimistic UI Updates

`app/page.tsx` uses **optimistic updates** to avoid full page reloads on task mutations:

1. **Mutate local state immediately** (`setSummaries` / `setDailyTotals`)
2. **Call API in background** (`fetch` without `await` blocking the UI)
3. **Rollback on failure** by calling `fetchSummaries()` again

Helper: `updateSummariesLocally(taskId, updates)` — updates both `summaries` and `dailyTotals` atomically inside a single `setSummaries` callback.

**Exception**: `handleTaskTimerUpdate` (called when the timer stops) always calls `fetchSummaries()` for a full refresh, because the timer component owns the task creation lifecycle.

---

## Delete with Undo

Deleting a task in `DailySummary` uses a **deferred delete** pattern:

1. Task row is visually faded (`opacity-40 pointer-events-none`) via `pendingDeleteIds` state
2. A `Toast` appears with an **Undo** button and a 5-second countdown
3. If Undo is clicked: `clearTimeout` cancels the timer, `pendingDeleteIds` is cleared → task fully restored, **no API call made**
4. If timer expires: `onDeleteTask(id)` is called → optimistic delete in `page.tsx` → API `DELETE`

---

## Toast System (`components/Toast.tsx`)

Uses a **module-level singleton** (`_setToasts`) so any component can call `showToast()` / `dismissToast()` without prop drilling.

```ts
// Show a toast from anywhere
import { showToast, dismissToast } from '@/components/Toast';

const id = showToast({ message: 'Hello', variant: 'success', duration: 3000 });
dismissToast(id); // cancel early
```

`ToastContainer` must be mounted once in `app/layout.tsx`. It registers itself as the singleton on mount.

---

## Time Editing Convention

The task edit form in `DailySummary` splits datetime into two parts:

- **Date**: displayed as a static read-only label (e.g. `"Wed, Feb 18"`) — **not editable**
- **Time**: `<input type="time">` for `HH:MM` — editable

This is intentional: tasks belong to a specific day and moving them across days is not a supported use case. The `editForm` state shape is:

```ts
{
  description: string;
  startDate: string;  // YYYY-MM-DD, read-only
  startHour: string;  // HH:MM, editable
  endDate: string;    // YYYY-MM-DD, read-only
  endHour: string;    // HH:MM, editable
}
```

Helpers: `toHour(iso)`, `toDateStr(iso)`, `toISO(dateStr, hourStr)`, `formatDateLabel(dateStr)`.

---

## API Conventions

All routes live under `app/api/`. They use `NextRequest` / `NextResponse` from `next/server`.

### `POST /api/tasks`
Creates a new task. Body: `{ description, status? }`. Fails if another task is already running (`end_time IS NULL`).

### `PATCH /api/tasks`
Updates any combination of fields. Body: `{ id, description?, start_time?, end_time?, duration?, status?, endTime? }`.
- `status` is validated against `['todo', 'in_progress', 'done']`
- `endTime` (legacy) auto-calculates `duration`

### `DELETE /api/tasks?id=<id>`
Hard deletes the task.

### `GET /api/summary?week=<YYYY-MM-DD>`
Returns `DailySummary[]` for the week containing the given date.

### `GET /api/tasks/active`
Returns the currently running task or `{ task: null }`.

---

## Development Conventions

- **No `fetchSummaries()` in mutation handlers** unless rolling back — use optimistic updates instead
- **All DB access server-side only** — never import `lib/db.ts` in client components
- **`'use client'` directive** required on all components that use hooks or browser APIs
- **Idempotent migrations** — wrap `ALTER TABLE` in `try/catch` in `lib/db.ts`, never in `schema.sql`
- **Status defaults**: new timer tasks → `in_progress`; stopped tasks → `done`; manually added → `done`

---

## Common Tasks for Agents

### Add a new field to tasks
1. Add column to `database/schema.sql`
2. Add `ALTER TABLE` migration in `lib/db.ts` (inside `try/catch`)
3. Update `Task` interface in `lib/types.ts`
4. Update `POST` and `PATCH` handlers in `app/api/tasks/route.ts`
5. Update `updateSummariesLocally` in `app/page.tsx` if the field affects display
6. Update `DailySummary.tsx` to show/edit the field

### Add a new API route
Create `app/api/<name>/route.ts` exporting named functions `GET`, `POST`, etc.

### Add a new component
Place in `components/`. Add `'use client';` if it uses React hooks. Import from `@/components/<Name>`.
