import { expect, test } from '@playwright/test'
import { seedSession } from './helpers'

test('patient can load schedules and book an appointment with mocked backend', async ({ page }) => {
  const patientUser = {
    _id: 'patient-user-1',
    name: 'Patient Demo',
    email: 'patient@example.com',
    role: 'patient',
  }

  let schedules = [
    {
      _id: 'schedule-1',
      doctor: { _id: 'doctor-1' },
      room: { _id: 'room-1' },
      date: '2026-04-10T00:00:00.000Z',
      slot: 'morning',
      status: 'open',
      capacity: 5,
      bookedCount: 1,
    },
  ]

  let appointments = []

  await seedSession(page, patientUser)

  await page.route('**/api/doctors', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{ _id: 'doctor-1', user: { name: 'Bác sĩ Demo' } }]),
    })
  })

  await page.route('**/api/schedules**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(schedules),
    })
  })

  await page.route('**/api/appointments', async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(appointments),
      })
      return
    }

    const payload = route.request().postDataJSON()
    appointments = [
      {
        _id: 'appointment-1',
        doctor: { _id: 'doctor-1' },
        date: payload.date,
        time: payload.time,
        status: 'pending',
      },
    ]
    schedules = [{ ...schedules[0], bookedCount: 2 }]

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(appointments[0]),
    })
  })

  await page.goto('/benh-nhan')

  await expect(page.getByRole('heading', { name: 'Khu vực bệnh nhân' })).toBeVisible()
  await expect(page.locator('#schedule-select')).toContainText('Bác sĩ Demo')

  await page.getByLabel('Ghi chú cho lịch hẹn').fill('Đau đầu kéo dài')
  await page.getByRole('button', { name: 'Đặt lịch ngay' }).click()

  await expect(page.getByText('Đã đồng bộ lại dữ liệu mới nhất từ máy chủ.')).toBeVisible()
  await expect(page.getByText('appointment-1')).toBeVisible()
})
