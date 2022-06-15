import { test, expect } from '@playwright/test';

test.describe("Shows > Index", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Completed show in completed shows table", async ({ page }) => {
        /* Adding show */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });
        
        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        
        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Completed").click();
        
        // Add the show
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check show in table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Completed")').click();
        
        // Check if table has the show added earlier
        await page.locator("text=SPY x FAMILY").waitFor();
        await expect(await page.locator("text=SPY x FAMILY").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        
        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Watching show in watching shows table", async ({ page }) => {
        /* Adding show */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Watching").click();

        // Add the show
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check show in table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Watching")').click();

        // Check if table has the show added earlier
        await page.locator("text=SPY x FAMILY").waitFor();
        await expect(await page.locator("text=SPY x FAMILY").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Paused show in paused shows table", async ({ page }) => {
        /* Adding show */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Paused").click();

        // Add the show
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check show in table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Paused")').click();

        // Check if table has the show added earlier
        await page.locator("text=SPY x FAMILY").waitFor();
        await expect(await page.locator("text=SPY x FAMILY").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Planning show in planning shows table", async ({ page }) => {
        /* Adding show */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the show
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check show in table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Check if table has the show added earlier
        await page.locator("text=SPY x FAMILY").waitFor();
        await expect(await page.locator("text=SPY x FAMILY").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Edit show from table", async ({ page }) => {
        /* Adding show */
        await page.goto('/home/shows/s_120089', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status to completed
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the show
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/shows/s_120089');

        /* Edit show from table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();
        
        // Edit show from table
        await page.locator("text=SPY x FAMILY").waitFor();

        // Select edit button to open editor modal
        await page.locator('td button').click();
        await page.locator('input[name="episodesWatched"]').fill("10");
        await page.locator('button:has-text("Save")').click()

        // Check show has edit
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await expect(await page.locator('input[name="episodesWatched"]').inputValue()).toBe("10");
    });

    test("Delete show from table", async ({ page }) => {
        /* Edit show from table */
        await page.goto('/home/shows', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Delete show from table
        await page.locator("text=SPY x FAMILY").waitFor();
        
        // Select edit button to open editor modal
        await page.locator('td button').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click()

        // Check show has no tracking
        await page.goto("/home/shows/s_120089", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeFalsy();
    });
});