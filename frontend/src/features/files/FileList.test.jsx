import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileList } from './FileList'

describe('FileList', () => {
  const mockFiles = [
    {
      _id: '1',
      filename: 'document.pdf',
      url: '/uploads/document.pdf',
      size: 102400,
      mimeType: 'application/pdf',
      createdAt: '2026-04-02T10:00:00Z',
    },
    {
      _id: '2',
      filename: 'image.jpg',
      url: '/uploads/image.jpg',
      size: 51200,
      mimeType: 'image/jpeg',
      createdAt: '2026-04-02T11:00:00Z',
    },
  ]

  it('renders empty message when no files', () => {
    render(<FileList files={[]} />)
    expect(screen.getByText(/Chưa có tệp nào/i)).toBeInTheDocument()
  })

  it('renders file list table when files exist', () => {
    render(<FileList files={mockFiles} />)
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('image.jpg')).toBeInTheDocument()
  })

  it('displays file metadata correctly', () => {
    render(<FileList files={mockFiles} />)
    expect(screen.getByText('application/pdf')).toBeInTheDocument()
    expect(screen.getByText('image/jpeg')).toBeInTheDocument()
  })

  it('shows delete buttons for each file', () => {
    render(<FileList files={mockFiles} />)
    const deleteButtons = screen.getAllByRole('button', { name: /xóa/i })
    expect(deleteButtons).toHaveLength(2)
  })

  it('disables delete buttons when disabled prop is true', () => {
    render(<FileList files={mockFiles} disabled={true} />)
    const deleteButtons = screen.getAllByRole('button', { name: /xóa/i })
    deleteButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('renders download links for each file', () => {
    render(<FileList files={mockFiles} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/uploads/document.pdf')
    expect(links[1]).toHaveAttribute('href', '/uploads/image.jpg')
  })
})
