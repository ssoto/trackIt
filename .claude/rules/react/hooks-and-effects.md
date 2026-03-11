---
paths:
  - **/*.tsx
  - **/*.jsx
---

# React Hooks & Effects

## Rules of Hooks (non-negotiable)
- Only call hooks at the top level of a component or custom hook
- Never call hooks inside loops, conditions, nested functions, try/catch blocks, or after early returns
- Custom hooks must start with `use` prefix followed by a capital letter
- Always include all reactive values in dependency arrays — enable `eslint-plugin-react-hooks`

## When NOT to Use useEffect
- **Deriving values** — compute inline during render, not via state+effect
- **Expensive computations** — use `useMemo`, not effect+setState
- **Resetting state on identity change** — use `key` prop to force remount
- **Reacting to user events** — call from event handlers, not effects watching state
- **Notifying parents** — call parent callback in the same handler that sets state

## Legitimate Uses of useEffect
- Subscribing to external stores (prefer `useSyncExternalStore`)
- WebSockets, EventSource, third-party widget libraries
- DOM event listeners not managed by React
- Browser APIs (IntersectionObserver, ResizeObserver, MediaQuery)
- Data fetching on mount/dependency change (always include cleanup for race conditions)

## Effect Cleanup
- Every effect that acquires a resource MUST return a cleanup function
- Use AbortController for fetch, cancelled flags for async chains
- Clear timers, remove event listeners, close connections

For detailed examples and reference, invoke: /react-hooks-guide
