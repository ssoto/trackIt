---
paths:
  - **/*.spec.ts
  - tests/**/*
  - e2e/**/*
---

# Playwright Testing Conventions

## Locator Strategy (Priority Order)
1. `page.getByRole()` — ARIA role-based (most resilient)
2. `page.getByLabel()` — form labels
3. `page.getByPlaceholder()` / `page.getByText()` — visible content
4. `page.getByTestId()` — explicit `data-testid` contracts
5. `page.locator('css=...')` — CSS selectors (last resort)
- NEVER use XPath or CSS class selectors for test targeting
- Use `.filter()` to narrow scope; define reusable locators in Page Objects

## Auto-Waiting Rules
- NEVER use `page.waitForTimeout()` — always wrong in Playwright
- Rely on built-in auto-waiting; use web-first assertions (`expect(locator).toBeVisible()`)
- Use `page.waitForURL()` for navigation, `page.waitForResponse(url)` for API waits
- Use `expect.poll()` for custom retry logic on non-locator values

## Assertion Rules
- ALWAYS use web-first assertions — they auto-retry and are race-condition-free
- Use `expect(page).toHaveURL()`, `toHaveTitle()`; `expect(response).toBeOK()`
- Use `expect.soft()` for non-blocking multi-condition checks
- Use `toHaveScreenshot({ maxDiffPixelRatio: 0.01 })` for visual regression
- NEVER extract locator state manually — use web-first assertions directly

## Fixture Rules
- Use `test.extend<T>()` for custom fixtures with automatic teardown
- Use `{ scope: 'worker' }` for expensive shared resources
- Use `storageState` for auth reuse; create `auth.setup.ts` project for global auth
- Fixtures can depend on other fixtures for modular composition

## Parallel Execution
- Design EVERY test to be independent — no shared mutable state
- Use `fullyParallel: true` as default; serial mode only when genuinely needed
- Isolate test data per test with unique identifiers

## Network Mocking
- Use `page.route()` for interception — register BEFORE `page.goto()`
- `route.fulfill({ json: mockData })` for mocks, `route.abort()` for error paths
- Use HAR recording for complex multi-request scenarios
- NEVER call real external APIs in tests
