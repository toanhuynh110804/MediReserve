import { useCallback, useEffect, useState } from 'react'
import { getFilesApi } from '../shared/api/fileApi'
import { UploadForm } from '../features/files/UploadForm'
import { FileList } from '../features/files/FileList'
import { PageHero } from '../shared/components/PageHero'
import { StateNotice } from '../shared/components/StateNotice'

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
      <PageHero
        eyebrow="Hồ sơ y tế"
        title="Quản lý tệp hồ sơ bệnh án"
        description="Tải lên, xem và quản lý giấy tờ phục vụ khám chữa bệnh từ hệ thống của Bệnh viện Đa Khoa Thủ Đức."
        stats={[
          { label: 'Tổng tệp', value: files.length },
          { label: 'Tình trạng tải', value: loading ? 'Đang tải' : 'Sẵn sàng' },
        ]}
      />

      {error ? (
        <StateNotice tone="error" title="Tải danh sách thất bại">
          {error}
        </StateNotice>
      ) : null}

      <div className="actions">
        <button type="button" onClick={fetchFiles} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới danh sách'}
        </button>
      </div>

      <UploadForm onUploadSuccess={handleUploadSuccess} disabled={loading} />

      <FileList files={files} onFileDeleted={handleFileDeleted} disabled={loading} />
    </section>
  )
}
