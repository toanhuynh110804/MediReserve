import { renderPaymentStatus, renderPaymentMethod } from './billingHelpers'

export function PaymentRow({ payment }) {
  if (!payment) return null

  const status = renderPaymentStatus(payment.status)
  const method = renderPaymentMethod(payment.method)

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0)
  }

  return (
    <tr>
      <td>{payment._id?.slice(-8)}</td>
      <td>{formatCurrency(payment.amount)}</td>
      <td>{method}</td>
      <td>{formatDate(payment.createdAt)}</td>
      <td>
        <span style={{ color: status.color, fontWeight: 'bold' }}>
          {status.label}
        </span>
      </td>
    </tr>
  )
}
