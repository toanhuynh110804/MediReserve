import { useCallback, useEffect, useState } from 'react'
import { getFilesApi } from '../shared/api/fileApi'
import { UploadForm } from '../features/files/UploadForm'
import { FileList } from '../features/files/FileList'

export function FileManagerPage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getFilesApi()
      setFiles(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tệp.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleUploadSuccess = useCallback((uploadedFile) => {
    setFiles((prev) => [uploadedFile, ...prev])
  }, [])

  const handleFileDeleted = useCallback((deletedFileId) => {
    setFiles((prev) => prev.filter((f) => f._id !== deletedFileId))
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return (
    <section>
      <h1>Quản lý tệp</h1>
      <p>Tải lên, xem và quản lý các tệp của bạn.</p>

      {error && <p className="form-error">{error}</p>}

      <div className="actions">
        <button type="button" onClick={fetchFiles} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      <UploadForm onUploadSuccess={handleUploadSuccess} disabled={loading} />

      <FileList files={files} onFileDeleted={handleFileDeleted} disabled={loading} />
    </section>
  )
}
