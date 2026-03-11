---
name: ts-conventions-guide
description: Detailed reference for TypeScript type safety conventions with examples
disable-model-invocation: true
user-invocable: true
---

# TypeScript Conventions — Detailed Reference

## Why This Matters
TypeScript's type system prevents bugs at compile time, but only when used correctly.
These rules ensure maximum type safety, readability, and maintainability following
the TypeScript Handbook, Google TypeScript Style Guide, and community best practices.

---

## Type Safety Rules

### Never use `any` — use `unknown` and narrow
`any` disables all type checking and defeats the purpose of TypeScript. Use `unknown`
and narrow explicitly.

#### Correct
```typescript
function parseJson(raw: string): unknown {
  return JSON.parse(raw);
}

function processPayload(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name;
  }
  throw new TypeError('Expected object with name property');
}
```

#### Anti-Pattern
```typescript
// BAD: any disables all type checking — bugs slip through silently
function parseJson(raw: string): any {
  return JSON.parse(raw);
}

function processPayload(data: any): string {
  return data.name; // No error at compile time, crashes at runtime if name is missing
}
```

---

### Use discriminated unions for state — not boolean flags or string literals
Discriminated unions make states explicit, exhaustive checking enforced by the compiler.

#### Correct
```typescript
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: RequestState<T>): string {
  switch (state.status) {
    case 'idle': return 'Waiting...';
    case 'loading': return 'Loading...';
    case 'success': return `Got: ${String(state.data)}`;
    case 'error': return `Error: ${state.error.message}`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive; // Compile error if a case is missing
    }
  }
}
```

#### Anti-Pattern
```typescript
// BAD: boolean flags create impossible states (isLoading AND isError both true)
interface RequestState<T> {
  isLoading: boolean;
  isError: boolean;
  data: T | null;
  error: Error | null;
}
```

---

### Use `satisfies` for type-safe assignments that preserve inference

#### Correct
```typescript
type Route = { path: string; auth: boolean };
type Routes = Record<string, Route>;

const routes = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
} satisfies Routes;

// routes.home.path is inferred as '/' (literal), not string
```

#### Anti-Pattern
```typescript
// BAD: type annotation widens the type — loses literal inference
const routes: Routes = {
  home: { path: '/', auth: false },
  dashboard: { path: '/dashboard', auth: true },
};
// routes.home.path is now string, not '/'
```

---

### Use `as const` and const arrays instead of enum

#### Correct
```typescript
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = (typeof ROLES)[number]; // 'admin' | 'editor' | 'viewer'

function hasRole(role: Role): boolean {
  return ROLES.includes(role);
}
```

#### Anti-Pattern
```typescript
// BAD: enum generates runtime code, is nominally typed, and has quirks
// (numeric enums have reverse mappings, string enums don't)
enum Role {
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}
```

---

## Import Rules

### Use type-only imports for types

#### Correct
```typescript
import type { User, UserRole } from './types.js';
import { createUser, deleteUser } from './user-service.js';
```

#### Anti-Pattern
```typescript
// BAD: importing types as values — may generate unnecessary runtime imports
import { User, UserRole, createUser, deleteUser } from './user-service.js';
```

---

### Prefer named exports

#### Correct
```typescript
// user-service.ts
export function createUser(name: string): User { /* ... */ }
export function deleteUser(id: UserId): void { /* ... */ }
```

#### Anti-Pattern
```typescript
// BAD: default export — inconsistent import names across codebase
export default function createUser(name: string): User { /* ... */ }
// Imported as: import createUser from './user-service.js'
// Or: import makeUser from './user-service.js' — nothing prevents renaming
```

---

## Error Handling

### Type-safe catch blocks with `unknown`

#### Correct
```typescript
try {
  await fetchData(url);
} catch (err: unknown) {
  if (err instanceof HttpError) {
    logger.warn(`HTTP ${err.statusCode}: ${err.message}`);
  } else if (err instanceof Error) {
    logger.error('Unexpected error', { cause: err.message });
  } else {
    logger.error('Unknown thrown value', { value: String(err) });
  }
}
```

#### Anti-Pattern
```typescript
// BAD: assumes caught value is Error — thrown values can be anything
try {
  await fetchData(url);
} catch (err) {
  console.log(err.message); // Runtime crash if err is not an Error
}
```

---

## Null Safety

### Use nullish coalescing (`??`) and optional chaining (`?.`)

#### Correct
```typescript
const port = config.port ?? 3000;         // Only falls back on null/undefined
const city = user?.address?.city ?? 'Unknown';
```

#### Anti-Pattern
```typescript
// BAD: || treats 0, '', and false as falsy — unintended fallback
const port = config.port || 3000;         // port 0 becomes 3000
const name = user.displayName || 'Anonymous'; // '' becomes 'Anonymous'
```

---

## Function Signatures

### Explicit return types on exported functions
Exported functions should have explicit return types to serve as documentation,
prevent unintended return type widening, and improve compile speed.

#### Correct
```typescript
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export async function fetchUser(id: string): Promise<User | null> {
  const response = await api.get(`/users/${id}`);
  if (response.status === 404) return null;
  return response.data as User;
}
```

#### Anti-Pattern
```typescript
// BAD: no return type — callers infer a complex or inaccurate type
export function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
// Refactoring the body could silently change the return type, breaking callers
```
