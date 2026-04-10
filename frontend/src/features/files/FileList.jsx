import { useCallback, useState } from 'react'
import { deleteFileApi } from '../../shared/api/fileApi'

export function FileList({ files = [], onFileDeleted, disabled = false }) {
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const handleDelete = useCallback(
    async (fileId) => {
      if (!window.confirm('Bạn chắc chắn muốn xóa tệp này?')) {
        return
      }

      setDeleting(fileId)
      setError('')

      try {
        await deleteFileApi(fileId)
        onFileDeleted?.(fileId)
      } catch (err) {
        setError(err.response?.data?.message || 'Xóa tệp thất bại.')
      } finally {
        setDeleting(null)
      }
    },
    [onFileDeleted],
  )

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="panel">
      <h2>Danh sách hồ sơ đã tải</h2>

      {error && <p className="form-error">{error}</p>}

      {files.length === 0 ? (
        <p className="muted">Chưa có hồ sơ nào. Vui lòng tải hồ sơ ở phần bên trên.</p>
      ) : (
        <table className="file-list">
          <thead>
            <tr>
              <th>Tên tệp</th>
              <th>Kích thước</th>
              <th>Loại</th>
              <th>Ngày tải</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id}>
                <td>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" title="Mở tệp">
                    {file.filename}
                  </a>
                </td>
                <td>{formatSize(file.size)}</td>
                <td>{file.mimeType}</td>
                <td>{formatDate(file.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="warn"
                    onClick={() => handleDelete(file._id)}
                    disabled={deleting === file._id || disabled}
                  >
                    {deleting === file._id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
