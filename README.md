# TrackIt

> Simple, local-first time tracking for your daily tasks.

TrackIt is a lightweight web app that lets you start/stop a timer for tasks, review your week at a glance, and manage your time log without any accounts, cloud sync, or subscriptions. Everything runs locally on your machine.

---

## Features

| | |
|---|---|
| ⏱️ **Live Timer** | Compact widget in the top-right corner. One active task at a time. |
| 📅 **Weekly Calendar** | Current week with daily totals and 8h progress bars. Navigate between weeks. |
| 🗓️ **Weekend Toggle** | Show or hide Sat/Sun for a focused work-week view. |
| 📊 **Daily Summary** | All tasks grouped by day with time ranges, durations, and status badges. |
| 🏷️ **Task Status** | Mark tasks as **To Do**, **In Progress**, or **Done** with a single click. |
| ✏️ **Inline Editing** | Edit description and start/end times directly in the summary. |
| ➕ **Manual Tasks** | Add past tasks to any day via the "+ Add" button. |
| 🗑️ **Delete with Undo** | 5-second grace period to cancel accidental deletions. |
| 💾 **Local SQLite** | All data stored in a single file — no external database needed. |
| 🌙 **Dark Mode** | Automatic dark mode via CSS variables. |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Quick Start

```bash
# Install dependencies and initialise the database
make setup

# Start the development server
make dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Manual Setup

```bash
npm install
npm run dev
```

---

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | List all available commands |
| `make setup` | Install dependencies + initialise DB |
| `make dev` | Start development server |
| `make build` | Build for production |
| `make start` | Build + start production server |
| `make lint` | Run ESLint |
| `make db-init` | Initialise the database schema |
| `make db-reset` | ⚠️ Reset database (deletes all data) |
| `make clean` | Remove `node_modules` and build artefacts |

---

## Usage

1. **Start a task** — type a description in the timer widget and click **Start**
2. **Stop the task** — click **Stop** when you're done; status is set to *Done* automatically
3. **Change status** — click the status badge on any task in the Daily Summary to switch between *To Do*, *In Progress*, and *Done*
4. **Edit a task** — hover over a task row and click the ✏️ icon; you can change the description and start/end times (date is fixed, only the time is editable)
5. **Delete a task** — click the 🗑️ icon; a toast appears with an **Undo** button for 5 seconds before the deletion is committed
6. **Add a past task** — click **+ Add** next to any day in the Daily Summary
7. **Navigate weeks** — use the ← / → arrows in the Weekly Calendar

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
- **UI**: React (client components with hooks)

---

## Project Structure

```
trackIt/
├── app/
│   ├── api/
│   │   ├── tasks/
│   │   │   ├── route.ts          # Task CRUD (GET, POST, PATCH, DELETE)
│   │   │   └── active/route.ts   # Currently running task
│   │   └── summary/route.ts      # Weekly summary aggregation
│   ├── layout.tsx                # Root layout (mounts ToastContainer)
│   ├── page.tsx                  # Main page — global state & handlers
│   └── globals.css               # Design system (CSS variables, utilities)
├── components/
│   ├── TaskTimer.tsx             # Timer widget
│   ├── WeeklyCalendar.tsx        # Week grid
│   ├── DailySummary.tsx          # Task list with edit/delete/status
│   └── Toast.tsx                 # Global toast notifications
├── lib/
│   ├── db.ts                     # SQLite singleton + schema init
│   ├── types.ts                  # Shared TypeScript types
│   └── timeUtils.ts              # Time formatting helpers
└── database/
    ├── schema.sql                # Canonical DB schema
    └── trackit.db                # SQLite file (created on first run)
```

---

## Database Schema

```sql
CREATE TABLE tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT    NOT NULL,
  start_time  TEXT    NOT NULL,        -- ISO 8601
  end_time    TEXT,                    -- NULL while running
  duration    INTEGER,                 -- milliseconds
  status      TEXT DEFAULT 'done',     -- 'todo' | 'in_progress' | 'done'
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

---

## License

MIT
