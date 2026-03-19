import { test, expect } from '@playwright/test';

test.describe('Profile selector — first visit', () => {
    test('shows profile selector overlay when no profile is set', async ({ page }) => {
        // Do NOT set activeProfileId so the overlay appears
        await page.goto('/');
        await expect(page.getByText('Selecciona un perfil')).toBeVisible({ timeout: 5000 });
    });

    test('selecting a profile dismisses the overlay and loads the main UI', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('Selecciona un perfil')).toBeVisible({ timeout: 5000 });

        // Click the first profile button (the default profile seeded by migration)
        const profileButtons = page.locator('button').filter({ hasText: /default/i });
        await profileButtons.first().click();

        // Overlay should disappear and main content should load
        await expect(page.getByText('Selecciona un perfil')).not.toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('heading', { name: 'TrackIt' })).toBeVisible();
    });
});

test.describe('Profile switcher pill', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('trackit:activeProfileId', '1');
        });
    });

    test('shows active profile name in the header pill', async ({ page }) => {
        await page.goto('/');
        // The pill shows the profile name (default profile name is "default")
        const pill = page.locator('button').filter({ hasText: /default/i }).first();
        await expect(pill).toBeVisible({ timeout: 5000 });
    });

    test('opens a dropdown when the pill is clicked', async ({ page }) => {
        await page.goto('/');
        const pill = page.locator('button').filter({ hasText: /default/i }).first();
        await pill.click();
        // Dropdown should contain "Gestionar perfiles" link
        await expect(page.getByText('Gestionar perfiles →')).toBeVisible({ timeout: 5000 });
    });
});

test.describe('Profiles management page', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('trackit:activeProfileId', '1');
        });
    });

    test('navigating to /profiles shows the profile list', async ({ page }) => {
        await page.goto('/profiles');
        await expect(page.getByRole('heading', { name: 'Gestionar perfiles' })).toBeVisible();
        // The default profile seeded by migration should appear
        await expect(page.getByText(/default/i).first()).toBeVisible();
    });

    test('can create a new profile', async ({ page }) => {
        await page.goto('/profiles');
        const uniqueName = `test${Date.now()}`.slice(0, 16);
        await page.getByPlaceholder('Nombre del perfil').fill(uniqueName);
        await page.getByRole('button', { name: 'Crear' }).click();
        // New profile should appear in the list
        await expect(page.getByText(uniqueName, { exact: false })).toBeVisible({ timeout: 5000 });
    });

    test('has a back link to the home page', async ({ page }) => {
        await page.goto('/profiles');
        const backLink = page.getByRole('link', { name: /volver al inicio/i });
        await expect(backLink).toBeVisible();
        await backLink.click();
        await expect(page).toHaveURL('/');
    });
});
