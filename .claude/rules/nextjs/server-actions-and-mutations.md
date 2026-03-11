---
paths:
  - **/*action*.*
  - app/**/*.ts
---

# Server Actions & Mutations

## Core Rules
1. **Server Actions are public endpoints** — treat them like API routes; attackers can call them directly
2. **Validate ALL inputs** with a schema library (Zod, Valibot) on every Server Action
3. **Authorize the caller** — check session/permissions inside the action; never trust client auth state alone
4. **Revalidate after mutations** — call `revalidatePath()` or `revalidateTag()` before `redirect()`
5. **Return typed responses** — `{ success, data?, error? }` instead of throwing raw errors

## Server Action Checklist
- Files with Server Actions must have `'use server'` at the top
- Authenticate: verify session/JWT inside the action
- Authorize: check user roles/permissions
- Validate: parse input with Zod/Valibot schema
- Mutate: perform DB operation with error handling
- Revalidate: call `revalidatePath()` or `revalidateTag()`
- Redirect: call `redirect()` AFTER revalidation, never before
- Never return raw database errors to the client

## Client Component Integration
- Use `useActionState()` hook for form state management with Server Actions
- Disable submit button during pending state (`isPending`)
- Display action errors from returned state
- Use progressive enhancement: forms work without JS when using `<form action={action}>`
