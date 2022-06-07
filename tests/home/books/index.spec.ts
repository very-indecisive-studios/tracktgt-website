import { test, expect } from '@playwright/test';

test.describe("Books > Index", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Completed book in completed books table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        
        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        
        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Completed").click();
        
        // Add the book
        await page.locator('button:has-text("Add")').click();
        
        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Completed")').click();
        
        // Check URL changes
        const url = new URL(page.url());
        const status = url.searchParams.get("status");
        const pageNo = url.searchParams.get("page");
        await expect(status).toBe("Completed");
        await expect(pageNo).toBe("1");
        
        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        
        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Reading book in playing books table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Reading").click();

        // Add the book
        await page.locator('button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Reading")').click();

        // Check URL changes
        const url = new URL(page.url());
        const status = url.searchParams.get("status");
        const pageNo = url.searchParams.get("page");
        await expect(status).toBe("Reading");
        await expect(pageNo).toBe("1");

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Paused book in paused books table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Paused").click();

        // Add the book
        await page.locator('button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Paused")').click();

        // Check URL changes
        const url = new URL(page.url());
        const status = url.searchParams.get("status");
        const pageNo = url.searchParams.get("page");
        await expect(status).toBe("Paused");
        await expect(pageNo).toBe("1");

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Planning book in planning books table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the book
        await page.locator('button:has-text("Add")').click();

        /* Check book in table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Check URL changes
        const url = new URL(page.url());
        const status = url.searchParams.get("status");
        const pageNo = url.searchParams.get("page");
        await expect(status).toBe("Planning");
        await expect(pageNo).toBe("1");

        // Check if table has the book added earlier
        await page.locator("text=Atomic Habits").waitFor();
        await expect(await page.locator("text=Atomic Habits").count()).toBe(1);

        /* Clean up */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Edit tracking")').nth(1).click();

        // Remove the tracking
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
    });

    test("Edit book from table", async ({ page }) => {
        /* Adding book */
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });

        // Open track editor modal
        await page.locator('button:has-text("Create tracking")').nth(1).click();

        // Set the status to completed
        await page.locator("input[name='status'] + div input").click();
        await page.locator("text=Planning").click();

        // Add the book
        await page.locator('button:has-text("Add")').click();

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
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await expect(await page.locator('input[name="chaptersRead"]').inputValue()).toBe("10");
    });

    test("Delete book from table", async ({ page }) => {
        /* Edit book from table */
        await page.goto('/home/books', { waitUntil: "networkidle" });

        // Select the tab
        await page.locator('button[role="tab"]:has-text("Planning")').click();

        // Delete game from table
        await page.locator("text=Atomic Habits").waitFor();
        
        // Select eye button to open editor modal
        await page.locator('td button').click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click()

        // Check game has no tracking
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});