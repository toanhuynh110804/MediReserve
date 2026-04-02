import { describe, expect, it } from 'vitest'
import { buildNavItems } from './navItems'

describe('buildNavItems', () => {
  it('returns login/register items for guests', () => {
    const items = buildNavItems(false)
    expect(items.map((item) => item.to)).toEqual(['/', '/login', '/register'])
  })

  it('adds role home, file manager and admin link for admin users', () => {
    const items = buildNavItems(true, 'admin')
    expect(items.map((item) => item.to)).toEqual(['/', '/app', '/quan-ly-tep', '/quan-tri'])
  })

  it('adds role home and file manager for patient users', () => {
    const items = buildNavItems(true, 'patient')
    expect(items.map((item) => item.to)).toEqual(['/', '/app', '/quan-ly-tep', '/benh-nhan'])
  })
})
