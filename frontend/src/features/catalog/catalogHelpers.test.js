import { describe, expect, it } from 'vitest'
import {
  buildCatalogPayload,
  canDeleteCatalogItem,
  canManageCatalog,
  getCatalogDatasetKey,
  getEmptyFormState,
  getFieldOptions,
  getFormStateFromItem,
} from './catalogHelpers'

describe('catalogHelpers', () => {
  it('applies role permissions by catalog', () => {
    expect(canManageCatalog('admin', 'hospital')).toBe(true)
    expect(canManageCatalog('staff', 'hospital')).toBe(false)
    expect(canManageCatalog('staff', 'medicine')).toBe(true)
    expect(canManageCatalog('admin', 'medicine')).toBe(false)
    expect(canDeleteCatalogItem('staff', 'medicine')).toBe(false)
    expect(canDeleteCatalogItem('admin', 'insurance')).toBe(true)
  })

  it('builds empty form state from config', () => {
    expect(getEmptyFormState('specialty')).toEqual({ name: '', description: '' })
  })

  it('maps nested hospital payload and drops empty values', () => {
    const payload = buildCatalogPayload('hospital', {
      name: 'BV A',
      description: '',
      phone: '0123',
      email: '',
      website: '',
      'address.street': '1 Lê Lợi',
      'address.city': 'Huế',
      'address.state': '',
      'address.zip': '',
      'address.country': 'Việt Nam',
    })

    expect(payload).toEqual({
      name: 'BV A',
      phone: '0123',
      address: {
        street: '1 Lê Lợi',
        city: 'Huế',
        country: 'Việt Nam',
      },
    })
  })

  it('maps populated item back to form state', () => {
    expect(
      getFormStateFromItem('department', {
        name: 'Khoa Nội',
        hospital: { _id: 'h1', name: 'BV A' },
        description: 'Khám nội tổng quát',
      }),
    ).toEqual({
      name: 'Khoa Nội',
      hospital: 'h1',
      description: 'Khám nội tổng quát',
    })
  })

  it('returns select options from datasets', () => {
    expect(
      getFieldOptions(
        { optionsKey: 'patients' },
        { patients: [{ _id: 'p1', user: { name: 'Nguyễn Văn A' } }] },
      ),
    ).toEqual([{ value: 'p1', label: 'Nguyễn Văn A' }])
  })

  it('returns plural dataset key', () => {
    expect(getCatalogDatasetKey('hospital')).toBe('hospitals')
  })
})
