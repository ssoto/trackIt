---
name: react-hook-generator
description: Generate custom React hooks with proper patterns
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# React Custom Hook Generator

When generating a custom hook, follow these rules:

## File: `useHookName.ts`
1. Name starts with `use` + capital letter describing the concrete purpose
2. Typed parameters — use an options object for 3+ parameters
3. Typed return value — use an object with descriptive keys for complex returns
4. Include JSDoc documenting purpose, parameters, and return value
5. Handle cleanup in useEffect (AbortController, clearTimeout, removeEventListener)
6. Include all reactive values in dependency arrays

## File: `useHookName.test.ts`
1. Use `renderHook` from `@testing-library/react`
2. Test initial state
3. Test state changes via `act()`
4. Test cleanup on unmount
5. Test re-renders with changed dependencies

## Patterns to Apply
- Prefer `useSyncExternalStore` over useEffect for external store subscriptions
- Use AbortController for fetch-based hooks to prevent race conditions
- Return `{ data, isLoading, error }` for data-fetching hooks
- Use generics when the hook is reusable across different data types
