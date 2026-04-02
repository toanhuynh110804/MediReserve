import { renderInvoiceStatus } from './billingHelpers'

export function InvoiceCard({ invoice }) {
  if (!invoice) return null

  const status = renderInvoiceStatus(invoice.status)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0)
  }

  return (
    <div className="status-box">
      <p>
        <strong>Mã hóa đơn:</strong> {invoice._id}
      </p>
      <p>
        <strong>Ngày tạo:</strong> {formatDate(invoice.createdAt)}
      </p>
      <p>
        <strong>Tổng tiền:</strong> {formatCurrency(invoice.total)}
      </p>
      <p>
        <strong>Trạng thái:</strong>{' '}
        <span style={{ color: status.color, fontWeight: 'bold' }}>
          {status.label}
        </span>
      </p>
      {invoice.appointment && (
        <p>
          <strong>Liên quan:</strong> Lịch hẹn {invoice.appointment._id?.slice(-6) || 'N/A'}
        </p>
      )}
    </div>
  )
}
