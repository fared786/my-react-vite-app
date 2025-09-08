import React from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import { getCart, addQty, subQty, removeItem, cartTotals, clearCart } from '../lib/cart'
import { money } from '../lib/format'

initTheme()

export default function Cart() {
  const [items, setItems] = React.useState(getCart())

  const inc = (id) => setItems([...addQty(id)])
  const dec = (id) => setItems([...subQty(id)])
  const remove = (id) => setItems([...removeItem(id)])
  const empty = () => { clearCart(); setItems([]) }

  const totals = cartTotals(items)

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <h1 className="h3 mb-3">Your Cart</h1>

        {items.length === 0 ? (
          <div className="alert alert-info">
            Your cart is empty. Explore <a href="product.html" className="alert-link">products</a>.
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center" style={{width:'10rem'}}>Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(it => (
                      <tr key={it.id}>
                        <td>
                          <div className="fw-semibold">{it.name}</div>
                          <div className="text-muted small">ID: {it.id}</div>
                        </td>
                        <td className="text-center">
                          <div className="btn-group" role="group" aria-label={`Quantity for ${it.name}`}>
                            <button className="btn btn-outline-secondary qty-btn" onClick={()=>dec(it.id)} aria-label="Decrease">−</button>
                            <span className="btn btn-outline-secondary disabled">{it.qty}</span>
                            <button className="btn btn-outline-secondary qty-btn" onClick={()=>inc(it.id)} aria-label="Increase">+</button>
                          </div>
                        </td>
                        <td className="text-end">{money(it.price)}</td>
                        <td className="text-end">{money(it.price * it.qty)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(it.id)} aria-label={`Remove ${it.name}`}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex gap-2">
                <a className="btn btn-outline-secondary" href="product.html">Continue shopping</a>
                <button className="btn btn-outline-danger" onClick={empty}>Empty cart</button>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Summary</h5>
                  <ul className="list-unstyled small">
                    <li className="d-flex justify-content-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></li>
                    <li className="d-flex justify-content-between"><span>Shipping</span><span>{money(totals.shipping)}</span></li>
                    <li className="d-flex justify-content-between border-top pt-2 fw-semibold"><span>Total</span><span>{money(totals.total)}</span></li>
                  </ul>
                  <a className="btn btn-primary w-100" href="checkout.html" aria-label="Proceed to checkout">Proceed to checkout</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Cart />)
