# Architecture & Code Style Rules

## Project Structure
- Organize code by feature/domain, not by technical layer when the project grows beyond trivial size
- Keep entry points thin: they wire dependencies and delegate to domain logic
- Separate I/O (filesystem, network, database) from pure business logic
- Configuration should live at the top level, not be scattered through the code

## Naming Conventions
- Names must reveal intent: `remainingRetries` not `r` or `cnt`
- Boolean variables: `isActive`, `hasPermission`, `shouldRetry`, `canEdit`
- Functions describe WHAT they do: `calculateTotalPrice()` not `process()`
- PascalCase for classes/interfaces/types/enums
- Avoid generic names: `Manager`, `Handler`, `Processor`, `Helper`, `Utils` — be specific
- UPPER_SNAKE_CASE for true constants; replace magic numbers with named constants
- No single-letter variables except loop counters (`i`, `j`)

## Function Design
- **Single responsibility**: one function = one task
- **Max 30 lines**: if longer, extract sub-functions
- **Max 3 parameters**: use an options/config object for more
- **No flag parameters**: prefer two separate functions over a boolean that changes behavior
- **No side effects**: a function named `getUser` must not modify state
- **Guard clauses**: validate inputs early and return, avoiding deep nesting

## Comments
- Code should be self-documenting — comments explain "why", never "what"
- Use comments for: business rule context, non-obvious trade-offs, TODO with ticket reference
- Delete commented-out code — version control is the history
- Keep comments updated — stale comments are worse than no comments

## Error Handling
- Never use empty catch blocks — always log or rethrow with context
- Always handle Promise rejections and async errors
- Use specific error types over generic ones
- Distinguish operational errors (expected) from programmer errors (bugs)
- Do not use exceptions for control flow

For detailed examples and reference, invoke: /architecture-style-guide
