import { test, expect } from '@playwright/test';

test.describe("Books > Index", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Completed book in completed books tracking table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        
        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        
        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Completed").click();
        
        // Add the book
        await page.locator('div[role="dialog"] button:has-text("Add")').click();
        
        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Completed")').click();
        
        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        
        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Reading book in reading books tracking table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Reading").click();

        // Add the book
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Reading")').click();

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Paused book in paused books tracking table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Paused").click();

        // Add the book
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Paused")').click();

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Planning book in planning books tracking table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the book
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Manage tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Edit book from tracking table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Add tracking")').nth(1).click();

        // Set the status to completed
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the book
        await page.locator('div[role="dialog"] button:has-text("Add")').click();

        // Wait for the page to update
        await page.waitForURL('/home/books/XfFvDwAAQBAJ');

        /* Edit book from table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();
        
        // Edit book from table
        await page.locator("text=Atomic Habits").waitFor();

        // Select eye button to open editor modal
        await page.locator('td button').click();
        await page.locator('input[name="chaptersRead"]').fill("10");
        await page.locator('button:has-text("Save")').click()

        // Check book has edit
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await expect(await page.locator('input[name="chaptersRead"]').inputValue()).toBe("10");
    });

    test("Remove book from tracking table", async ({ page }) => {
        /* Edit book from table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Remove book from table
        await page.locator("text=Atomic Habits").waitFor();
        
        // Select eye button to open editor modal
        await page.locator('td button').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click()

        // Check book has no tracking
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeFalsy();
    });

    test("Remove book from wishlist table", async ({ page }) => {
        /* Add book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add to wishlist")').nth(1).click();
        
        /* Remove book from table */
        await page.goto('/home/books', { waitUntil: "networkidle" });
        
        // Go to wishlist table
        await page.locator('button[role="tab"]:has-text("Wishlist")').click();
        
        // Remove book from table
        await page.locator("text=Atomic Habits").waitFor();

        // Select trash button
        await page.locator('td button').click();
        await page.locator('button:has-text("Yes, I am sure")').click()

        // Check book has no wishlist
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Remove from wishlist")').count()).toBeFalsy();
    });
});
