import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import * as bootstrap from 'bootstrap'
import { PRODUCTS, CATEGORIES } from '../data/products'
import { money } from '../lib/format'

initTheme()

const KEY = 'admin_products'

// Load admin products (seed from PRODUCTS the first time)
function loadProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(data) && data.length) return data
  } catch (err) {
    console.warn('[admin_products] JSON parse failed:', err)
  }
  const seed = PRODUCTS.map(p => ({ ...p }))
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

function saveProducts(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
  // notify other tabs/components (optional)
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
}

export default function AdminPage() {
  const [list, setList] = useState(loadProducts())
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')

  // Create form
  const createRef = useRef(null)

  // --- Edit modal state (controlled) ---
  const [editItem, setEditItem] = useState(null) // the product being edited (id + original)
  const [editDraft, setEditDraft] = useState({
    name: '',
    category: '',
    price: '',
    rating: '',
    image: '',
    featured: false
  })

  const editModalRef = useRef(null)
  const editModal = useRef(null)
  useEffect(() => {
    if (editModalRef.current) editModal.current = new bootstrap.Modal(editModalRef.current)
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return list.filter(
      p => (cat === 'All' || p.category === cat) && (s === '' || p.name.toLowerCase().includes(s))
    )
  }, [list, q, cat])

  // ----------------- CREATE -----------------
  const createProduct = (e) => {
    e.preventDefault()
    const form = createRef.current
    if (!form.checkValidity()) { form.classList.add('was-validated'); return }

    const data = Object.fromEntries(new FormData(form).entries())
    const maxId = list.reduce((m, p) => Math.max(m, Number(p.id)), 0)

    const newItem = {
      id: maxId + 1,
      name: data.name.trim(),
      category: data.category,
      price: Number(data.price),
      rating: Number(data.rating) || 4.0,
      image: (data.image && data.image.trim()) || '', // URL only; keep as string
      featured: data.featured === 'on'
    }

    const next = [...list, newItem]
    setList(next); saveProducts(next)
    form.reset(); form.classList.remove('was-validated')
  }

  // ----------------- EDIT OPEN -----------------
  const openEdit = (item) => {
    // ensure stable types and normalised strings
    const safe = { ...item, id: Number(item.id) }
    setEditItem(safe)
    setEditDraft({
      name: safe.name || '',
      category: safe.category || (CATEGORIES.find(c => c !== 'All') || ''),
      price: safe.price != null ? String(safe.price) : '',
      rating: safe.rating != null ? String(safe.rating) : '',
      image: String(safe.image ?? '').trim(), // always a string
      featured: !!safe.featured
    })
    // Show after state is applied so inputs render correct values
    requestAnimationFrame(() => editModal.current?.show())
  }

  // ----------------- EDIT CHANGE -----------------
  const onEditChange = (field, value) => {
    setEditDraft(prev => ({ ...prev, [field]: value }))
  }

  // ----------------- EDIT SAVE -----------------
  const updateProduct = (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) { form.classList.add('was-validated'); return }

    const id = editItem.id
    const next = list.map(p => p.id === id ? {
      ...p,
      name: editDraft.name.trim(),
      category: editDraft.category,
      price: Number(editDraft.price),
      rating: editDraft.rating === '' ? p.rating : Number(editDraft.rating),
      image: (editDraft.image && editDraft.image.trim()) || p.image, // keep previous if blank
      featured: !!editDraft.featured
    } : p)

    setList(next); saveProducts(next)
    editModal.current?.hide()
  }

  // ----------------- DELETE -----------------
  const deleteProduct = (id) => {
    if (!confirm('Delete this product?')) return
    const next = list.filter(p => p.id !== id)
    setList(next); saveProducts(next)
  }

  // ----------------- RESET -----------------
  const resetAll = () => {
    if (!confirm('Reset to seed data? This will overwrite current admin products.')) return
    localStorage.removeItem(KEY)
    const next = loadProducts()
    setList(next)
  }

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="h3 mb-0">Admin — Product Management</h1>
          <button className="btn btn-outline-danger" onClick={resetAll}>Reset to Seed</button>
        </div>

        {/* Create new */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Create Product</h5>
            <form ref={createRef} className="row g-3 needs-validation" noValidate onSubmit={createProduct}>
              <div className="col-md-4">
                <label className="form-label" htmlFor="name">Name</label>
                <input id="name" name="name" className="form-control" required placeholder="Product name" />
                <div className="invalid-feedback">Enter a name.</div>
              </div>
              <div className="col-md-3">
                <label className="form-label" htmlFor="category">Category</label>
                <select id="category" name="category" className="form-select" required>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="invalid-feedback">Choose a category.</div>
              </div>
              <div className="col-md-2">
                <label className="form-label" htmlFor="price">Price (AUD)</label>
                <input id="price" name="price" type="number" step="0.01" min="0" className="form-control" required placeholder="0.00" />
                <div className="invalid-feedback">Enter a valid price.</div>
              </div>
              <div className="col-md-2">
                <label className="form-label" htmlFor="rating">Rating</label>
                <input id="rating" name="rating" type="number" step="0.1" min="0" max="5" className="form-control" placeholder="4.0" />
              </div>
              <div className="col-md-6">
                {/* URL-only */}
                <label className="form-label" htmlFor="image">Image URL</label>
                <input id="image" name="image" type="url" className="form-control" placeholder="https://example.com/image.jpg" />
              </div>
              <div className="col-md-3 d-flex align-items-center">
                <div className="form-check mt-4">
                  <input id="featured" name="featured" className="form-check-input" type="checkbox" />
                  <label className="form-check-label" htmlFor="featured">Featured</label>
                </div>
              </div>

              <div className="col-12">
                <button className="btn btn-primary" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-3 align-items-end mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="search">Search</label>
            <input
              id="search"
              className="form-control"
              placeholder="Search by name…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="cat">Category</label>
            <select id="cat" className="form-select" value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th style={{ width: '4rem' }}>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th className="text-end">Price</th>
                <th className="text-end">Rating</th>
                <th className="text-center" style={{ width: '6rem' }}>Feat.</th>
                <th className="text-end" style={{ width: '12rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td className="text-end">{money(p.price)}</td>
                  <td className="text-end">{p.rating}</td>
                  <td className="text-center">
                    {p.featured ? <span className="badge text-bg-warning" title="Featured">★</span> : ''}
                  </td>
                  <td className="text-end">
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No products.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Edit Modal (controlled inputs) */}
      <div className="modal fade" tabIndex="-1" ref={editModalRef} aria-labelledby="editTitle" aria-hidden="true">
        <div className="modal-dialog">
          <form
            key={editItem?.id}
            className="modal-content needs-validation"
            noValidate
            onSubmit={updateProduct}
          >
            <div className="modal-header">
              <h5 className="modal-title" id="editTitle">Edit Product{editItem ? ` #${editItem.id}` : ''}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            {editItem && (
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label" htmlFor="editName">Name</label>
                  <input
                    id="editName" className="form-control" required
                    value={editDraft.name}
                    onChange={e => onEditChange('name', e.target.value)}
                  />
                  <div className="invalid-feedback">Enter a name.</div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="editCategory">Category</label>
                    <select
                      id="editCategory" className="form-select" required
                      value={editDraft.category}
                      onChange={e => onEditChange('category', e.target.value)}
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="invalid-feedback">Choose a category.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="editPrice">Price (AUD)</label>
                    <input
                      id="editPrice" type="number" step="0.01" min="0" className="form-control" required
                      value={editDraft.price}
                      onChange={e => onEditChange('price', e.target.value)}
                    />
                    <div className="invalid-feedback">Enter a valid price.</div>
                  </div>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="editRating">Rating</label>
                    <input
                      id="editRating" type="number" step="0.1" min="0" max="5" className="form-control"
                      value={editDraft.rating}
                      onChange={e => onEditChange('rating', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    {/* URL-only */}
                    <label className="form-label" htmlFor="editImage">Image URL</label>
                    <input
                      id="editImage" type="url" className="form-control"
                      placeholder="https://example.com/image.jpg"
                      value={editDraft.image ?? ''}
                      onChange={e => onEditChange('image', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    id="editFeatured" type="checkbox" className="form-check-input"
                    checked={!!editDraft.featured}
                    onChange={e => onEditChange('featured', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="editFeatured">Featured</label>
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminPage />)
