---
paths:
  - Dockerfile*
  - docker-compose*.yml
  - .dockerignore
---

# Dockerfile Best Practices

## Multi-Stage Builds
- Every production Dockerfile MUST use multi-stage builds
- Separate build-time dependencies from runtime image
- Copy only artifacts needed at runtime with `COPY --from=builder`
- Use `--chown=app:app` on COPY to set correct ownership

## Layer Caching
- Order instructions from least-changing to most-changing
- Copy dependency manifests (package.json, go.mod) BEFORE source code
- Install dependencies in a separate layer from source code copy
- Use BuildKit cache mounts for package manager caches: `--mount=type=cache`

## Instruction Best Practices
- **FROM**: Pin to specific tag (`node:20.11-alpine3.19`), never use `:latest`
- **RUN**: Combine related commands with `&&`, clean caches in the same layer
- **COPY vs ADD**: Use COPY for all local files — ADD only for tar extraction
- **CMD vs ENTRYPOINT**: ENTRYPOINT for executable, CMD for default args; prefer exec form
- **USER**: Set non-root user after installing packages, before COPY of app code
- **HEALTHCHECK**: Always define for production images with appropriate intervals

## .dockerignore
- Always create a `.dockerignore` to minimize build context
- Exclude: `.git`, `node_modules`, `__pycache__`, `.venv`, `.env`, `.env.*`
- Exclude: `dist`, `build`, IDE configs, test files, Docker files themselves
- A large build context slows every build, even cached ones
