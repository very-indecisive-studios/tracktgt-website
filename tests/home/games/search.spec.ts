import { test, expect } from '@playwright/test';

test.describe("Games > Search", () => {
    // Login before each test.
    test.beforeEach(async ({ page }) => {
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
    });
    
    test("Title should search related games with title", async ({ page }) => {
       await page.goto("/home/games/search?title=apex+legends", { waitUntil: "networkidle" });
       
       const contentCount = await page.locator("h3:has-text(\"Apex Legends\")").count();
       await expect(contentCount).toBeGreaterThan(0);
    });
});