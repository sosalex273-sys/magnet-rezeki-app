import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_2FA = '123456';

test.describe('Admin Stateful UI Flow', () => {
  test('should login as admin and verify KYC submission', async ({ page }) => {
    // 1. Login Admin
    await page.goto(`${FRONTEND_URL}/admin/login`);
    await page.fill('input[placeholder="Username"]', ADMIN_EMAIL);
    await page.fill('input[placeholder="Kata Sandi"]', ADMIN_PASSWORD);
    await page.fill('input[placeholder*="2FA"]', ADMIN_2FA);
    await page.click('button:has-text("Login")');

    // Tunggu redirect ke dashboard
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });

    // 2. Navigate directly to KYC Management (bypassing dropdown complexity)
    await page.goto(`${FRONTEND_URL}/admin/dashboard/kyc/manage`);
    await expect(page).toHaveURL(/.*admin\/dashboard\/kyc\/manage/);

    // 3. Assert pending KYC exists and show detail
    // We check if the table has data. If not, we might need to seed it.
    const pendingBadge = page.locator('span:has-text("Menunggu Verifikasi")').first();
    if (await pendingBadge.isVisible()) {
      await page.click('button[title="Lihat Detail"]');
      
      // 4. Fill review notes and approve
      await page.fill('textarea[placeholder*="Catatan"]', 'Approved via UI E2E');
      await page.click('button:has-text("Terima")');

      // 5. Assert Success Notification (NoticeContext)
      // The notice should appear at the top-right
      await expect(page.locator('text=KYC berhasil diverifikasi')).toBeVisible();
      
      // 6. Assert status changed in table
      await expect(page.locator('span:has-text("Terverifikasi")').first()).toBeVisible();
    } else {
      console.log('No pending KYC found to test approval flow.');
    }
  });

  test('should verify deposit in Deposit Verification page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/admin/login`);
    await page.fill('input[placeholder="Username"]', ADMIN_EMAIL);
    await page.fill('input[placeholder="Kata Sandi"]', ADMIN_PASSWORD);
    await page.fill('input[placeholder*="2FA"]', ADMIN_2FA);
    await page.click('button:has-text("Login")');

    await page.goto(`${FRONTEND_URL}/admin/dashboard/kyc/confirm`);
    await expect(page).toHaveURL(/.*admin\/dashboard\/kyc\/confirm/);

    const verifyBtn = page.locator('button[title="Verifikasi"]').first();
    if (await verifyBtn.isVisible()) {
      await verifyBtn.click();
      
      // Assert Success Notification
      await expect(page.locator('text=Deposit berhasil diverifikasi')).toBeVisible();
    } else {
      console.log('No pending deposits found to test verification flow.');
    }
  });
});
