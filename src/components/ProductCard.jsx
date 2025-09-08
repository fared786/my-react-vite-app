import React from 'react'
import { money } from '../lib/format'

export default function ProductCard({ product, view = 'grid', onAdd }) {
  if (view === 'list') {
    return (
      <div className="card mb-3 shadow-sm">
        <div className="row g-0">
          <div className="col-md-4">
            <img src={product.image} className="img-fluid rounded-start product-card-img" alt={product.name} />
          </div>
          <div className="col-md-8">
            <div className="card-body">
              <h5 className="card-title mb-1">{product.name}</h5>
              <div className="text-muted small mb-2">{product.category} · ⭐ {product.rating}</div>
              <p className="card-text fw-semibold">{money(product.price)}</p>
              <button className="btn btn-primary" onClick={() => onAdd(product)}>Add to cart</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // grid view
  return (
    <div className="card h-100 shadow-sm">
      <img src={product.image} className="card-img-top product-card-img" alt={product.name} />
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{product.name}</h6>
        <div className="text-muted small mb-2">{product.category} · ⭐ {product.rating}</div>
        <div className="mt-auto d-flex align-items-center justify-content-between">
          <span className="fw-semibold">{money(product.price)}</span>
          <button className="btn btn-sm btn-primary" onClick={() => onAdd(product)}>Add</button>
        </div>
      </div>
    </div>
  )
}
