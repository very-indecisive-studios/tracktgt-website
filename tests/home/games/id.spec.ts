import { test, expect } from '@playwright/test';

test.describe("Games > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add game tracking", async ({ page }) => {
        // Go to /home/games/114795
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeTruthy();
    });

    test("Edit game tracking", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await page.locator('input[name="hoursPlayed"]').click();
        await page.locator('input[name="hoursPlayed"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        
        await expect(await page.locator('input[name="hoursPlayed"]').inputValue()).toBe("10");
    });

    test("Remove game tracking", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeFalsy();
    });

    test("Add game wishlist", async ({ page }) => {
        // Go to /home/games/114795
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add to wishlist")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage wishlist")').count()).toBeTruthy();
    });
    
    test("Remove game wishlist", async ({ page }) => {
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage wishlist")').nth(1).click();
        await page.locator('text=PCorAdd another platform to wishlist >> button').first().click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/games/114795');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage wishlist")').count()).toBeFalsy();
    });
});