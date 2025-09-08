import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import { getCart, cartTotals, clearCart } from '../lib/cart'
import { money } from '../lib/format'
import * as bootstrap from 'bootstrap'

initTheme()

export default function Checkout() {
  const [items, setItems] = useState(getCart())
  const totals = cartTotals(items)
  const formRef = useRef(null)
  const toastRef = useRef(null)
  const toast = useRef(null)

  useEffect(() => {
    if (toastRef.current) toast.current = new bootstrap.Toast(toastRef.current, { delay: 1300 })
  }, [])

  const submit = (e) => {
    e.preventDefault()
    const form = formRef.current
    if (!form.checkValidity()) {
      form.classList.add('was-validated')
      return
    }

    // For this assignment we don't process payments
    clearCart()
    setItems([])

    // show success and go home
    toast.current?.show()
    setTimeout(() => {
      try { window.location.assign('index.html') } catch { window.location.href = 'index.html' }
    }, 1300)
  }

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <h1 className="h3 mb-3">Checkout</h1>

        {items.length === 0 ? (
          <div className="alert alert-info">
            Your cart is empty. Go back to <a className="alert-link" href="product.html">Products</a>.
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-7">
              <form ref={formRef} className="needs-validation" noValidate onSubmit={submit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label">First name</label>
                    <input id="firstName" name="firstName" className="form-control" required placeholder="e.g. Farhad" />
                    <div className="invalid-feedback">Please enter your first name.</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label">Last name</label>
                    <input id="lastName" name="lastName" className="form-control" required placeholder="e.g. Hossain" />
                    <div className="invalid-feedback">Please enter your last name.</div>
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input id="email" name="email" type="email" className="form-control" required placeholder="name@example.com" />
                    <div className="invalid-feedback">Provide a valid email.</div>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input id="phone" name="phone" type="tel" className="form-control" required pattern="^[0-9+ ()-]{6,}$" placeholder="+61 4xx xxx xxx" />
                    <div className="invalid-feedback">Enter a valid phone number.</div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input id="address" name="address" className="form-control" required placeholder="123 Example St" />
                    <div className="invalid-feedback">Address is required.</div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="city" className="form-label">City</label>
                    <input id="city" name="city" className="form-control" required />
                    <div className="invalid-feedback">City is required.</div>
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="state" className="form-label">State</label>
                    <input id="state" name="state" className="form-control" required />
                    <div className="invalid-feedback">State is required.</div>
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="zip" className="form-label">Postcode</label>
                    <input id="zip" name="zip" className="form-control" required pattern="^[0-9]{4}$" placeholder="2000" />
                    <div className="invalid-feedback">Enter a 4-digit postcode.</div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-primary" type="submit">Place order</button>
                  <a className="btn btn-outline-secondary" href="cart.html">Back to cart</a>
                </div>
              </form>
            </div>

            <div className="col-lg-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <ul className="list-group list-group-flush">
                    {items.map(it => (
                      <li className="list-group-item d-flex justify-content-between" key={it.id}>
                        <span>{it.name} × {it.qty}</span>
                        <span>{money(it.price * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="list-unstyled small mt-3">
                    <li className="d-flex justify-content-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></li>
                    <li className="d-flex justify-content-between"><span>Shipping</span><span>{money(totals.shipping)}</span></li>
                    <li className="d-flex justify-content-between border-top pt-2 fw-semibold"><span>Total</span><span>{money(totals.total)}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Success toast */}
      <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{zIndex:1080}}>
        <div ref={toastRef} className="toast text-bg-success border-0" role="status" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Order placed! Returning to Home…</div>
            <button className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Checkout />)
