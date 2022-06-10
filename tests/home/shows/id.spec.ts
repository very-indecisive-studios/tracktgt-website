import { test, expect } from '@playwright/test';

test.describe("Shows > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        // Click button:has-text("Create tracking") >> nth=1
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        // Click button:has-text("Add")
        await page.locator('button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeTruthy();
    });

    test("Edit show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('input[name="episodesWatched"]').click();
        await page.locator('input[name="episodesWatched"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        
        await expect(await page.locator('input[name="episodesWatched"]').inputValue()).toBe("10");
    });

    test("Delete show", async ({ page }) => {
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/shows/s_120089');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});