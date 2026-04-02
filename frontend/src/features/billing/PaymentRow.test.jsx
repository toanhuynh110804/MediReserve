import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaymentRow } from './PaymentRow'

describe('PaymentRow', () => {
  const mockPayment = {
    _id: '123456789',
    amount: 250000,
    method: 'card',
    status: 'completed',
    createdAt: '2026-04-02T10:00:00Z',
  }

  it('renders payment row in table', () => {
    render(
      <table>
        <tbody>
          <PaymentRow payment={mockPayment} />
        </tbody>
      </table>,
    )
    expect(screen.getByText(/23456789/)).toBeInTheDocument()
  })

  it('displays amount formatted', () => {
    render(
      <table>
        <tbody>
          <PaymentRow payment={mockPayment} />
        </tbody>
      </table>,
    )
    expect(screen.getByText(/250.000/)).toBeInTheDocument()
  })

  it('displays payment method', () => {
    render(
      <table>
        <tbody>
          <PaymentRow payment={mockPayment} />
        </tbody>
      </table>,
    )
    expect(screen.getByText(/Thẻ tín dụng/)).toBeInTheDocument()
  })

  it('displays status with correct color', () => {
    render(
      <table>
        <tbody>
          <PaymentRow payment={mockPayment} />
        </tbody>
      </table>,
    )
    const status = screen.getByText('Hoàn thành')
    expect(status).toHaveStyle({ color: '#388e3c' })
  })

  it('returns null when payment is null', () => {
    const { container } = render(
      <table>
        <tbody>
          <PaymentRow payment={null} />
        </tbody>
      </table>,
    )
    expect(container.querySelector('tr')).toBeNull()
  })
})
