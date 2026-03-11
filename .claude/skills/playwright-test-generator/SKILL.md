---
name: playwright-test-generator
description: "Generate comprehensive Playwright end-to-end test suites with Page Object Model, fixtures, and proper locator strategy"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
context: fork
---

# Playwright Test Generator

## Purpose
Generate well-structured Playwright end-to-end test suites following official best practices: role-based locators, web-first assertions, custom fixtures, Page Object Model, and network mocking.

## Process

### 1. Analyze the Page Under Test
- Identify key user interactions: forms, buttons, navigation, dynamic content
- Map user flows: login, CRUD operations, multi-step wizards
- Identify external API calls that need mocking
- Identify visual elements that benefit from screenshot regression testing

### 2. Create Page Object Model
```typescript
import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

### 3. Create Custom Fixtures
```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login-page';

type TestFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
});

export { expect } from '@playwright/test';
```

### 4. Write Tests
```typescript
import { test, expect } from './fixtures';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    await test.step('Fill in credentials and submit', async () => {
      await loginPage.login('user@example.com', 'validpassword');
    });

    await test.step('Verify redirect to dashboard', async () => {
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    });
  });

  test('should show error for invalid credentials', async ({ loginPage }) => {
    await loginPage.login('user@example.com', 'wrongpassword');
    await loginPage.expectError('Invalid email or password');
  });

  test('should validate required fields', async ({ loginPage, page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});
```

### 5. Network Mocking Template
```typescript
test('should display products from API', async ({ page }) => {
  // Arrange — mock API before navigation
  await page.route('**/api/products', (route) =>
    route.fulfill({
      json: [
        { id: 1, name: 'Widget', price: 9.99 },
        { id: 2, name: 'Gadget', price: 19.99 },
      ],
    })
  );

  // Act
  await page.goto('/products');

  // Assert
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('Widget')).toBeVisible();
  await expect(page.getByText('$19.99')).toBeVisible();
});
```

### 6. API Testing Template
```typescript
import { test, expect } from '@playwright/test';

test('should create and retrieve a product via API', async ({ request }) => {
  // Create
  const createResponse = await request.post('/api/products', {
    data: { name: 'New Product', price: 29.99 },
  });
  expect(createResponse.ok()).toBeTruthy();
  const product = await createResponse.json();
  expect(product.name).toBe('New Product');

  // Retrieve
  const getResponse = await request.get(`/api/products/${product.id}`);
  expect(getResponse.ok()).toBeTruthy();
  const fetched = await getResponse.json();
  expect(fetched.price).toBe(29.99);
});
```

## Quality Checklist
- [ ] Page Objects encapsulate all locators and page-specific actions
- [ ] Locators use role-based or label-based selectors (no XPath, no CSS classes)
- [ ] All assertions use web-first `expect(locator)` methods
- [ ] No `page.waitForTimeout()` anywhere in the test suite
- [ ] External APIs are mocked with `page.route()` — no real external calls
- [ ] Tests are independent — run in any order, produce same results
- [ ] Complex flows use `test.step()` for trace viewer readability
- [ ] Authentication uses `storageState` pattern, not per-test login flows
- [ ] Custom fixtures provide typed setup and automatic teardown
