import React from 'react'
import { toggleTheme } from '../lib/theme'
import { cartCount } from '../lib/cart'

export default function Navbar() {
  const [count, setCount] = React.useState(() => cartCount())

  React.useEffect(() => {
    const onChange = (e) => setCount(e.detail?.count ?? cartCount())
    window.addEventListener('cart:change', onChange)
    return () => window.removeEventListener('cart:change', onChange)
  }, [])

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top blur-on-scroll">
      <div className="container">
        <a className="navbar-brand fw-bold" href="index.html">MyStore</a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {/* Left side links (no Admin here anymore) */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><a className="nav-link" href="product.html">Products</a></li>
            <li className="nav-item"><a className="nav-link" href="about.html">About</a></li>
          </ul>

          {/* Right side actions: Cart / Admin / Register / Login / Theme */}
          <div className="d-flex align-items-center gap-2">
            {/* Cart with live badge */}
            <a className="btn btn-outline-secondary position-relative" href="cart.html" aria-label="Open cart">
              Cart
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
                aria-label={`Items in cart: ${count}`}
              >
                {count}
                <span className="visually-hidden">items in cart</span>
              </span>
            </a>

            {/* NEW: Admin button moved here */}
            <a className="btn btn-outline-secondary" href="admin.html">Admin</a>

            <a className="btn btn-outline-primary" href="register.html">Register</a>
            <a className="btn btn-primary" href="dashboard.html">Login</a>
            <button className="btn btn-outline-secondary" onClick={toggleTheme} aria-label="Toggle theme">🌓</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
