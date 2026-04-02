import { describe, expect, it } from 'vitest'
import {
  buildRolePayload,
  buildStaffPayload,
  formatPermissions,
  getInitialRoleForm,
  getInitialStaffForm,
  parsePermissions,
} from './userManagementHelpers'

describe('userManagementHelpers', () => {
  it('parses and formats permissions', () => {
    expect(parsePermissions('users.read\nroles.write,staff.delete')).toEqual([
      'users.read',
      'roles.write',
      'staff.delete',
    ])
    expect(formatPermissions(['users.read', 'roles.write'])).toBe('users.read\nroles.write')
  })

  it('builds role payload', () => {
    expect(buildRolePayload({ name: 'manager ', permissions: 'users.read\nusers.write' })).toEqual({
      name: 'manager',
      permissions: ['users.read', 'users.write'],
    })
  })

  it('builds staff payload', () => {
    expect(
      buildStaffPayload({
        user: 'u1',
        hospital: 'h1',
        department: '',
        title: 'Điều phối ',
        role: 'manager',
        status: 'active',
      }),
    ).toEqual({
      user: 'u1',
      hospital: 'h1',
      department: undefined,
      title: 'Điều phối',
      role: 'manager',
      status: 'active',
    })
  })

  it('creates initial forms from existing data', () => {
    expect(
      getInitialStaffForm({
        user: { _id: 'u1' },
        hospital: { _id: 'h1' },
        department: { _id: 'd1' },
        title: 'Điều dưỡng',
        role: 'staff',
        status: 'inactive',
      }),
    ).toEqual({
      user: 'u1',
      hospital: 'h1',
      department: 'd1',
      title: 'Điều dưỡng',
      role: 'staff',
      status: 'inactive',
    })

    expect(getInitialRoleForm({ name: 'auditor', permissions: ['users.read'] })).toEqual({
      name: 'auditor',
      permissions: 'users.read',
    })
  })
})
