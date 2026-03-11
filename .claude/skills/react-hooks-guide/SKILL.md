---
name: react-hooks-guide
description: "Detailed reference for React hooks rules, effect discipline, and avoiding unnecessary effects"
disable-model-invocation: true
user-invocable: true
---

# React Hooks & Effects — Detailed Reference

## Rules of Hooks (non-negotiable)
- Only call hooks at the top level of a component or custom hook
- Never call hooks inside loops, conditions, nested functions, try/catch blocks, or after early returns
- Custom hooks must start with the `use` prefix followed by a capital letter
- Always include all reactive values (props, state, derived values) in dependency arrays
- Install and enable `eslint-plugin-react-hooks` with the exhaustive-deps rule

### Correct
```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetchUser(userId).then((data) => {
      if (!cancelled) {
        setUser(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [userId]);

  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;
  return <ProfileCard user={user} />;
}
```

### Anti-Pattern
```tsx
function UserProfile({ userId }: { userId: string }) {
  // WRONG: hook called conditionally
  if (!userId) return null;
  const [user, setUser] = useState<User | null>(null);

  // WRONG: hook inside condition
  if (userId) {
    useEffect(() => { fetchUser(userId); }, [userId]);
  }
}
```

## When NOT to Use useEffect

### 1. Deriving values — compute during render
```tsx
// WRONG: redundant state + effect for derived value
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// CORRECT: compute inline
const fullName = firstName + ' ' + lastName;
```

### 2. Expensive computations — use useMemo
```tsx
// WRONG: effect + state for filtering
const [filtered, setFiltered] = useState<Todo[]>([]);
useEffect(() => {
  setFiltered(todos.filter((t) => t.status === filter));
}, [todos, filter]);

// CORRECT: useMemo
const filtered = useMemo(
  () => todos.filter((t) => t.status === filter),
  [todos, filter],
);
```

### 3. Resetting state on identity change — use key
```tsx
// WRONG: effect to reset comment on user change
useEffect(() => { setComment(''); }, [userId]);

// CORRECT: key forces full remount and state reset
<CommentForm key={userId} userId={userId} />
```

### 4. Reacting to user events — use event handlers
```tsx
// WRONG: effect reacting to state set by an event
useEffect(() => {
  if (submitted) {
    postForm(formData);
  }
}, [submitted, formData]);

// CORRECT: call directly from the handler
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  postForm(formData);
}
```

### 5. Notifying parents — call in the handler
```tsx
// WRONG: effect to notify parent of state change
useEffect(() => { onChange(value); }, [value, onChange]);

// CORRECT: notify in the same handler that sets state
function handleChange(next: string) {
  setValue(next);
  onChange(next);
}
```

## Legitimate Uses of useEffect
- Subscribing to external stores (prefer `useSyncExternalStore` when possible)
- Connecting to WebSockets, EventSource, or third-party widget libraries
- Setting up and tearing down DOM event listeners not managed by React
- Synchronizing with browser APIs (IntersectionObserver, ResizeObserver, MediaQuery)
- Fetching data on mount or when dependencies change (always include a cleanup flag for race conditions)

## Effect Cleanup
Every effect that acquires a resource MUST return a cleanup function:

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((res) => res.json())
    .then((data) => setData(data))
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err);
    });
  return () => controller.abort();
}, [url]);
```
