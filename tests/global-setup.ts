import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    const { baseURL } = config.projects[0].use;
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Go to /account/login
    await page.goto(`${baseURL}/account/login`);

    // Click input[name="email"]
    await page.locator('input[name="email"]').click();

    // Fill input[name="email"]
    await page.locator('input[name="email"]').fill('veryindecisivestudios+test@gmail.com');

    // Click input[name="password"]
    await page.locator('input[name="password"]').click();

    // Fill input[name="password"]
    await page.locator('input[name="password"]').fill('testme99');

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
