import { test, expect } from '@playwright/test';

test.describe("Games > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add game", async ({ page }) => {
        // Go to /home/games/114795
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        // Click button:has-text("Create tracking") >> nth=1
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        // Click button:has-text("Add")
        await page.locator('button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeTruthy();
    });

    test("Edit game", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await page.locator('input[name="hoursPlayed"]').click();
        await page.locator('input[name="hoursPlayed"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
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

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});