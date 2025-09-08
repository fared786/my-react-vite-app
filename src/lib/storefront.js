// Reads products for the storefront, preferring Admin-managed data.
// Falls back to the static PRODUCTS seed if admin_products is empty.
import { PRODUCTS } from '../data/products'

const ADMIN_KEY = 'admin_products'

export function getStorefrontProducts() {
  try {
    const admin = JSON.parse(localStorage.getItem(ADMIN_KEY))
    if (Array.isArray(admin) && admin.length) return admin
  } catch {}
  return PRODUCTS
}

// Build categories dynamically from current products (always includes "All")
export function getStorefrontCategories(products = getStorefrontProducts()) {
  const set = new Set()
  for (const p of products) if (p?.category) set.add(p.category)
  return ['All', ...Array.from(set).sort()]
}

// NEW: Featured products (ensure boolean + optional cap)
export function getFeaturedProducts(limit = 8) {
  const products = getStorefrontProducts()
  const featured = products.filter(p => p?.featured === true)
  if (featured.length) return featured.slice(0, limit)
  // Fallback: show first few if none marked featured
  return products.slice(0, limit)
}
