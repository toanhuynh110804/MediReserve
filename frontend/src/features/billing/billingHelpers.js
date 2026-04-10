export function renderInvoiceStatus(status) {
  const statusMap = {
    unpaid: { label: 'Chưa thanh toán', color: '#d32f2f' },
    paid: { label: 'Đã thanh toán', color: '#388e3c' },
    partial: { label: 'Thanh toán từng phần', color: '#f57c00' },
    refunded: { label: 'Hoàn tiền', color: '#1976d2' },
  }
  return statusMap[status] || { label: status, color: '#666' }
}

export function renderPaymentStatus(status) {
  const statusMap = {
    pending: { label: 'Chờ xử lý', color: '#fbc02d' },
    completed: { label: 'Hoàn thành', color: '#388e3c' },
    failed: { label: 'Thất bại', color: '#d32f2f' },
    refunded: { label: 'Hoàn tiền', color: '#1976d2' },
  }
  return statusMap[status] || { label: status, color: '#666' }
}

export function renderPaymentMethod(method) {
  const methodMap = {
    cash: 'Tiền mặt',
    card: 'Thẻ tín dụng',
    insurance: 'Bảo hiểm',
    online: 'Thanh toán trực tuyến',
  }
  return methodMap[method] || method
}
