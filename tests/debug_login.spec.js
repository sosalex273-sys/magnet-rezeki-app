import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test('debug login failure', async ({ page }) => {
  await page.goto(`${FRONTEND_URL}/admin/login`);
  await page.fill('input[placeholder="Username"]', 'admin');
  await page.fill('input[placeholder="Kata Sandi"]', 'admin123');
  await page.fill('input[placeholder*="2FA"]', '123456');
  await page.click('button:has-text("Login")');
  
  await page.waitForTimeout(5000);
  const errorText = await page.locator('.bg-red-500\\/30').innerText().catch(() => 'No error text');
  console.log('ERROR ON PAGE:', errorText);
  
  const currentURL = page.url();
  console.log('CURRENT URL:', currentURL);
});
