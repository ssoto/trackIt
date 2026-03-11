---
paths:
  - Dockerfile*
  - docker-compose*.yml
  - .dockerignore
---

# Docker Security

## Non-Root Execution (MANDATORY)
- Every production container MUST run as a non-root user
- Create a dedicated system user before COPY of app code
- Alpine: `addgroup -S app && adduser -S app -G app`
- Debian: `groupadd -r app && useradd -r -g app -s /sbin/nologin app`
- Set `USER app` after system package installs

## Secret Management
- Use BuildKit secrets for build-time credentials: `--mount=type=secret,id=...`
- Runtime: use Docker secrets, `env_file` in Compose, or volume-mounted secret files
- NEVER use `ENV` or `ARG` for secrets — they persist in image layer metadata
- NEVER COPY credential files into the image

## Image Hardening
- Use minimal base images: Alpine, slim, distroless, or scratch
- Drop all capabilities (`cap_drop: ALL`), add only needed ones
- Set `no-new-privileges:true` in security_opt
- Use `read_only: true` with explicit `tmpfs` for writable directories
- Run `docker scout cves` or `trivy image` in CI — fail on critical CVEs
- Rebuild images regularly for base image security patches

## Compose Security
- Never use `privileged: true` unless required with documented justification
- Use internal networks for backend services not needing external access
- Set resource limits (memory, CPU) to prevent exhaustion attacks
- Use `env_file` for secrets, add `.env` to `.gitignore`
