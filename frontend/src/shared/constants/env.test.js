import { describe, expect, it } from 'vitest'
import { resolveSocketUrl } from './env'

describe('resolveSocketUrl', () => {
  it('uses explicit socket url when provided', () => {
    const result = resolveSocketUrl({
      socketUrl: 'http://localhost:4001',
      apiBaseUrl: 'http://localhost:3000',
    })

    expect(result).toBe('http://localhost:4001')
  })

  it('falls back to api base url when socket url missing', () => {
    const result = resolveSocketUrl({
      socketUrl: '',
      apiBaseUrl: 'http://localhost:3000',
    })

    expect(result).toBe('http://localhost:3000')
  })
})
