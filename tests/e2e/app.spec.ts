import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
    test('loads and shows the TrackIt header', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'TrackIt' })).toBeVisible();
        await expect(page.getByText('Simple time tracking for your daily tasks')).toBeVisible();
    });

    test('renders the weekly calendar', async ({ page }) => {
        await page.goto('/');
        // WeeklyCalendar shows day abbreviations (Mon, Tue, …)
        await expect(page.getByText('Mon')).toBeVisible();
        await expect(page.getByText('Tue')).toBeVisible();
    });

    test('renders the daily summary section', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByRole('heading', { name: 'Daily Summary' })).toBeVisible();
        await expect(page.getByText('Total This Week')).toBeVisible();
    });

    test('renders the floating task timer', async ({ page }) => {
        await page.goto('/');
        // TaskTimer is fixed top-right; it contains a text input for the task description
        const timer = page.locator('[class*="fixed"][class*="top-4"][class*="right-4"]');
        await expect(timer).toBeVisible();
    });
});

test.describe('Weekends toggle', () => {
    test('shows Hide Weekends button after mount', async ({ page }) => {
        await page.goto('/');
        const btn = page.getByRole('button', { name: /hide weekends|show weekends/i });
        await expect(btn).toBeVisible();
    });

    test('toggles weekend visibility', async ({ page }) => {
        await page.goto('/');
        const btn = page.getByRole('button', { name: /hide weekends|show weekends/i });
        const initial = await btn.innerText();
        await btn.click();
        const after = await btn.innerText();
        expect(after).not.toBe(initial);
    });

    test('persists preference in localStorage', async ({ page }) => {
        await page.goto('/');
        // Click to hide weekends
        const btn = page.getByRole('button', { name: /hide weekends/i });
        await btn.click();
        await expect(page.getByRole('button', { name: /show weekends/i })).toBeVisible();

        // Reload and check it persisted
        await page.reload();
        await expect(page.getByRole('button', { name: /show weekends/i })).toBeVisible();
    });
});
