import { test, expect } from '@playwright/test';

test.describe("Games > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Completed game in completed games table", async ({ page }) => {
        /* Adding completed game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });
        
        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        
        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Completed").click();
        
        // Add the game
        await page.locator('button:has-text("Add")').click();
        
        // Wait for the page to update
        await page.waitForURL('/home/games/114795');
        
        /* Check game in table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Completed")').click();
        
        // Check URL changes
        await expect(page).toHaveURL("/home/games?status=Completed&page=1");
        
        // Check if table has the game added earlier
        await page.locator("text=Apex Legends").waitFor();
        await expect(await page.locator("text=Apex Legends").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        
        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        
        // Wait for the page to update
        await page.waitForURL('/home/games/114795');
    });

    test("Playing game in playing games table", async ({ page }) => {
        /* Adding completed game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Playing").click();

        // Add the game
        await page.locator('button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');

        /* Check game in table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Playing")').click();
        
        // Check URL changes
        await expect(page).toHaveURL("/home/games?status=Playing&page=1");

        // Check if table has the game added earlier
        await page.locator("text=Apex Legends").waitFor();
        await expect(await page.locator("text=Apex Legends").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');
    });

    test("Paused game in paused games table", async ({ page }) => {
        /* Adding completed game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Paused").click();

        // Add the game
        await page.locator('button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');

        /* Check game in table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Paused")').click();

        // Check URL changes
        await expect(page).toHaveURL("/home/games?status=Paused&page=1");

        // Check if table has the game added earlier
        await page.locator("text=Apex Legends").waitFor();
        await expect(await page.locator("text=Apex Legends").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');
    });

    test("Planning game in planning games table", async ({ page }) => {
        /* Adding completed game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the game
        await page.locator('button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');

        /* Check game in table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Check URL changes
        await expect(page).toHaveURL("/home/games?status=Planning&page=1");

        // Check if table has the game added earlier
        await page.locator("text=Apex Legends").waitFor();
        await expect(await page.locator("text=Apex Legends").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');
    });

    test("Edit game from table", async ({ page }) => {
        /* Adding completed game */
        await page.goto('/home/games/114795', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status to completed
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the game
        await page.locator('button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/games/114795');

        /* Edit game from table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();
        
        // Edit game from table
        await page.locator("text=Apex Legends").waitFor();

        // Select eye button to open editor modal
        await page.locator('td button').click();
        await page.locator('input[name="hoursPlayed"]').fill("10");
        await page.locator('button:has-text("Save")').click()

        // Check game has edit
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('h5:has-text("PC")').click();
        await expect(await page.locator('input[name="hoursPlayed"]').inputValue()).toBe("10");
    });

    test("Delete game from table", async ({ page }) => {
        /* Edit game from table */
        await page.goto('/home/games', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Delete game from table
        await page.locator("text=Apex Legends").waitFor();
        
        // Select eye button to open editor modal
        await page.locator('td button').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click()

        // Check game has no tracking
        await page.goto("/home/games/114795", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});