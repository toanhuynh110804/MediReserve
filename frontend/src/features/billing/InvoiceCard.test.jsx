import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InvoiceCard } from './InvoiceCard'

describe('InvoiceCard', () => {
  const mockInvoice = {
    _id: '123',
    total: 500000,
    status: 'paid',
    createdAt: '2026-04-02T10:00:00Z',
    appointment: { _id: '456' },
  }

  it('renders invoice details', () => {
    render(<InvoiceCard invoice={mockInvoice} />)
    expect(screen.getByText(/Mã hóa đơn/i)).toBeInTheDocument()
    expect(screen.getByText(/123/)).toBeInTheDocument()
  })

  it('displays total amount formatted', () => {
    render(<InvoiceCard invoice={mockInvoice} />)
    expect(screen.getByText(/500.000/)).toBeInTheDocument()
  })

  it('displays status with correct color', () => {
    render(<InvoiceCard invoice={mockInvoice} />)
    const status = screen.getByText('Đã thanh toán')
    expect(status).toHaveStyle({ color: '#388e3c' })
  })

  it('returns null when invoice is null', () => {
    const { container } = render(<InvoiceCard invoice={null} />)
    expect(container.firstChild).toBeNull()
  })
})
