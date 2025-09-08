import { describe, it, expect } from 'vitest'
import { lineTotal, cartTotal } from '../lib/cartMath'

describe('cart math', () => {
  it('computes line totals', () => {
    expect(lineTotal(10, 2)).toBe(20)
    expect(lineTotal('19.99', 3)).toBe(59.97)
    expect(lineTotal(5, 0)).toBe(0)
    expect(lineTotal(5, -2)).toBe(0)
  })

  it('sums the cart total', () => {
    const items = [
      { price: 19.99, qty: 2 }, // 39.98
      { price: 5, qty: 3 }      // 15.00
    ]
    expect(cartTotal(items)).toBe(54.98)
  })
})
