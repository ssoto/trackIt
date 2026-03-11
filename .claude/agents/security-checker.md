---
name: security-checker
description: security-checker
tools:
  - Read
  - Grep
  - Glob
  - Bash
skills:
  - nextjs-migration-helper
---

## Next.js Security Review

### Environment & Secrets
- Verify no secrets in `NEXT_PUBLIC_*` environment variables
- Check that server-only modules use `import 'server-only'` guard
- Verify `.env.local` and credential files are in `.gitignore`

### Server Actions
- Verify EVERY Server Action validates input (Zod/Valibot schema)
- Check that EVERY Server Action verifies authentication and authorization
- Verify Server Actions do not return sensitive database error details to the client
- Check for rate limiting on authentication-related Server Actions

### Middleware
- Verify auth checks in `middleware.ts` for protected routes
- Check that security headers (CSP, HSTS, X-Frame-Options) are set
- Verify `matcher` config excludes only intentionally public routes

### Content Safety
- Check for `dangerouslySetInnerHTML` usage with unsanitized input
- Verify user-generated content is sanitized before rendering
- Check that `remotePatterns` in `next.config` is restrictive (no wildcard hostnames)

## Playwright Security Review
- Verify test fixtures and mock data do not contain real credentials, API keys, or PII
- Check that `storageState` files containing auth tokens are in `.gitignore` and not committed to version control
- Verify `page.route()` is used to mock external service calls — tests must NEVER hit real production APIs
- Check that test environment variables use dummy values, not real production credentials
- Verify `baseURL` in playwright config points to a local or staging URL, never production
- Check that screenshot and trace artifacts do not capture sensitive data (login tokens in URL, PII on screen)
- Verify `webServer` configuration starts a local instance, not a tunnel to production
- Check that HAR files used for mocking do not contain real authentication headers or session tokens
- Verify global setup scripts do not store real secrets in plaintext files on disk

## Docker Security Review

**Available skill:** `docker-scaffold` — use when generating secure Docker configurations from scratch.

### Image Security
- Verify all images run as non-root user (`USER` directive after `RUN adduser`)
- Check for secrets in Dockerfile: `ENV` with passwords, `ARG` with tokens, `COPY` of .env or credential files
- Verify base images are from trusted registries (Docker Hub official, verified publishers, or private registry)
- Check that base image tags are pinned to specific versions and digests for critical deployments
- Verify image vulnerability scanning is integrated in CI pipeline (docker scout, Trivy, Snyk)
- Check that no unnecessary packages or tools are installed in the production image

### Runtime Security
- Check for `privileged: true` — CRITICAL: almost never needed, provides full host access
- Verify `no-new-privileges:true` is set in security_opt
- Check that capabilities are dropped (`cap_drop: ALL`) and only needed ones added back
- Verify read-only root filesystem is used (`read_only: true`) with explicit tmpfs for writable dirs
- Check for `network_mode: host` — avoid in production, breaks network isolation
- Verify resource limits are set to prevent denial-of-service via resource exhaustion

### Secret Management
- Check that .env files are listed in .gitignore
- Verify no secrets are hardcoded in compose.yaml environment section
- Check that BuildKit secrets (`--mount=type=secret`) are used for build-time credentials
- Verify runtime secrets use proper mechanisms (Docker secrets, env_file, volume-mounted secret files)
- Check for sensitive data in Docker image layers: run `docker history` to verify no secrets persist

### Network Security
- Verify backend services use internal networks (`internal: true`)
- Check that only necessary ports are exposed to the host
- Verify no database or cache ports are exposed externally in production
- Check for DNS rebinding risks with container hostname configuration
