---
paths:
  - **/*.tsx
  - **/*.jsx
---

# React Performance

## Memoization — Profile Before Optimizing
- Do NOT apply memoization speculatively — measure first with React DevTools Profiler
- **React.memo**: use when component renders often with same props or renders expensive sub-trees
- **useMemo**: use when computation is measurably expensive (>1ms) or result is prop to memoized child
- **useCallback**: use when callback is dependency of child's effect/memo or passed to React.memo'd child

## Avoiding Unnecessary Re-renders
- Move state down — if only a sub-tree needs the state, colocate it there
- Extract expensive children into own components that receive stable props
- Split context providers by update frequency — never put everything in one context
- Avoid inline object/array literals in JSX props (creates new reference every render)

## Code Splitting
- Use `React.lazy` + `Suspense` for route-level code splitting
- Use dynamic `import()` for heavy third-party libraries loaded on demand

## Virtualization
- For lists >100 items, use windowing (`react-window`, `@tanstack/react-virtual`)
- Never render thousands of DOM nodes — virtualize or paginate

## Transitions
- `useTransition` to mark expensive state updates as non-urgent
- `useDeferredValue` to defer rendering of filtered/search results during typing

For detailed examples and reference, invoke: /react-performance-guide
