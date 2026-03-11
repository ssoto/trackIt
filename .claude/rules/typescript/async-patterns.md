---
paths:
  - **/*.ts
  - **/*.tsx
---

# TypeScript Async Patterns

## Rules

- **Always await or return Promises** — never fire-and-forget; unhandled rejections crash at runtime
- **Use `Promise.all`** for independent concurrent operations — avoids sequential slowdown
- **Use `Promise.allSettled`** when partial failure is acceptable — inspect rejected results
- **Type async return values explicitly** — `Promise<T>` on exported async functions
- **Avoid unnecessary `async`** — do not mark functions `async` if they never `await`
- **Use `async/await`** over `.then()` chains for readability
- **Handle race conditions** — use AbortController or cancellation flags in effects/fetches
- **No floating Promises** — every Promise must be awaited, returned, or explicitly voided with `void promise`

For detailed examples and reference, invoke: /ts-async-guide
