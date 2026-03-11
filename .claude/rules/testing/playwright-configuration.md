---
paths:
  - **/*.spec.ts
  - tests/**/*
  - e2e/**/*
---

# Playwright Configuration Best Practices

## playwright.config.ts Key Settings
- `fullyParallel: true`, `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`
- `use.trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- Configure `baseURL`, `webServer` for local dev, `reporter` (html locally, junit on CI)

## Project Organization
- Use a dedicated `setup` project for authentication before test projects
- Configure `dependencies` to ensure setup runs first
- Use `devices` presets for desktop and mobile viewports
- Group projects by browser engine and device type

## Timeouts
- Default test: 30s, assertion: 5s — override in config as needed
- Use `test.setTimeout(ms)` for individual slow tests
- Use `test.slow()` to triple timeout for known slow tests

## Reporters
- `html` for local dev, `junit` on CI, `blob` for sharded runs
- Use `list` for terminal output during runs

## CI Integration
- `forbidOnly: true` on CI; `retries: 2` for flakiness resilience
- `trace: 'on-first-retry'` for debugging without overhead on passing tests
- Upload HTML report and trace artifacts; use `--shard=N/M` for distribution

## Authentication Setup
- Create `tests/auth.setup.ts` that logs in and saves `storageState`
- Reference `storageState` in browser project configs with `dependencies: ['setup']`

## Visual Regression
- Use `toHaveScreenshot()` with `maxDiffPixelRatio` for threshold control
- Set `animations: 'disabled'` to stabilize comparisons
- Update baselines with `--update-snapshots` — review every change
- Store baselines in version control
