export function lineTotal(price, qty) {
  const p = Number(price) || 0
  const q = Math.max(0, Number(qty) || 0)
  return +(p * q).toFixed(2)
}

export function cartTotal(items) {
  // items: [{ price, qty }]
  return +items.reduce((sum, it) => sum + lineTotal(it.price, it.qty), 0).toFixed(2)
}
