---
paths:
  - middleware.*
  - app/**/*.ts
  - src/app/**/*.ts
---

# Next.js Security

## Environment Variable Safety
- Only `NEXT_PUBLIC_*` variables are sent to the client — all others are server-only
- NEVER put API keys, database URLs, or secrets in `NEXT_PUBLIC_` variables
- Use `import 'server-only'` in modules that use secrets to get a build-time error if imported in a Client Component

### Correct
```typescript
// lib/api.ts
import 'server-only'

export async function fetchFromInternalAPI(path: string) {
  return fetch(`${process.env.INTERNAL_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${process.env.API_SECRET}` },
  })
}
```

### Anti-Pattern
```typescript
// BAD: secret exposed to client via NEXT_PUBLIC_ prefix
const API_KEY = process.env.NEXT_PUBLIC_API_KEY // anyone can read this in browser devtools
```

---

## Server Action Security Checklist
- [ ] Authenticate the caller (check session/JWT)
- [ ] Authorize the action (check user roles/permissions)
- [ ] Validate ALL inputs with a schema (Zod, Valibot)
- [ ] Never trust `formData` — cast carefully, reject unexpected fields
- [ ] Rate-limit sensitive actions (login, password reset)
- [ ] Never return raw database errors to the client
- [ ] Always use parameterized queries in data layer (no SQL injection via Server Actions)

---

## Middleware Security
- Validate auth tokens in `middleware.ts` for route protection — redirect unauthenticated users early
- Set security headers (`Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security`) in `middleware.ts` or `next.config.ts`
- Never trust `searchParams` or dynamic route params without validation

---

## Content Security
- Sanitize user-generated HTML before rendering (use `DOMPurify` or `sanitize-html`)
- Never use `dangerouslySetInnerHTML` with unsanitized user input
- Use `nonce` with Content-Security-Policy for inline scripts when needed
