import { describe, it, expect } from 'vitest'
import { money } from '../lib/format'

describe('money()', () => {
  it('formats cents properly', () => {
    expect(money(0)).toBe('$0.00')
    expect(money(3)).toBe('$3.00')
    expect(money(3.5)).toBe('$3.50')
    expect(money(129.99)).toBe('$129.99')
  })

  it('handles strings and invalid numbers', () => {
    expect(money('19.9')).toBe('$19.90')
    expect(money(NaN)).toBe('$0.00')
    expect(money(undefined)).toBe('$0.00')
  })
})
