import { test, expect } from '@playwright/test';

test.describe("Games > Search", () => {
    // Auth before each test.
    test.use({ storageState: 'storageState.json' });
    
    test("Title should search related games with title", async ({ page }) => {
       await page.goto("/home/games/search?title=apex+legends", { waitUntil: "networkidle" });
       
       const contentCount = await page.locator("h3:has-text(\"Apex Legends\")").count();
       await expect(contentCount).toBeGreaterThan(0);
    });
});