import { useCallback, useState } from 'react'
import { uploadFileApi } from '../../shared/api/fileApi'

export function UploadForm({ onUploadSuccess, disabled = false }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file trước khi tải lên.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploaded = await uploadFileApi(selectedFile)
      setSelectedFile(null)
      onUploadSuccess?.(uploaded)
    } catch (err) {
      setError(err.response?.data?.message || 'Tải file thất bại.')
    } finally {
      setUploading(false)
    }
  }, [selectedFile, onUploadSuccess])

  return (
    <div className="panel">
      <h2>Tải tệp lên</h2>
      <p className="muted">Tối đa 10MB, hỗ trợ PDF, Word, Excel, hình ảnh.</p>

      <label htmlFor="file-input">Chọn tệp</label>
      <div className="actions">
        <input
          id="file-input"
          type="file"
          onChange={handleFileSelect}
          disabled={uploading || disabled}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.jpeg,.gif"
        />
        {selectedFile && <span className="muted">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</span>}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="actions">
        <button type="button" onClick={handleUpload} disabled={!selectedFile || uploading || disabled}>
          {uploading ? 'Đang tải...' : 'Tải lên'}
        </button>
      </div>
    </div>
  )
}
