---
name: ts-naming-guide
description: Detailed reference for TypeScript naming conventions and project structure
disable-model-invocation: true
user-invocable: true
---

# TypeScript Naming & Project Structure — Detailed Reference

## Why This Matters
Consistent naming and structure eliminate ambiguity, reduce cognitive load when navigating
the codebase, and make code self-documenting. These conventions follow the Google TypeScript
Style Guide and the TypeScript Handbook.

---

## Naming Conventions

### Identifiers

| Construct | Convention | Example |
|-----------|-----------|---------|
| Variables, functions, methods | camelCase | `getUserById`, `remainingRetries` |
| Classes, interfaces, type aliases, enums | PascalCase | `UserService`, `ApiResponse` |
| Constants (compile-time / env-level) | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Config objects, module-level non-primitive constants | camelCase | `defaultConfig`, `routeMap` |
| Generic type parameters | Single uppercase or T-prefix | `T`, `K`, `V`, `TResponse`, `TInput` |
| Boolean variables and properties | `is`, `has`, `should`, `can` prefix | `isActive`, `hasPermission`, `canEdit` |
| Private class members | no underscore prefix | `private count` (not `private _count`) |

### Interfaces and Types
- No `I` prefix on interfaces: `User`, not `IUser`
- No `T` prefix on type aliases (except generics): `ApiResponse`, not `TApiResponse`
- Interfaces describe shapes: `UserRepository`, `CacheOptions`
- Type aliases describe unions/compositions: `HttpMethod`, `Result<T, E>`

### Files and Directories
- Use kebab-case for all file names: `user-service.ts`, `api-client.ts`
- Use `.ts` for pure TypeScript, `.tsx` only for files containing JSX
- Test files: `*.test.ts` or `*.spec.ts` (be consistent within the project)
- Barrel files (`index.ts`) only at package/module boundaries — not in every directory

---

## Project Structure

### Feature-Based Organization (Preferred)
```
src/
  auth/
    auth.service.ts
    auth.controller.ts
    auth.types.ts
    auth.test.ts
  orders/
    orders.service.ts
    orders.repository.ts
    orders.types.ts
    orders.test.ts
  shared/
    errors.ts
    logger.ts
    types.ts
```

### Anti-Pattern: Layer-Based Organization
```
src/
  controllers/
    auth.controller.ts
    orders.controller.ts
  services/
    auth.service.ts
    orders.service.ts
  # Problem: adding a feature requires touching many directories
  # Problem: related code is scattered, increasing coupling between modules
```

---

## Declaration Order Within a File

1. Type imports (`import type { ... }`)
2. Value imports (external packages)
3. Value imports (internal modules)
4. Type/interface declarations
5. Constants
6. Exported functions/classes
7. Internal (non-exported) functions

---

## Generic Type Parameter Naming

#### Correct
```typescript
// Simple: single uppercase letter
function identity<T>(value: T): T { return value; }
function mapEntries<K, V>(map: Map<K, V>): [K, V][] { /* ... */ }

// Complex: descriptive T-prefixed name
function transform<TInput, TOutput>(
  input: TInput,
  fn: (val: TInput) => TOutput,
): TOutput {
  return fn(input);
}
```

#### Anti-Pattern
```typescript
// BAD: meaningless multi-letter names that aren't T-prefixed
function transform<A, B>(input: A, fn: (val: A) => B): B {
  return fn(input);
}
```
