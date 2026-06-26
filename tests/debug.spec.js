import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

test('debug page content', async ({ page }) => {
  await page.goto(`${FRONTEND_URL}/admin/login`);
  await page.waitForTimeout(5000);
  const content = await page.content();
  console.log('PAGE CONTENT:', content);
  const title = await page.title();
  console.log('PAGE TITLE:', title);
});
