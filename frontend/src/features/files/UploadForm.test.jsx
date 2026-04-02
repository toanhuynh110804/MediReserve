import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UploadForm } from './UploadForm'

describe('UploadForm', () => {
  it('renders upload form with file input', () => {
    render(<UploadForm />)
    expect(screen.getByLabelText('Chọn tệp')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tải lên/i })).toBeInTheDocument()
  })

  it('disables upload button initially', () => {
    render(<UploadForm />)
    const uploadBtn = screen.getByRole('button', { name: /tải lên/i })
    expect(uploadBtn).toBeDisabled()
  })

  it('shows heading and description', () => {
    render(<UploadForm />)
    expect(screen.getByText('Tải tệp lên')).toBeInTheDocument()
    expect(screen.getByText(/Tối đa 10MB/i)).toBeInTheDocument()
  })

  it('passes disabled prop to button', () => {
    render(<UploadForm disabled={true} />)
    const uploadBtn = screen.getByRole('button', { name: /tải lên/i })
    expect(uploadBtn).toBeDisabled()
  })

  it('accepts file types correctly', () => {
    render(<UploadForm />)
    const input = screen.getByLabelText('Chọn tệp')
    expect(input).toHaveAttribute(
      'accept',
      '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.jpeg,.gif',
    )
  })
})
