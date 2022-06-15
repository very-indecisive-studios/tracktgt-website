import { test, expect } from '@playwright/test';

test.describe("Books > ID", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });

    test("Add book tracking", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add tracking")').nth(1).click();
        await page.locator('div[role="dialog"] button:has-text("Add")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeTruthy();
    });

    test("Edit book tracking", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('input[name="chaptersRead"]').click();
        await page.locator('input[name="chaptersRead"]').fill("10");
        await page.locator('button:has-text("Save")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        
        await expect(await page.locator('input[name="chaptersRead"]').inputValue()).toBe("10");
    });

    test("Remove book tracking", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Manage tracking")').nth(1).click();
        await page.locator('button:has-text("Remove")').click();
        await page.locator('button:has-text("Yes, I am sure")').click();
        await expect(page).toHaveURL('/home/books/XfFvDwAAQBAJ');

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Manage tracking")').count()).toBeFalsy();
    });

    test("Add book wishlist", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Add to wishlist")').nth(1).click();

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Remove from wishlist")').count()).toBeTruthy();
    });

    test("Remove book wishlist", async ({ page }) => {
        await page.goto('/home/books/XfFvDwAAQBAJ', { waitUntil: "networkidle" });
        await page.locator('button:has-text("Remove from wishlist")').nth(1).click();
        await page.locator('button:has-text("Yes, I am sure")').click();

        await page.goto("/home", { waitUntil: "networkidle" });
        await page.goto("/home/books/XfFvDwAAQBAJ", { waitUntil: "networkidle" });
        await expect(await page.locator('button:has-text("Remove from wishlist")').count()).toBeFalsy();
    });
});