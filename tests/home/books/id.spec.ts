import { test, expect } from '@playwright/test';

test.describe("Books > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add book", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        // Click button:has-text("Create tracking") >> nth=1
        await page.locator('button:has-text("Create tracking")').nth(1).click();
        // Click button:has-text("Add")
        await page.locator('button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeTruthy();
    });

    test("Edit book", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('input[name="chaptersRead"]').click();
        await page.locator('input[name="chaptersRead"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        
        await expect(await page.locator('input[name="chaptersRead"]').inputValue()).toBe("10");
    });

    test("Delete book", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Edit tracking")').nth(1).click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Edit tracking")').count()).toBeFalsy();
    });
});