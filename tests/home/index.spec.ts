import { test, expect } from '@playwright/test';

test.describe("Home > Index", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });
    
    test('Dashboard is shown', async ({ page }) => {
        await page.goto("/home", { waitUntil: "networkidle" });

        await expect(page.locator("h1:has-text(\"Dashboard\")")).toBeVisible();
    });

    test('No recent games are shown', async ({ page }) => {
        await page.goto("/home", { waitUntil: "networkidle" });

        await expect(page.locator("text=You have not tracked any games yet")).toBeVisible();
    });

    test('Recent games are shown', async ({ page }) => {
        /* Add game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        await expect(page).toHaveURL('/home/games/114795');
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/games/114795');
        
        /* Check dashboard */
        
        // Click div:has-text("Dashboard") >> nth=3
        await page.goto("/home", { waitUntil: "networkidle" });
        await expect(page).toHaveURL('/home');
        await expect(page.locator("text=Apex Legends")).toBeVisible();

        /* Clean up */
        
        // Go to /home/games/114795
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        // Click div:has-text("Dashboard") >> nth=3
        await page.locator('div:has-text("Dashboard")').nth(3).click();
        await expect(page).toHaveURL('/home');
        // Click text=Apex LegendsPC >> img
        await page.locator('text=Apex LegendsPC >> img').click();
        await expect(page).toHaveURL('/home/games/114795');
        // Click button:has-text("Edit tracking") >> nth=1
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        // Click h5:has-text("PC")
        await page.locator('h5:has-text("PC")').click();
        // Click button:has-text("Remove")
        await page.locator('button:has-text("Remove")').click();
        // Click button:has-text("Yes, I am sure")
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/games/114795');
    });

    test('No recent books are shown', async ({ page }) => {
        await page.goto("/home", { waitUntil: "networkidle" });

        await expect(page.locator("text=You have not tracked any books yet")).toBeVisible();
    });

    test('Recent books are shown', async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        /* Check dashboard */

        // Click div:has-text("Dashboard") >> nth=3
        await page.goto("/home", { waitUntil: "networkidle" });
        await expect(page).toHaveURL('/home');
        await expect(page.locator("text=Atomic Habits")).toBeVisible();

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');
        // Click button:has-text("Edit tracking") >> nth=1
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        // Click button:has-text("Remove")
        await page.locator('button:has-text("Remove")').click();
        // Click button:has-text("Yes, I am sure")
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');
    });
});

