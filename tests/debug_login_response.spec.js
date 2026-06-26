import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test('debug login response', async ({ page }) => {
  page.on('response', async response => {
    if (response.url().includes('login')) {
      console.log('LOGIN URL:', response.url());
      console.log('LOGIN STATUS:', response.status());
      try {
        const body = await response.json();
        console.log('LOGIN BODY:', body);
      } catch (e) {
        console.log('LOGIN BODY (raw):', await response.text());
      }
    }
  });

  await page.goto(`${FRONTEND_URL}/admin/login`);
  await page.fill('input[placeholder="Username"]', 'admin');
  await page.fill('input[placeholder="Kata Sandi"]', 'admin123');
  await page.fill('input[placeholder*="2FA"]', '123456');
  await page.click('button:has-text("Login")');
  
  await page.waitForTimeout(5000);
});
