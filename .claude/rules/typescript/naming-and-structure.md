---
paths:
  - **/*.ts
  - **/*.tsx
---

# TypeScript Naming & Project Structure

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| Variables, functions, methods | camelCase | `getUserById`, `remainingRetries` |
| Classes, interfaces, type aliases | PascalCase | `UserService`, `ApiResponse` |
| Constants (compile-time / env-level) | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Config objects, module-level constants | camelCase | `defaultConfig`, `routeMap` |
| Generic type parameters | Single uppercase or T-prefix | `T`, `K`, `TResponse` |
| Boolean variables | `is`, `has`, `should`, `can` prefix | `isActive`, `hasPermission` |
| Private class members | no underscore prefix | `private count` (not `_count`) |

## Interfaces and Types
- No `I` prefix on interfaces: `User`, not `IUser`
- No `T` prefix on type aliases (except generics): `ApiResponse`, not `TApiResponse`
- Interfaces describe shapes; type aliases describe unions/compositions

## Files and Directories
- kebab-case for all file names: `user-service.ts`, `api-client.ts`
- `.ts` for pure TS, `.tsx` only for JSX files
- Test files: `*.test.ts` or `*.spec.ts` (consistent within project)
- Barrel `index.ts` only at package/module boundaries

## Project Structure
- Prefer feature-based organization (colocate service, types, tests per feature)
- Avoid layer-based organization (controllers/, services/) — scatters related code

## Declaration Order Within a File
1. Type imports (`import type`)
2. Value imports (external packages)
3. Value imports (internal modules)
4. Type/interface declarations
5. Constants
6. Exported functions/classes
7. Internal (non-exported) functions

## Generic Type Parameters
- Simple generics: single uppercase letter (`T`, `K`, `V`)
- Complex generics: descriptive T-prefixed name (`TInput`, `TOutput`)

For detailed examples and reference, invoke: /ts-naming-guide
