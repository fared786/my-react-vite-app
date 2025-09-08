import React from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import ProductCard from '../components/ProductCard'
import ViewToggle from '../components/ViewToggle'
import { PRODUCTS, CATEGORIES } from '../data/products'
import { addItem } from '../lib/cart'

initTheme()

// --- NEW: read from admin-managed products, fallback to seed ---
const KEY = 'admin_products'
function loadProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(data) && data.length) return data
  } catch (err) {
    console.warn('[products] JSON parse failed:', err)
  }
  return PRODUCTS.map(p => ({ ...p }))
}
// ---------------------------------------------------------------

const SORTS = [
  { id: 'name-asc', label: 'Name (A–Z)', fn: (a,b)=>a.name.localeCompare(b.name) },
  { id: 'price-asc', label: 'Price (low → high)', fn: (a,b)=>a.price - b.price },
  { id: 'price-desc', label: 'Price (high → low)', fn: (a,b)=>b.price - a.price },
  { id: 'rating-desc', label: 'Rating (high → low)', fn: (a,b)=>b.rating - a.rating },
]

const PREF_KEY = 'product-page-prefs'

function usePrefs() {
  const [prefs, setPrefs] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || { view:'grid', sort:'name-asc', category:'All', q:'' } }
    catch { return { view:'grid', sort:'name-asc', category:'All', q:'' } }
  })
  React.useEffect(()=> localStorage.setItem(PREF_KEY, JSON.stringify(prefs)), [prefs])
  return [prefs, setPrefs]
}

function addToCart(product) {
  addItem(product) // will broadcast cart:change
}

export default function ProductPage() {
  const [prefs, setPrefs] = usePrefs()
  const [announce, setAnnounce] = React.useState('')
  const [list, setList] = React.useState(loadProducts()) // NEW

  // NEW: live-refresh when Admin updates products
  React.useEffect(() => {
    const onStorage = (e) => {
      if (!e || !('key' in e) || e.key === KEY) setList(loadProducts())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setView = (v)=> setPrefs(p=>({ ...p, view:v }))
  const setSort = (s)=> setPrefs(p=>({ ...p, sort:s }))
  const setCategory = (c)=> setPrefs(p=>({ ...p, category:c }))
  const setQ = (q)=> setPrefs(p=>({ ...p, q }))

  const sortObj = SORTS.find(s => s.id === prefs.sort) || SORTS[0]

  const filtered = React.useMemo(()=>{
    const q = prefs.q.trim().toLowerCase()
    const cat = prefs.category
    let results = list.filter(p => (cat==='All' || p.category===cat) && (q==='' || p.name.toLowerCase().includes(q))) // CHANGED: use list
    results.sort(sortObj.fn)
    return results
  }, [list, prefs.q, prefs.category, sortObj]) // CHANGED: depend on list

  // ARIA live announcement when results change
  React.useEffect(()=>{
    setAnnounce(`${filtered.length} products shown`)
  }, [filtered.length, prefs.view, prefs.sort, prefs.category])

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <h1 className="h3 mb-3">Products</h1>

        <div className="row gy-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label" htmlFor="q">Search</label>
            <input id="q" className="form-control" placeholder="Search products…" value={prefs.q} onChange={e=>setQ(e.target.value)} />
          </div>

          <div className="col-md-3">
            <label className="form-label" htmlFor="category">Category</label>
            <select id="category" className="form-select" value={prefs.category} onChange={e=>setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label" htmlFor="sort">Sort by</label>
            <select id="sort" className="form-select" value={prefs.sort} onChange={e=>setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div className="col-md-2 d-flex justify-content-md-end">
            <ViewToggle view={prefs.view} setView={setView} />
          </div>
        </div>

        {/* live region for screen readers */}
        <div className="visually-hidden" role="status" aria-live="polite">{announce}</div>

        {/* results */}
        {prefs.view === 'grid' ? (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4 mt-2">
            {filtered.map(p => (
              <div className="col" key={p.id}>
                <ProductCard product={p} view="grid" onAdd={addToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            {filtered.map(p => <ProductCard key={p.id} product={p} view="list" onAdd={addToCart} />)}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="alert alert-warning mt-4">No products match your search.</div>
        )}
      </main>
      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<ProductPage />)
