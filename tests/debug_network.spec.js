import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

test('debug login network', async ({ page }) => {
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  await page.goto(`${FRONTEND_URL}/admin/login`);
  await page.fill('input[placeholder="Username"]', 'admin');
  await page.fill('input[placeholder="Kata Sandi"]', 'admin123');
  await page.fill('input[placeholder*="2FA"]', '123456');
  await page.click('button:has-text("Login")');
  
  await page.waitForTimeout(5000);
});
