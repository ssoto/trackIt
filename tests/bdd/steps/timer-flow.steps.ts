import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';

const { Given, When, Then, Before, After } = createBdd();

const TIMER_SELECTOR = '[class*="fixed"][class*="top-4"][class*="right-4"]';

async function stopRunningTimer(page: import('@playwright/test').Page) {
    const timer = page.locator(TIMER_SELECTOR);
    await expect(
        timer.getByRole('button', { name: /^(start|stop)$/i })
    ).toBeVisible({ timeout: 5000 });

    const stopBtn = timer.getByRole('button', { name: 'Stop' });
    if (await stopBtn.isVisible()) {
        await stopBtn.click();
        await expect(timer.getByRole('button', { name: 'Start' })).toBeVisible({ timeout: 5000 });
    }
}

Before(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[class*="animate-spin"]', { state: 'detached', timeout: 10_000 });
});

After(async ({ page }) => {
    await stopRunningTimer(page);
});

Given('the app is open', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'TrackIt' })).toBeVisible();
});

Given('no timer is currently running', async ({ page }) => {
    await stopRunningTimer(page);
});

When('I type {string} in the task description', async ({ page }, description: string) => {
    const timer = page.locator(TIMER_SELECTOR);
    await timer.getByPlaceholder('What are you working on?').fill(description);
});

When('I click the {string} button', async ({ page }, buttonName: string) => {
    const timer = page.locator(TIMER_SELECTOR);
    await timer.getByRole('button', { name: buttonName }).click();
});

Then('I should see the {string} button', async ({ page }, buttonName: string) => {
    const timer = page.locator(TIMER_SELECTOR);
    await expect(timer.getByRole('button', { name: buttonName })).toBeVisible({ timeout: 5000 });
});

Then('I should see the task description input', async ({ page }) => {
    const timer = page.locator(TIMER_SELECTOR);
    await expect(timer.getByPlaceholder('What are you working on?')).toBeVisible();
});

Then('the task {string} should appear in the daily summary', async ({ page }, description: string) => {
    const rows = page.locator('div').filter({ has: page.locator('input.inline-edit') });
    await expect(async () => {
        const allRows = await rows.all();
        for (const row of allRows) {
            const val = await row.locator('input.inline-edit').first().inputValue();
            if (val === description) return;
        }
        throw new Error(`Task "${description}" not found in daily summary`);
    }).toPass({ timeout: 5000 });
});
