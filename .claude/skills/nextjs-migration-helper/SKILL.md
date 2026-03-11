---
name: nextjs-migration-helper
description: Migrate Pages Router patterns to App Router equivalents
---

# Next.js Pages Router to App Router Migration

## Migration Map

| Pages Router | App Router Equivalent |
|---|---|
| `pages/index.tsx` | `app/page.tsx` |
| `pages/about.tsx` | `app/about/page.tsx` |
| `pages/_app.tsx` | `app/layout.tsx` (root layout) |
| `pages/_document.tsx` | `app/layout.tsx` (`<html>`, `<body>` tags) |
| `pages/api/hello.ts` | `app/api/hello/route.ts` |
| `getServerSideProps` | Server Component with direct `async/await` fetch |
| `getStaticProps` | Server Component + `fetch` with `revalidate` or `force-cache` |
| `getStaticPaths` | `generateStaticParams()` |
| `useRouter().query` | `useSearchParams()` (Client) or `searchParams` prop (Server) |
| `useRouter().push` | `useRouter().push()` from `next/navigation` |
| `next/head` | `metadata` export or `generateMetadata()` |

## Key Differences
- App Router components are Server Components by default (no `getServerSideProps` needed)
- Data fetching happens directly in the component body, not in separate functions
- Layouts persist across navigations (no re-mount) — use `template.tsx` if re-mount is needed
- Route Handlers use Web Request/Response API, not `req, res` Node.js API
