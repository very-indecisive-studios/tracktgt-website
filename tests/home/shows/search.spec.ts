import { test, expect } from '@playwright/test';

test.describe("Books > Search", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });
    
    test("Title should search related books with title", async ({ page }) => {
       await page.goto("/home/books/search?title=atomic+habits", { waitUntil: "networkidle" });
       
       const contentCount = await page.locator("h3:has-text(\"Atomic Habits\")").count();
       await expect(contentCount).toBeGreaterThan(0);
    });
});