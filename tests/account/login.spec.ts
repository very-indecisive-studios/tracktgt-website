import { test, expect } from '@playwright/test';

test.describe("Login", () => {
    test('Logged in should redirect to app', async ({ page }) => {
        const email = process.env.TEST_ACCOUNT_EMAIL;
        if (!email) {
            throw new Error("TEST_ACCOUNT_EMAIL must be set");
        }
        const pass = process.env.TEST_ACCOUNT_PASS;
        if (!pass) {
            throw new Error("TEST_ACCOUNT_PASS must be set");
        }

        // Go to /account/login
        await page.goto('/account/login');

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

        await page.waitForURL("/home");
        await page.goto("/account/login", { waitUntil: "networkidle" });
        await expect(page).toHaveURL("/home");
    });

    test('Login success', async ({ page }) => {
        const email = process.env.TEST_ACCOUNT_EMAIL;
        if (!email) {
            throw new Error("TEST_ACCOUNT_EMAIL must be set");
        }
        const pass = process.env.TEST_ACCOUNT_PASS;
        if (!pass) {
            throw new Error("TEST_ACCOUNT_PASS must be set");
        }
        
        // Go to /account/login
        await page.goto('/account/login');

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

        await page.waitForURL("/home");
        await expect(page).toHaveURL("/home");
    });

    test('Login fail invalid password', async ({ page }) => {
        const email = process.env.TEST_ACCOUNT_EMAIL;
        if (!email) {
            throw new Error("TEST_ACCOUNT_EMAIL must be set");
        }
        const pass = process.env.TEST_ACCOUNT_PASS;
        if (!pass) {
            throw new Error("TEST_ACCOUNT_PASS must be set");
        }

        // Go to /account/login
        await page.goto('/account/login');

        // Click input[name="email"]
        await page.locator('input[name="email"]').click();

        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill(email);

        // Click input[name="password"]
        await page.locator('input[name="password"]').click();

        // Fill input[name="password"]
        await page.locator('input[name="password"]').fill('InvalidPassword');

        // Click div[role="checkbox"]
        await page.frameLocator('text=Email addressPasswordForget password?Login >> iframe').locator('div[role="checkbox"]').click();
        await page.waitForTimeout(2000);

        // Click button:has-text("Login")
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button:has-text("Login")').click()
        ]);

        await expect(page).toHaveURL('/account/login');

        await expect(page.locator('text=Email or password is incorrect')).toBeVisible();
    });

    test('Login fail invalid email', async ({ page }) => {
        const email = process.env.TEST_ACCOUNT_EMAIL;
        if (!email) {
            throw new Error("TEST_ACCOUNT_EMAIL must be set");
        }
        const pass = process.env.TEST_ACCOUNT_PASS;
        if (!pass) {
            throw new Error("TEST_ACCOUNT_PASS must be set");
        }
        
        // Go to /account/login
        await page.goto('/account/login');

        // Click input[name="email"]
        await page.locator('input[name="email"]').click();

        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill('veryindecisivestudios+invalid@gmail.com');

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

        await expect(page).toHaveURL('/account/login');

        await expect(page.locator('text=Email or password is incorrect')).toBeVisible();
    });

    test('Login fail no captcha', async ({ page }) => {
        const email = process.env.TEST_ACCOUNT_EMAIL;
        if (!email) {
            throw new Error("TEST_ACCOUNT_EMAIL must be set");
        }
        const pass = process.env.TEST_ACCOUNT_PASS;
        if (!pass) {
            throw new Error("TEST_ACCOUNT_PASS must be set");
        }
        
        // Go to /account/login
        await page.goto('/account/login');

        // Click input[name="email"]
        await page.locator('input[name="email"]').click();

        // Fill input[name="email"]
        await page.locator('input[name="email"]').fill(email);

        // Click input[name="password"]
        await page.locator('input[name="password"]').click();

        // Fill input[name="password"]
        await page.locator('input[name="password"]').fill(pass);

        // Click button:has-text("Login")
        await Promise.all([
            page.waitForNavigation(),
            page.locator('button:has-text("Login")').click()
        ]);

        await expect(page).toHaveURL('/account/login');

        await expect(page.locator('text=Please complete human verification.')).toBeVisible();
    });
});

