import { test, expect } from '@playwright/test';

test.describe("Games > ID", () => {
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

    test("Add game", async ({ page }) => {
        // Go to /home/games/114795
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        // Click button:has-text("Create tracking") >> nth=1
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        // Click button:has-text("Add")
        await page.locator('button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/games/114795');
        
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(page.locator('button:has-text("Edit tracking") >> nth=1')).toBeVisible();
    });

    test("Edit game", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await page.locator('input[name="hoursPlayed"]').click();
        await page.locator('input[name="hoursPlayed"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        
        await expect(await page.locator('input[name="hoursPlayed"]').inputValue()).toBe("10");
    });

    test("Delete game", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});