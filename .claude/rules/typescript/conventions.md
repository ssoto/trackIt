---
paths:
  - **/*.ts
  - **/*.tsx
  - **/*.mts
  - **/*.cts
---

# TypeScript Conventions

## Type Safety Rules

- **Never use `any`** — use `unknown` and narrow with type guards or `instanceof`
- **Discriminated unions over boolean flags** — make states explicit, use exhaustive `switch` with `never` default
- **Use `satisfies`** for type-safe assignments that preserve literal inference (not type annotations that widen)
- **Use `as const` arrays instead of `enum`** — derive union types with `(typeof ARR)[number]`
- **No type assertions (`as T`)** unless narrowing from `unknown` after validation

## Import Rules

- Use `import type { ... }` for type-only imports — avoids unnecessary runtime imports
- Prefer named exports over default exports — ensures consistent import names
- Group imports: node builtins, external packages, internal modules, type imports
- Barrel exports (`index.ts`) only at package/module boundaries

## Error Handling

- Always use `catch (err: unknown)` — narrow with `instanceof` before accessing properties
- Never assume caught values are `Error` — they can be any type

## Null Safety

- Use `??` (nullish coalescing) not `||` — avoids false positives on `0`, `''`, `false`
- Use `?.` (optional chaining) for safe property access

## Function Signatures

- Explicit return types on all exported functions — prevents unintended type widening
- Use `Promise<T>` return type on async exported functions
- Prefer options objects over long parameter lists (3+ params)

For detailed examples and reference, invoke: /ts-conventions-guide
