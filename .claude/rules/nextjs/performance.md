---
paths:
  - **/*.tsx
  - next.config.*
---

# Next.js Performance Optimization

## Image Optimization (next/image)
- Always use `next/image` instead of raw `<img>` tags
- Add `priority` prop to above-the-fold LCP images
- Use `placeholder="blur"` with static imports for progressive loading
- Remote images: specify `width`/`height` or use `fill` mode with a sized container
- Configure allowed remote domains in `next.config.ts` via `images.remotePatterns`
- Always provide meaningful `alt` text for accessibility

## Font Optimization (next/font)
- Use `next/font/google` or `next/font/local` — self-hosted, no external requests
- Apply via CSS variables (`variable` option) for flexibility across the app
- Set `display: 'swap'` to prevent invisible text during loading

## Bundle Optimization
- Use `next/dynamic` for heavy client components not needed on first render
- Set `ssr: false` only for components that truly cannot render on the server
- Prefer named imports for tree-shaking: `import { format } from 'date-fns'`
- Analyze bundle size regularly with `ANALYZE=true npm run build`

## Metadata & SEO
- Export `metadata` (static) or `generateMetadata` (dynamic) from every page
- Include title, description, and OpenGraph/Twitter card metadata
- Use file-based metadata: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`
- Implement JSON-LD structured data for rich search results

## Navigation
- Always use `next/link` for internal navigation — never raw `<a>` tags
- `next/link` provides client-side navigation, prefetching, and scroll restoration
