import dotenv from 'dotenv';
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    dotenv.config({ path: "./.test.env" });
    
    const email = process.env.TEST_ACCOUNT_EMAIL;
    if (!email) {
        throw new Error("TEST_ACCOUNT_EMAIL must be set");
    }
    const pass = process.env.TEST_ACCOUNT_PASS;
    if (!pass) {
        throw new Error("TEST_ACCOUNT_PASS must be set");
    }
    
    const { baseURL } = config.projects[0].use;
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Go to /account/login
    await page.goto(`${baseURL}/account/login`);

    // Click input[name="email"]
    await page.locator('input[name="email"]').click();
    
    // Fill input[name="email"]
    await page.locator('input[name="email"]').fill(email);

    // Click input[name="password"]
    await page.locator('input[name="password"]').click();

    // Fill input[name="password"]
    await page.locator('input[name="password"]').fill(pass);

    // Click div[role="checkbox"]
    await page.frameLocator('text=Email addressPasswordForget password?Login >> iframe').locator('div[role="checkbox"]').click();
    await page.waitForTimeout(2000);

    // Click button:has-text("Login")
    await Promise.all([
        page.waitForNavigation(),
        page.locator('button:has-text("Login")').click()
    ]);

    await page.waitForURL(`${baseURL}/home`);
    
    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default globalSetup;
