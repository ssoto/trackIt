---
name: react-component-generator
description: Generate React components following project conventions and best practices
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# React Component Generator

When generating a React component, produce the following files:

## Component File (`ComponentName.tsx`)
1. Props interface (`ComponentNameProps`) with JSDoc on non-obvious fields
2. Functional component with destructured props and default values
3. Semantic HTML markup with proper ARIA attributes
4. Event handlers named `handleEventName`
5. Hooks at the top, ordered: state hooks, context, refs, derived values, effects

## Test File (`ComponentName.test.tsx`)
1. Import render, screen, userEvent from testing library
2. Test rendering with required props (happy path)
3. Test user interactions (click, type, keyboard)
4. Test conditional rendering (loading, error, empty states)
5. Test accessibility (roles, labels, keyboard navigation)

## Custom Hook (if applicable — `useHookName.ts`)
1. Typed parameters and return value
2. Cleanup in useEffect if subscriptions or timers are used
3. Companion test file using `renderHook`

## Conventions
- CSS Modules (`ComponentName.module.css`) or styled-components based on project convention
- Storybook story (`ComponentName.stories.tsx`) if Storybook is present in the project
- All files colocated in the same feature directory
