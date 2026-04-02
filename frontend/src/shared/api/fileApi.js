import { httpClient } from './httpClient'

export async function uploadFileApi(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await httpClient.post('/api/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getFilesApi() {
  const response = await httpClient.get('/api/files')
  return response.data
}

export async function getFileByIdApi(fileId) {
  const response = await httpClient.get(`/api/files/${fileId}`)
  return response.data
}

export async function deleteFileApi(fileId) {
  const response = await httpClient.delete(`/api/files/${fileId}`)
  return response.data
}
