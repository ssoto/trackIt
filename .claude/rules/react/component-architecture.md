---
paths:
  - **/*.tsx
  - **/*.jsx
---

# React Component Architecture

## Component Design
- One exported component per file, filename matches component name (`UserProfile.tsx`)
- Props interface named `ComponentNameProps`, declared immediately before component
- Destructure props in function signature; keep components under 120 lines
- Use semantic HTML with proper ARIA attributes; event handlers named `handleEventName`

## Composition Over Prop Drilling
- When data crosses >2 component levels, use context or composition (children pattern)
- Never drill props through intermediate components that do not use them

## Custom Hooks
- Name: `useDescriptiveAction` — `useAuth`, `useDebounce`, `usePagination`
- One concrete purpose per hook; avoid generic lifecycle wrappers (`useMount`)
- Return descriptively named objects for complex returns, not positional arrays
- Document with JSDoc when behavior is non-obvious

## State Colocation Rules
1. Computable from props/state? → Derive inline or `useMemo`
2. Used by single component? → Local `useState`
3. Shared between siblings? → Lift to nearest common parent
4. Shared across distant components? → Context (low-frequency) or state library (high-frequency)
5. Survives navigation? → URL params, localStorage, or global store

## List Rendering
- Always use stable, unique `key` from data identity — never array index on dynamic lists
- Extract list items into own component when they have non-trivial logic

## Naming Conventions
| Concept | Pattern | Example |
|---------|---------|---------|
| Component file | PascalCase.tsx | `UserProfile.tsx` |
| Hook file | camelCase.ts | `useAuth.ts` |
| Props interface | ComponentNameProps | `UserProfileProps` |
| Event handler | handleEventName | `handleSubmit` |
| Event prop | onEventName | `onSubmit` |
| Context | NameContext / useName | `AuthContext` / `useAuth` |

For detailed examples and reference, invoke: /react-patterns-guide
