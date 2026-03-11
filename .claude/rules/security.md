# Security Rules (OWASP Top 10 2025)

## A01: Broken Access Control
- Deny access by default; enforce authorization on every request, not just the UI
- Validate resource ownership (prevent IDOR); centralize access control logic

## A02: Security Misconfiguration
- No default credentials in production; disable debug modes and verbose errors
- Set security headers: CSP, X-Content-Type-Options, HSTS

## A03: Software Supply Chain Failures
- Pin dependency versions; audit regularly; verify lockfile integrity
- Minimize dependencies — prefer standard library when feasible

## A04: Cryptographic Failures
- Use established libraries only (AES-256, bcrypt/Argon2, SHA-256+)
- Never store passwords in plaintext; TLS 1.2+ for data in transit
- Never hardcode encryption keys or salts in source code

## A05: Injection
- ALWAYS use parameterized queries — never concatenate user input
- Validate all external input; use allowlists over denylists

## A06: Insecure Design
- Least privilege for all components; rate limiting on sensitive endpoints

## A07: Authentication Failures
- Strong passwords (min 12 chars), MFA for sensitive operations
- Secure sessions (HttpOnly, Secure, SameSite); throttle failed logins

## A08: Software or Data Integrity Failures
- Verify signatures on updates/artifacts; never deserialize untrusted data

## A09: Security Logging & Alerting Failures
- Log auth events and access control failures; never log sensitive data

## A10: Mishandling of Exceptional Conditions
- Handle all error paths; fail securely; never expose internals to users

## Sensitive Data Protection
- NEVER read, log, or output API keys, passwords, tokens, or private keys
- Use environment variables or secret managers — never hardcode credentials
- Handle PII with care — minimize collection, encrypt at rest, restrict access

For detailed examples and reference, invoke: /security-guide
