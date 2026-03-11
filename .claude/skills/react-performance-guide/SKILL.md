---
name: react-performance-guide
description: Detailed reference for React performance optimization patterns
disable-model-invocation: true
user-invocable: true
---

# React Performance — Detailed Reference

## Memoization — Profile Before Optimizing
Do NOT apply memoization speculatively. Measure first with React DevTools Profiler.

### When to use React.memo
- The component renders often with the same props (parent re-renders but child props are stable)
- The component renders expensive sub-trees (large lists, charts, SVG)

```tsx
// Only memoize when profiling shows unnecessary re-renders
const ExpensiveList = React.memo(function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### When to use useMemo
- The computation is measurably expensive (>1ms in profiler)
- The result is passed as a prop to a memoized child

```tsx
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items],
);
```

### When to use useCallback
- The callback is a dependency of a child's useEffect or useMemo
- The callback is passed to a React.memo'd child

```tsx
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

## Avoiding Unnecessary Re-renders
- Move state down — if only a sub-tree needs the state, put it there
- Extract the expensive child into its own component that receives stable props
- Split context providers: separate frequently-changing values from rarely-changing values

```tsx
// WRONG: one context for everything causes all consumers to re-render
<AppContext.Provider value={{ user, theme, notifications }}>

// CORRECT: split by update frequency
<UserContext.Provider value={user}>
  <ThemeContext.Provider value={theme}>
    <NotificationContext.Provider value={notifications}>
```

## Code Splitting
- Use `React.lazy` + `Suspense` for route-level code splitting
- Use dynamic `import()` for heavy third-party libraries loaded on demand

```tsx
const AnalyticsDashboard = React.lazy(() => import('./AnalyticsDashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

## Virtualization
- For lists exceeding 100 items, use windowing (`react-window`, `@tanstack/react-virtual`)
- Never render thousands of DOM nodes — virtualize or paginate

## Transitions
- Use `useTransition` to mark expensive state updates as non-urgent
- Use `useDeferredValue` to defer rendering of search results or filtered lists during typing

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => filterResults(deferredQuery), [deferredQuery]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ResultList results={results} />
    </>
  );
}
```
