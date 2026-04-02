import { expect, test } from '@playwright/test'
import { seedSession } from './helpers'

test('admin can inspect catalog and user management panels with mocked API', async ({ page }) => {
  await seedSession(page, {
    _id: 'admin-user-1',
    name: 'Admin Demo',
    email: 'admin@example.com',
    role: 'admin',
  })

  const json = (body) => ({ contentType: 'application/json', body: JSON.stringify(body) })

  await page.route('**/api/hospitals', async (route) => route.fulfill(json([{ _id: 'h1', name: 'BV Trung Tâm', address: { city: 'Huế' } }])))
  await page.route('**/api/departments', async (route) => route.fulfill(json([{ _id: 'd1', name: 'Khoa Nội', hospital: { _id: 'h1', name: 'BV Trung Tâm' } }])))
  await page.route('**/api/specialties', async (route) => route.fulfill(json([{ _id: 'sp1', name: 'Tim mạch' }])))
  await page.route('**/api/medicines', async (route) => route.fulfill(json([{ _id: 'm1', name: 'Paracetamol', unit: 'viên', price: 1000, stock: 20 }])))
  await page.route('**/api/insurances', async (route) => route.fulfill(json([{ _id: 'i1', provider: 'BHYT', policyNumber: 'BH001', coveragePercent: 80, patient: { _id: 'p1', user: { name: 'Nguyễn Văn A' } } }])))
  await page.route('**/api/patients', async (route) => route.fulfill(json([{ _id: 'p1', user: { name: 'Nguyễn Văn A' } }])))
  await page.route('**/api/users**', async (route) => route.fulfill(json([{ _id: 'u1', name: 'Admin Demo', email: 'admin@example.com', role: 'admin', phone: '0123' }])))
  await page.route('**/api/staff', async (route) => route.fulfill(json([{ _id: 's1', user: { _id: 'u2', name: 'Staff Demo', email: 'staff@example.com' }, title: 'Điều phối', role: 'staff', status: 'active', hospital: { _id: 'h1', name: 'BV Trung Tâm' }, department: { _id: 'd1', name: 'Khoa Nội' } }])))
  await page.route('**/api/roles', async (route) => route.fulfill(json([{ _id: 'r1', name: 'auditor', permissions: ['users.read'] }])))

  await page.goto('/quan-tri')

  await expect(page.getByRole('heading', { name: 'Khu vực quản trị' })).toBeVisible()
  await expect(page.getByText('BV Trung Tâm')).toBeVisible()

  await page.getByRole('button', { name: 'Nhân sự' }).click()
  await expect(page.getByRole('cell', { name: 'Điều phối' })).toBeVisible()

  await page.getByRole('button', { name: 'Roles' }).click()
  await expect(page.getByText('auditor')).toBeVisible()
})