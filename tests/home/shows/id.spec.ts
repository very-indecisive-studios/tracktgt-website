import { test, expect } from '@playwright/test';

test.describe("Shows > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeTruthy();
    });

    test("Edit show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('input[name="episodesWatched"]').click();
        await page.locator('input[name="episodesWatched"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        
        await expect(await page.locator('input[name="episodesWatched"]').inputValue()).toBe("10");
    });

    test("Delete show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeFalsy();
    });
});