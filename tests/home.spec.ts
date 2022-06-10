import { test, expect } from '@playwright/test';

test.describe("Home", () => {
    test('Not logged in should redirect to login', async ({ page }) => {
        await page.goto('/home');

        await page.waitForURL("/account/login");
        await expect(page).toHaveURL("/account/login");
    });
});

