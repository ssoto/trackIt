---
paths:
  - app/**/*
  - src/app/**/*
---

# Next.js Caching Strategy

## Four Caching Layers
| Layer | Where | Duration | Opt-out |
|-------|-------|----------|---------|
| **Request Memoization** | Server (per request) | Single request | `AbortController.signal` |
| **Data Cache** | Server (persistent) | Until revalidated | `{ cache: 'no-store' }` |
| **Full Route Cache** | Server (persistent) | Until revalidated/redeployed | `force-dynamic` |
| **Router Cache** | Client (in-memory) | Session / 5 min | `router.refresh()` |

## Revalidation Patterns
- **Time-based (ISR)**: `fetch(url, { next: { revalidate: 60 } })` — stale-while-revalidate
- **On-demand tag-based**: tag fetches with `next: { tags: ['product-1'] }`, then `revalidateTag('product-1')` after mutation
- **On-demand path-based**: `revalidatePath('/blog')` or `revalidatePath('/blog', 'layout')` for nested segments

## Dynamic Rendering
A route becomes dynamic automatically when it accesses:
- `cookies()`, `headers()`, `connection()`
- `searchParams` prop in Page components
- `fetch` with `{ cache: 'no-store' }`

Avoid `dynamic = 'force-dynamic'` — prefer time-based revalidation when data changes periodically.

## Request Memoization
- For non-fetch data sources, use `React.cache()` to deduplicate DB calls within a single request
- Call the cached function in multiple Server Components — only one query executes per request
- `fetch` calls are automatically memoized within a request (no wrapper needed)

## Key Rules
- Always choose the least aggressive caching strategy that meets your freshness requirements
- Use `revalidateTag()` for fine-grained invalidation of related data
- Call `revalidatePath()` or `revalidateTag()` BEFORE `redirect()` in Server Actions
