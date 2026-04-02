import { describe, expect, it, vi } from 'vitest'
import {
  createRoleApi,
  createStaffApi,
  deleteRoleApi,
  deleteStaffApi,
  getRolesApi,
  getStaffsApi,
  getUsersApi,
  updateRoleApi,
  updateStaffApi,
} from './userManagementApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('userManagementApi', () => {
  it('gets users with filters', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: 'u1' }] })

    const result = await getUsersApi({ role: 'staff' })

    expect(httpClient.get).toHaveBeenCalledWith('/api/users', expect.any(Object))
    expect(result).toEqual([{ _id: 'u1' }])
  })

  it('gets staffs', async () => {
    httpClient.get.mockResolvedValue({ data: [{ _id: 's1' }] })

    const result = await getStaffsApi()

    expect(httpClient.get).toHaveBeenCalledWith('/api/staff')
    expect(result).toEqual([{ _id: 's1' }])
  })

  it('creates, updates, and deletes staff', async () => {
    const payload = { title: 'Điều phối viên' }
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })

    await createStaffApi(payload)
    await updateStaffApi('s1', payload)
    await deleteStaffApi('s1')

    expect(httpClient.post).toHaveBeenCalledWith('/api/staff', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/staff/s1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/staff/s1')
  })

  it('gets, creates, updates, and deletes roles', async () => {
    const payload = { name: 'scheduler', permissions: ['appointments.read'] }
    httpClient.get.mockResolvedValue({ data: [payload] })
    httpClient.post.mockResolvedValue({ data: payload })
    httpClient.put.mockResolvedValue({ data: payload })
    httpClient.delete.mockResolvedValue({ data: { message: 'ok' } })

    await getRolesApi()
    await createRoleApi(payload)
    await updateRoleApi('r1', payload)
    await deleteRoleApi('r1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/roles')
    expect(httpClient.post).toHaveBeenCalledWith('/api/roles', payload)
    expect(httpClient.put).toHaveBeenCalledWith('/api/roles/r1', payload)
    expect(httpClient.delete).toHaveBeenCalledWith('/api/roles/r1')
  })
})
