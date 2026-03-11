---
paths:
  - Dockerfile*
  - docker-compose*.yml
  - .dockerignore
---

# Docker Compose Patterns

## Service Definition
- Define health checks for every service using `healthcheck:`
- Use `depends_on` with `condition: service_healthy` (not just service name)
- Set resource limits: `deploy.resources.limits` for memory and CPUs
- Use `restart: unless-stopped` for production services
- Use named volumes for persistent data (not bind mounts in production)
- Use `env_file` for secrets instead of inline environment values

## Override Files
- `compose.override.yaml` auto-loads for local dev — add volumes, dev commands, debug ports
- Use `docker compose -f compose.yaml -f compose.prod.yaml up` for production overrides

## Profiles for Optional Services
- Use `profiles: ["debug"]` for optional services (debug tools, monitoring)
- Start with `docker compose --profile debug up`
- Default services (no profile) always start

## Extension Fields for DRY Config
- Define shared config with `x-common: &common` and merge with `<<: *common`
- Common fields: restart policy, logging driver, resource limits

## Networking
- Use separate networks for frontend and backend isolation
- Set `internal: true` on backend networks to prevent external access
- Never expose database/cache ports to the host in production
- Connect services only to the networks they need
