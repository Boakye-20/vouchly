import { test, expect } from '@playwright/test';

test.describe('User Signup and Login', () => {
    test('should allow a user to sign up and log in', async ({ page }) => {
        await page.goto('http://localhost:3000/auth');
        await page.click('text=Sign Up');
        // Fill in signup form (replace with real selectors and test credentials)
        await page.fill('input[name="email"]', 'testuser+e2e@ac.uk');
        await page.fill('input[name="password"]', 'TestPassword123!');
        await page.click('button[type="submit"]');
        // Expect to see dashboard or verification prompt
        await expect(page).toHaveURL(/dashboard|verify/);
    });
}); 