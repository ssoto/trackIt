---
paths:
  - app/**/*
  - src/app/**/*
---

# Next.js App Router Architecture

## Route Segment File Conventions
Every route segment supports these special files, rendered in this hierarchy:
1. `layout.tsx` — persistent shared UI (wraps everything below)
2. `template.tsx` — like layout but re-mounts on navigation
3. `error.tsx` — React error boundary
4. `loading.tsx` — Suspense boundary (shows skeleton while page loads)
5. `not-found.tsx` — not-found error boundary
6. `page.tsx` — the route's unique UI

## Server Components vs Client Components
- Default is Server Component — no directive needed
- Add `'use client'` ONLY on leaf-level components that need interactivity
- Server: data fetching, secrets, heavy computation, static rendering
- Client: `useState`/`useEffect`, event handlers, browser APIs, custom hooks with state
- Never put `'use client'` at page or layout level — keeps entire subtree client-side

## Interleaving Pattern
- Pass Server Components as `children` or props to Client Components to keep them server-rendered
- Client Components cannot `import` Server Components, but can receive them as `children`

## Route Organization
- Route groups `(groupName)/` scope layouts without affecting the URL
- Dynamic routes: `[slug]`, catch-all: `[...path]`, optional: `[[...path]]`
- Use `generateStaticParams()` for dynamic routes that can be statically generated
- Call `notFound()` for missing resources instead of returning null

## Key Rules
- Always create `loading.tsx` for segments with async data fetching
- Always create `error.tsx` with a retry mechanism and user-friendly message
- Export `metadata` or `generateMetadata` from all pages for SEO
- Props passed from Server to Client Components must be serializable (no functions, Dates, class instances)
