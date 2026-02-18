# TrackIt - Quick Reference

## Getting Started

```bash
# First time setup
make setup

# Start development
make dev
```

## Common Commands

| Command | What it does |
|---------|--------------|
| `make help` | Show all commands |
| `make dev` | Start dev server (http://localhost:3000) |
| `make build` | Build for production |
| `make start` | Run production build |
| `make clean` | Clean all build files |
| `make lint` | Check code quality |
| `make format` | Auto-format code |

## Database Management

```bash
# Initialize database
make db-init

# Reset database (WARNING: deletes all data!)
make db-reset
```

## Development Workflow

1. **Start working**: `make dev`
2. **Make changes**: Edit files in `app/`, `components/`, or `lib/`
3. **Check code**: `make lint`
4. **Format code**: `make format`
5. **Build**: `make build`

## Project URLs

- Development: http://localhost:3000
- Production: (deploy as needed)

## Key Features

- ⏱️ Compact timer widget (top-right corner)
- 📅 Weekly calendar view
- 🗓️ Toggle weekends on/off
- 📊 Daily task summaries
- ✏️ Edit/delete tasks
- 🌙 Dark mode support

## File Structure

```
app/
  ├── api/          # API routes
  ├── page.tsx      # Main page
  └── globals.css   # Styles

components/
  ├── TaskTimer.tsx
  ├── WeeklyCalendar.tsx
  └── DailySummary.tsx

lib/
  ├── db.ts         # Database
  ├── types.ts      # TypeScript types
  └── timeUtils.ts  # Utilities
```

## Tips

- Press `Enter` in timer input to start tracking
- Click "Hide Weekends" for 5-day work week view
- Tasks auto-save to SQLite database
- Timer persists across page reloads
