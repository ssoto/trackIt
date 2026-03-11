---
name: ts-async-guide
description: Detailed reference for TypeScript async/await patterns and Promise handling
disable-model-invocation: true
user-invocable: true
---

# TypeScript Async Patterns — Detailed Reference

## Why This Matters
Incorrect async handling is one of the most common sources of runtime bugs in TypeScript
applications. These rules prevent unhandled rejections, race conditions, and performance
pitfalls.

---

## Rules

### Always await or return Promises — never ignore them

#### Correct
```typescript
async function saveUser(user: User): Promise<void> {
  await userRepository.save(user);
  await auditLog.record('user_saved', user.id);
}
```

#### Anti-Pattern
```typescript
// BAD: fire-and-forget — unhandled rejection if save fails
async function saveUser(user: User): Promise<void> {
  userRepository.save(user); // Missing await — silent failure
  auditLog.record('user_saved', user.id);
}
```

---

### Use `Promise.all` for independent concurrent operations

#### Correct
```typescript
async function loadDashboard(userId: string): Promise<Dashboard> {
  const [user, orders, notifications] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchNotifications(userId),
  ]);
  return { user, orders, notifications };
}
```

#### Anti-Pattern
```typescript
// BAD: sequential awaits when operations are independent — 3x slower
async function loadDashboard(userId: string): Promise<Dashboard> {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(userId);
  const notifications = await fetchNotifications(userId);
  return { user, orders, notifications };
}
```

---

### Use `Promise.allSettled` when partial failure is acceptable

#### Correct
```typescript
const results = await Promise.allSettled([
  sendEmail(user.email),
  sendPush(user.deviceToken),
  sendSms(user.phone),
]);

const failures = results.filter(
  (r): r is PromiseRejectedResult => r.status === 'rejected',
);
if (failures.length > 0) {
  logger.warn('Some notifications failed', { failures });
}
```

---

### Type async function return values explicitly

#### Correct
```typescript
// Explicit Promise<T> return type — callers know exactly what to expect
export async function getConfig(): Promise<AppConfig> {
  const raw = await fs.readFile('config.json', 'utf-8');
  return JSON.parse(raw) as AppConfig;
}
```

---

### Avoid async functions that do not await anything

#### Anti-Pattern
```typescript
// BAD: async keyword is unnecessary — adds overhead wrapping in Promise
async function add(a: number, b: number): Promise<number> {
  return a + b;
}

// GOOD: return plain value or wrap explicitly if needed
function add(a: number, b: number): number {
  return a + b;
}
```
