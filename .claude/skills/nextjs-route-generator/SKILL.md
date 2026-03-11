---
name: nextjs-route-generator
description: Generate complete Next.js App Router route segments with all conventions
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# Next.js Route Generator

Generate a complete Next.js App Router route segment with:

1. **page.tsx** — Server Component by default; only add `'use client'` if the page needs interactivity
2. **layout.tsx** — shared layout for the segment and its children (if needed)
3. **loading.tsx** — Suspense skeleton with appropriate loading UI
4. **error.tsx** — error boundary with `'use client'`, `reset()` button, and user-friendly message
5. **not-found.tsx** — 404 UI for this segment (if dynamic route)
6. **Metadata** — `generateMetadata()` or static `metadata` export for SEO
7. **Server Actions** — validated with Zod, auth-checked, with revalidation

### Template: error.tsx
```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Template: loading.tsx
```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  )
}
```
