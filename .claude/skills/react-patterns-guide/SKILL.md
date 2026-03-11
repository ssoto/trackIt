---
name: react-patterns-guide
description: "Detailed reference for React component design, composition, and state architecture"
disable-model-invocation: true
user-invocable: true
---

# React Component Architecture — Detailed Reference

## Component Design
- One exported component per file, filename matches component name (`UserProfile.tsx`)
- Props interface named `ComponentNameProps` and declared immediately before the component
- Destructure props in the function signature for readability
- Keep components under 120 lines — extract sub-components or custom hooks when growing

### Correct
```tsx
interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
  isHighlighted?: boolean;
}

export function UserCard({ user, onSelect, isHighlighted = false }: UserCardProps) {
  function handleClick() {
    onSelect(user.id);
  }

  return (
    <article
      className={cn('user-card', { highlighted: isHighlighted })}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
      aria-label={`Select ${user.name}`}
    >
      <Avatar src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </article>
  );
}
```

## Composition Over Prop Drilling
When data needs to cross more than 2 component levels, prefer composition:

```tsx
// WRONG: drilling theme through 3+ levels
<App theme={theme}>
  <Layout theme={theme}>
    <Sidebar theme={theme}>
      <NavItem theme={theme} />

// CORRECT: composition via children
<ThemeProvider value={theme}>
  <Layout>
    <Sidebar>
      <NavItem /> {/* reads theme via useTheme() */}
```

## Custom Hooks
- Name hooks `useDescriptiveAction` — `useAuth`, `useDebounce`, `usePagination`
- Each hook serves one concrete purpose — avoid generic lifecycle wrappers (`useMount`, `useUpdateEffect`)
- Return descriptively named values, not positional arrays for complex returns
- Document the hook's contract with JSDoc when it has non-obvious behavior

### Correct
```tsx
/** Debounces a value by the given delay. Returns the debounced value. */
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

### Anti-Pattern
```tsx
// WRONG: generic lifecycle wrapper — hides intent, suppresses lint warnings
function useMount(fn: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fn(); }, []);
}
```

## State Colocation Rules
1. Can it be computed from existing props or state? → Derive it inline or with useMemo
2. Is it used by a single component? → Keep it local with useState
3. Is it shared between siblings? → Lift to the nearest common parent
4. Is it shared across distant components? → Use context (for low-frequency updates) or a state library (for high-frequency updates)
5. Does it need to survive navigation? → Use URL search params, localStorage, or a global store

## List Rendering
- Always provide a stable, unique `key` — never use array index for lists that reorder, insert, or delete
- Extract the list item into its own component when it has non-trivial logic

```tsx
// CORRECT: stable key from data identity
{users.map((user) => (
  <UserCard key={user.id} user={user} onSelect={handleSelect} />
))}

// WRONG: index key on a dynamic list
{users.map((user, index) => (
  <UserCard key={index} user={user} onSelect={handleSelect} />
))}
```

## Naming Conventions
| Concept | Pattern | Example |
|---------|---------|---------|
| Component file | PascalCase.tsx | `UserProfile.tsx` |
| Hook file | camelCase.ts | `useAuth.ts` |
| Utility file | camelCase.ts | `formatDate.ts` |
| Test file | *.test.tsx | `UserProfile.test.tsx` |
| Component name | PascalCase | `UserProfile` |
| Props interface | ComponentNameProps | `UserProfileProps` |
| Event handler | handleEventName | `handleSubmit` |
| Event prop | onEventName | `onSubmit` |
| Context | NameContext | `AuthContext` |
| Provider | NameProvider | `AuthProvider` |
| Context hook | useName | `useAuth` |
