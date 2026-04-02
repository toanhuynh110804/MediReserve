import { describe, expect, it } from 'vitest'
import { buildNavItems } from './navItems'

describe('buildNavItems', () => {
  it('returns login/register items for guests', () => {
    const items = buildNavItems(false)
    expect(items.map((item) => item.to)).toEqual(['/', '/login', '/register'])
  })

  it('shows only admin-relevant items for admin users', () => {
    const items = buildNavItems(true, 'admin')
    expect(items.map((item) => item.to)).toEqual(['/', '/quan-tri', '/quan-ly-tep'])
  })

  it('shows patient workspace and billing for patient users', () => {
    const items = buildNavItems(true, 'patient')
    expect(items.map((item) => item.to)).toEqual(['/', '/benh-nhan', '/thanh-toan'])
  })

  it('shows only doctor workspace and attachments for doctor users', () => {
    const items = buildNavItems(true, 'doctor')
    expect(items.map((item) => item.to)).toEqual(['/', '/bac-si', '/quan-ly-tep'])
  })

  it('shows only staff workspace and attachments for staff users', () => {
    const items = buildNavItems(true, 'staff')
    expect(items.map((item) => item.to)).toEqual(['/', '/nhan-vien', '/quan-ly-tep'])
  })
})
