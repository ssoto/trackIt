# Sensitive Data Protection

## Absolute Rules (NEVER violate)
- NEVER read .env files, .pem files, credential files, or SSH keys
- NEVER output API keys, passwords, tokens, or secrets in responses
- NEVER commit sensitive data to version control
- NEVER log PII (personally identifiable information) in plain text

## Protected File Patterns
- `.env*`
- `**/*.pem`
- `**/*.key`
- `**/secrets/**`
- `**/.aws/**`
- `**/.ssh/**`
- `**/credentials*`
- `**/*.pfx`
- `**/*.p12`

## When Working with Config Files
- Use environment variables for secrets, never hardcoded values
- Reference `.env.example` for required variables, not `.env`
- Use secret management services for production credentials
