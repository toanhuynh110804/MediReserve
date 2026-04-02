import { expect, test } from '@playwright/test'

test('login redirects patient to their workspace', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'token-123',
        user: {
          _id: 'patient-user-1',
          name: 'Patient Demo',
          email: 'patient@example.com',
          role: 'patient',
        },
      }),
    })
  })

  await page.goto('/login')
  await page.getByLabel('Email').fill('patient@example.com')
  await page.getByLabel('Mật khẩu').fill('123456')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  await expect(page).toHaveURL(/\/benh-nhan$/)
  await expect(page.getByRole('heading', { name: 'Khu vực bệnh nhân' })).toBeVisible()
})
