import { describe, expect, it, vi } from 'vitest'
import { uploadFileApi, getFilesApi, getFileByIdApi, deleteFileApi } from './fileApi'
import { httpClient } from './httpClient'

vi.mock('./httpClient')

describe('fileApi', () => {
  it('uploadFileApi sends multipart file', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const mockResponse = {
      data: {
        _id: '123',
        filename: 'test.pdf',
        url: '/uploads/test.pdf',
        size: 100,
        mimeType: 'application/pdf',
      },
    }
    httpClient.post.mockResolvedValue(mockResponse)

    const result = await uploadFileApi(file)

    expect(httpClient.post).toHaveBeenCalledWith('/api/files', expect.any(FormData), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    expect(result).toEqual(mockResponse.data)
  })

  it('getFilesApi fetches user files', async () => {
    const mockResponse = {
      data: [
        { _id: '1', filename: 'doc1.pdf' },
        { _id: '2', filename: 'doc2.pdf' },
      ],
    }
    httpClient.get.mockResolvedValue(mockResponse)

    const result = await getFilesApi()

    expect(httpClient.get).toHaveBeenCalledWith('/api/files')
    expect(result).toEqual(mockResponse.data)
  })

  it('getFileByIdApi fetches single file', async () => {
    const mockResponse = { data: { _id: '1', filename: 'doc.pdf' } }
    httpClient.get.mockResolvedValue(mockResponse)

    const result = await getFileByIdApi('1')

    expect(httpClient.get).toHaveBeenCalledWith('/api/files/1')
    expect(result).toEqual(mockResponse.data)
  })

  it('deleteFileApi removes file', async () => {
    const mockResponse = { data: { message: 'Xóa file thành công' } }
    httpClient.delete.mockResolvedValue(mockResponse)

    const result = await deleteFileApi('1')

    expect(httpClient.delete).toHaveBeenCalledWith('/api/files/1')
    expect(result).toEqual(mockResponse.data)
  })
})
