import { test, expect, type Page, type Locator } from '@playwright/test';

// Task descriptions are rendered as <input class="inline-edit" value={...}>.
// Playwright's getByText / filter({ hasText }) only match DOM text nodes, not input values.
// These helpers read the DOM property via inputValue() instead.

async function getTaskRow(page: Page, description: string): Promise<Locator> {
    const rows = page.locator('div').filter({ has: page.locator('input.inline-edit') });
    for (const row of await rows.all()) {
        const val = await row.locator('input.inline-edit').first().inputValue();
        if (val === description) return row;
    }
    throw new Error(`No task row found with description: "${description}"`);
}

async function waitForTask(page: Page, description: string, timeout = 5000) {
    await expect(async () => {
        await getTaskRow(page, description);
    }).toPass({ timeout });
}

test.describe('Task creation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[class*="animate-spin"]', { state: 'detached', timeout: 10_000 });
    });

    test('opens create form when Add button is clicked', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        await expect(page.getByPlaceholder('Task description')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Create Task' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('Create Task button is disabled when description is empty', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        const createBtn = page.getByRole('button', { name: 'Create Task' });
        await expect(createBtn).toBeDisabled();
    });

    test('Create Task button enables after typing a description', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        await page.getByPlaceholder('Task description').fill('My test task');
        const createBtn = page.getByRole('button', { name: 'Create Task' });
        await expect(createBtn).toBeEnabled();
    });

    test('Cancel closes the create form', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        await expect(page.getByPlaceholder('Task description')).toBeVisible();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByPlaceholder('Task description')).not.toBeVisible();
    });

    test('creates a task and shows it in the list', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();

        const description = `E2E task ${Date.now()}`;
        await page.getByPlaceholder('Task description').fill(description);
        await page.getByRole('button', { name: 'Create Task' }).click();

        // Form closes
        await expect(page.getByPlaceholder('Task description')).not.toBeVisible();

        // New task's inline-edit input appears with the description as its value
        await waitForTask(page, description);
    });
});

test.describe('Task deletion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[class*="animate-spin"]', { state: 'detached', timeout: 10_000 });
    });

    test('shows delete confirmation toast with Undo action', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        const description = `Delete me ${Date.now()}`;
        await page.getByPlaceholder('Task description').fill(description);
        await page.getByRole('button', { name: 'Create Task' }).click();
        await waitForTask(page, description);

        const taskRow = await getTaskRow(page, description);
        await taskRow.hover();
        await taskRow.getByRole('button', { name: 'Delete task' }).click();

        await expect(page.getByText(/will be deleted/i)).toBeVisible();
        await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible();
    });

    test('Undo cancels the deletion', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        const description = `Undo delete ${Date.now()}`;
        await page.getByPlaceholder('Task description').fill(description);
        await page.getByRole('button', { name: 'Create Task' }).click();
        await waitForTask(page, description);

        const taskRow = await getTaskRow(page, description);
        await taskRow.hover();
        await taskRow.getByRole('button', { name: 'Delete task' }).click();

        await page.getByRole('button', { name: 'Undo' }).click();

        // Task should still be present after undo
        await waitForTask(page, description);
    });
});

test.describe('Task status', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('[class*="animate-spin"]', { state: 'detached', timeout: 10_000 });
    });

    test('can change task status via status badge', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: 'Add' }).first();
        await addBtn.click();
        const description = `Status task ${Date.now()}`;
        await page.getByPlaceholder('Task description').fill(description);
        await page.getByRole('button', { name: 'Create Task' }).click();
        await waitForTask(page, description);

        const taskRow = await getTaskRow(page, description);
        const statusBadge = taskRow.getByRole('button', { name: /to do|in progress|done/i });
        await statusBadge.click();

        await expect(page.getByRole('button', { name: 'In Progress' }).first()).toBeVisible();
    });
});
