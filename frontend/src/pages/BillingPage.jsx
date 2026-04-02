import { useCallback, useEffect, useState } from 'react'
import { getInvoicesApi } from '../shared/api/invoiceApi'
import { getPaymentsApi } from '../shared/api/paymentApi'
import { useAuth } from '../features/auth/useAuth'
import { InvoiceCard } from '../features/billing/InvoiceCard'
import { PaymentRow } from '../features/billing/PaymentRow'
import { PageHero } from '../shared/components/PageHero'
import { StateNotice } from '../shared/components/StateNotice'

export function BillingPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('invoices')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const userId = user?._id || user?.id
      const [invoiceData, paymentData] = await Promise.all([
        getInvoicesApi({ patient: userId }),
        getPaymentsApi({ patient: userId }),
      ])

      setInvoices(invoiceData)
      setPayments(paymentData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu thanh toán.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <section>
      <PageHero
        eyebrow="Billing"
        title="Quản lý thanh toán"
        description="Theo dõi hóa đơn, lịch sử thanh toán và đối chiếu trạng thái thu phí của bạn theo dữ liệu backend thật."
        stats={[
          { label: 'Hóa đơn', value: invoices.length },
          { label: 'Thanh toán', value: payments.length },
          { label: 'Tab hiện tại', value: activeTab === 'invoices' ? 'Hóa đơn' : 'Thanh toán' },
        ]}
      />

      {error ? (
        <StateNotice tone="error" title="Tải dữ liệu thất bại">
          {error}
        </StateNotice>
      ) : null}

      <div className="actions">
        <button type="button" onClick={fetchData} disabled={loading}>
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={activeTab === 'invoices' ? 'active' : ''}
          onClick={() => setActiveTab('invoices')}
        >
          Hóa đơn ({invoices.length})
        </button>
        <button
          type="button"
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          Thanh toán ({payments.length})
        </button>
      </div>

      {activeTab === 'invoices' && (
        <div>
          <h2>Danh sách hóa đơn</h2>
          {invoices.length === 0 ? (
            <p className="muted">Chưa có hóa đơn nào.</p>
          ) : (
            <div>
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice._id} invoice={invoice} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h2>Lịch sử thanh toán</h2>
          {payments.length === 0 ? (
            <p className="muted">Chưa có thanh toán nào.</p>
          ) : (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID thanh toán</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Ngày thanh toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <PaymentRow key={payment._id} payment={payment} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}
