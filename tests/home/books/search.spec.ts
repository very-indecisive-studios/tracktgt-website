import { test, expect } from '@playwright/test';

test.describe("Shows > Search", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });
    
    test("Title should search related shows with title", async ({ page }) => {
       await page.goto("/home/books/search?title=spy+family", { waitUntil: "networkidle" });
       
       const contentCount = await page.locator("h3:has-text(\"SPY x FAMILY\")").count();
       await expect(contentCount).toBeGreaterThan(0);
    });
});