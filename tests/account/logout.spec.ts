import { test, expect } from '@playwright/test';

test.describe("Logout", () => {
    test('Logging out redirect to landing page', async ({ page }) => {
        // Go to /account/login
        await page.goto('/account/login');

        // Click input[name="email"]
        await page.locator('input[name="email"]').click();

        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill('veryindecisivestudios+test@gmail.com');

        // Click input[name="password"]
        await page.locator('input[name="password"]').click();

        // Fill input[name="password"]
        await page.locator('input[name="password"]').fill('testme99');

        // Click div[role="checkbox"]
        await page.frameLocator('text=Email addressPasswordForget password?Login >> iframe').locator('div[role="checkbox"]').click();
        await page.waitForTimeout(2000);

        // Click button:has-text("Login")
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button:has-text("Login")').click()
        ]);

        await page.waitForURL("/home");

        // Click button[role="button"]:has-text("veryindecisivestudios+test")
        await page.locator('button[role="button"]:has-text("vis-test")').click();
        
        // Click button[role="menuitem"]:has-text("Logout")
        await Promise.all([
            page.waitForNavigation(/*{ url: 'http://localhost:3000/account/login' }*/),
            page.locator('button[role="menuitem"]:has-text("Logout")').click()
        ]);

        await page.waitForURL("/");
        await expect(page).toHaveURL("/");
    });
});

