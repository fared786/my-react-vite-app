import React from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import { getFeaturedProducts } from '../lib/storefront'
import { addItem } from '../lib/cart'
import { money } from '../lib/format'
import * as bootstrap from 'bootstrap'

initTheme()

export default function Home() {
  const [featured, setFeatured] = React.useState(() => getFeaturedProducts(8))

  // Live-update if Admin changes featured in another tab
  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'admin_products') setFeatured(getFeaturedProducts(8))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Toast for "Added to cart"
  const toastRef = React.useRef(null)
  const toast = React.useRef(null)
  React.useEffect(() => {
    if (toastRef.current) toast.current = new bootstrap.Toast(toastRef.current, { delay: 1200 })
  }, [])
  const notify = (msg) => {
    const body = toastRef.current?.querySelector('.toast-body')
    if (body) body.textContent = msg
    toast.current?.show()
  }

  const add = (p) => {
    addItem(p)
    notify(`${p.name} added to cart`)
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <header className="py-5 bg-body border-bottom">
        <div className="container">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <h1 className="display-5 fw-bold">Discover New Arrivals</h1>
              <p className="lead">Search, compare, and add to cart—fast.</p>
              <form className="d-flex" role="search" aria-label="Search products"
                    onSubmit={(e)=>{e.preventDefault(); window.location.href='product.html'}}>
                <input className="form-control me-2" type="search" placeholder="Search products…" aria-label="Search" />
                <button className="btn btn-primary" type="submit">Search</button>
              </form>
            </div>
            
            {/* <div className="col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Featured</h5>
                  <p className="card-text">Handpicked items by Admin. Toggle “Featured” in Admin to show here.</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      {/* Featured grid */}
      <main className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h4 mb-0">Featured Products</h2>
          <a className="btn btn-outline-secondary btn-sm" href="product.html">View all</a>
        </div>

        {featured.length === 0 ? (
          <div className="alert alert-info">No featured products yet. Mark some in Admin to show them here.</div>
        ) : (
          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
            {featured.map(p => (
              <div className="col" key={p.id}>
                <div className="card h-100 shadow-sm">
                  <img src={p.image} className="card-img-top" alt={p.name} />
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title mb-1">{p.name}</h6>
                    <div className="text-muted small mb-2">{p.category}</div>
                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      <span className="fw-semibold">{money(p.price)}</span>
                      <button className="btn btn-sm btn-primary" onClick={() => add(p)}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Toast */}
      <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1080 }}>
        <div ref={toastRef} className="toast text-bg-success border-0" role="status" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Added to cart.</div>
            <button className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Home />)
