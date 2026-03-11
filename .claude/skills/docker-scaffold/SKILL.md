---
name: docker-scaffold
description: Generate production-ready Dockerfile and Compose configuration for a project
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# Docker Scaffold

Generate a complete, production-ready Docker setup for a project including:

## 1. Dockerfile (multi-stage)

Generate a Dockerfile with these stages:
- **builder** — install dependencies, compile/transpile source
- **test** (optional) — run the test suite
- **runtime** — minimal production image with only runtime artifacts

Template structure:
```dockerfile
# Stage 1: Build
FROM <base>:<version>-alpine AS builder
WORKDIR /app
COPY <manifest-files> ./
RUN <install-dependencies>
COPY . .
RUN <build-command>

# Stage 2: Test (optional, use --target=test)
FROM builder AS test
RUN <test-command>

# Stage 3: Production runtime
FROM <base>:<version>-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/<artifacts> ./<artifacts>
USER app
EXPOSE <port>
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD <health-check-command>
CMD [<entrypoint>]
```

## 2. compose.yaml

Generate a Compose file with:
- Application service with build context, health check, resource limits, and restart policy
- Database service (if applicable) with named volume and health check
- Cache service (if applicable) with named volume and health check
- Proper networking with internal networks for backend services
- Extension fields for shared configuration (restart, logging)
- env_file references (never inline secrets)

## 3. compose.override.yaml

Generate a development override with:
- Volume mount for hot-reload
- Debug port exposure
- Development-specific environment variables
- Relaxed resource limits

## 4. .dockerignore

Generate a .dockerignore excluding:
- .git, node_modules, __pycache__, .venv
- .env files, IDE configs, OS files
- Test files, documentation, Docker config files themselves

## 5. .env.example

Generate a template with all required environment variables (placeholder values only).
