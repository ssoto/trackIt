import { test, expect, type Page } from '@playwright/test';

const TIMER = '[class*="fixed"][class*="top-4"][class*="right-4"]';

// Stops any currently running timer so tests always start in "Start" mode.
// Also used in afterEach to avoid polluting subsequent tests or test runs.
async function stopRunningTimer(page: Page) {
    const timer = page.locator(TIMER);
    // Wait for the widget to settle into a known state (either Start or Stop visible)
    await expect(
        timer.getByRole('button', { name: /^(start|stop)$/i })
    ).toBeVisible({ timeout: 5000 });

    const stopBtn = timer.getByRole('button', { name: 'Stop' });
    if (await stopBtn.isVisible()) {
        await stopBtn.click();
        await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible({ timeout: 5000 });
    }
}

test.describe('TaskTimer widget', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('trackit:activeProfileId', '1');
        });
        await page.goto('/');
        await stopRunningTimer(page);
    });

    test.afterEach(async ({ page }) => {
        // Clean up: stop any timer started during the test so it doesn't leak into
        // subsequent tests or future test runs (timers persist in SQLite).
        await stopRunningTimer(page);
    });

    test('shows task description input', async ({ page }) => {
        const timer = page.locator(TIMER);
        await expect(timer).toBeVisible();
        await expect(timer.getByPlaceholder('What are you working on?')).toBeVisible();
    });

    test('shows Start button when no timer is running', async ({ page }) => {
        const timer = page.locator(TIMER);
        await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible();
    });

    test('starts a timer and shows Stop button', async ({ page }) => {
        const timer = page.locator(TIMER);
        await timer.getByPlaceholder('What are you working on?').fill('Working on feature');
        await timer.getByRole('button', { name: 'Start' }).click();
        await expect(timer.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 5000 });
    });

    test('stops a running timer', async ({ page }) => {
        const timer = page.locator(TIMER);
        await timer.getByPlaceholder('What are you working on?').fill('Timer stop test');
        await timer.getByRole('button', { name: 'Start' }).click();
        await expect(timer.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 5000 });

        await timer.getByRole('button', { name: 'Stop' }).click();
        await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible({ timeout: 5000 });
    });
});
