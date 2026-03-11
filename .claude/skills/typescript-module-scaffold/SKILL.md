---
name: typescript-module-scaffold
description: "Scaffold a new TypeScript module with types, implementation, tests, and barrel export"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# TypeScript Module Scaffold Skill

## When to Use
When creating a new feature module with its type definitions, implementation, unit tests,
and exports. This ensures consistent structure across the codebase.

## Steps

### 1. Create the type definitions file
```typescript
// src/{feature}/{feature}.types.ts
export interface {Feature}Config {
  // Configuration options
}

export interface {Feature}Result {
  // Return type
}

export type {Feature}Error =
  | { code: 'NOT_FOUND'; message: string }
  | { code: 'VALIDATION'; message: string; field: string }
  | { code: 'INTERNAL'; message: string; cause?: Error };
```

### 2. Create the implementation file
```typescript
// src/{feature}/{feature}.service.ts
import type { {Feature}Config, {Feature}Result, {Feature}Error } from './{feature}.types.js';

export function create{Feature}(config: {Feature}Config): {Feature}Result {
  // Implementation
}
```

### 3. Create the test file
```typescript
// src/{feature}/{feature}.test.ts
import { describe, it, expect } from 'vitest'; // or jest
import { create{Feature} } from './{feature}.service.js';
import type { {Feature}Config } from './{feature}.types.js';

describe('create{Feature}', () => {
  it('should handle valid input', () => {
    const config: {Feature}Config = { /* ... */ };
    const result = create{Feature}(config);
    expect(result).toBeDefined();
  });

  it('should throw on invalid input', () => {
    expect(() => create{Feature}(null as any)).toThrow();
  });
});
```

### 4. Create barrel export (only at module boundary)
```typescript
// src/{feature}/index.ts
export type { {Feature}Config, {Feature}Result, {Feature}Error } from './{feature}.types.js';
export { create{Feature} } from './{feature}.service.js';
```

## Checklist
- [ ] Types file created with all public interfaces
- [ ] Implementation file imports types with `import type`
- [ ] Test file covers happy path, edge cases, and error cases
- [ ] Barrel export re-exports only the public API
- [ ] All exported functions have explicit return types
- [ ] File names use kebab-case
