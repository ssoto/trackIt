# Git Workflow & Conventional Commits

## Conventional Commits Format (v1.0.0)
- Format: `<type>[optional scope]: <description>`
- Types: feat (MINOR), fix (PATCH), docs, style, refactor, perf, test, chore, ci, build, revert
- Breaking changes: footer `BREAKING CHANGE: desc` or `feat(api)!: desc` (triggers MAJOR)

## Branch Discipline
- Keep commits atomic — one logical change per commit
- Write commit subjects in imperative mood: "add feature" not "added feature"
- Subject line max 72 characters; body wraps at 80
- Squash WIP commits before merging to main
- Never commit generated files, build artifacts, or OS-specific files (.DS_Store, Thumbs.db)
- Never force-push to shared branches (main, develop, release/*)

## Pre-Commit Checklist
- Code compiles without errors
- All tests pass
- No secrets or credentials in the diff
- Commit message follows Conventional Commits format
- Changes are scoped to one logical change

For detailed examples and reference, invoke: /git-workflow-guide
