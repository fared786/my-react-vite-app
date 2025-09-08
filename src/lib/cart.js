const KEY = 'cart'
const EVT = 'cart:change'

function broadcast(items) {
  const count = items.reduce((n, it) => n + it.qty, 0)
  window.dispatchEvent(new CustomEvent(EVT, { detail: { items, count } }))
}

export function getCart() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] }
  catch { return [] }
}

export function setCart(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
  broadcast(items)
}

export function cartCount() {
  return getCart().reduce((n, it) => n + it.qty, 0)
}

export function addItem(product) {
  const cart = getCart()
  const i = cart.findIndex(x => x.id === product.id)
  if (i >= 0) cart[i].qty += 1
  else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 })
  setCart(cart)
  return cart
}

export function addQty(id) {
  const cart = getCart()
  const i = cart.findIndex(x => x.id === id)
  if (i >= 0) cart[i].qty += 1
  setCart(cart)
  return cart
}

export function subQty(id) {
  const cart = getCart()
  const i = cart.findIndex(x => x.id === id)
  if (i >= 0) cart[i].qty = Math.max(1, cart[i].qty - 1)
  setCart(cart)
  return cart
}

export function removeItem(id) {
  const cart = getCart().filter(x => x.id !== id)
  setCart(cart)
  return cart
}

export function clearCart() {
  setCart([])
}

export function cartTotals(items = getCart()) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
  const shipping = items.length ? 9.95 : 0
  const total = subtotal + shipping
  return { subtotal, shipping, total }
}
