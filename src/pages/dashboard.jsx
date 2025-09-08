import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import * as bootstrap from 'bootstrap'

initTheme()

// ---- Helpers ---------------------------------------------------------------

// Read any previous shape and normalize to { name, email, phone, password }
function loadCanonicalUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return {}
    const obj = JSON.parse(raw)

    const get = (...keys) => {
      for (const k of keys) {
        const hit = Object.keys(obj).find(x => x.toLowerCase() === k.toLowerCase())
        if (hit && String(obj[hit]).trim() !== '') return String(obj[hit]).trim()
      }
      return ''
    }

    const first = get('firstName', 'firstname')
    const last  = get('lastName', 'lastname')
    const nameParts = [first, last].filter(Boolean).join(' ')

    const user = {
      name: get('name', 'fullName', 'fullname') || nameParts,
      email: get('email', 'userEmail', 'username'),
      phone: get('phone', 'mobile', 'contact'),
      password: get('password', 'pwd')
    }

    // Write back the canonical shape so future reads are simple
    localStorage.setItem('user', JSON.stringify(user))
    return user
  } catch {
    return {}
  }
}

function saveCanonicalUser(next) {
  const user = {
    name: (next.name || '').trim(),
    email: (next.email || '').trim(),
    phone: (next.phone || '').trim(),
    password: (next.password || '').trim()
  }
  localStorage.setItem('user', JSON.stringify(user))
  return user
}

function hasAnyProfile(u) {
  return !!(u && (u.name || u.email || u.phone))
}

// ---- Component -------------------------------------------------------------

export default function Dashboard() {
  // All hooks go at the top (Rules of Hooks)
  const [user, setUser] = useState(() => loadCanonicalUser())
  const [submitting, setSubmitting] = useState(false)
  const [showPwdEdit, setShowPwdEdit] = useState(false)
  const [showPwdQuick, setShowPwdQuick] = useState(false)

  const formRef = useRef(null)
  const quickLoginRef = useRef(null)

  const toastRef = useRef(null)
  const toast = useRef(null)
  useEffect(() => {
    if (toastRef.current) {
      toast.current = new bootstrap.Toast(toastRef.current, { delay: 1200 })
    }
  }, [])

  const loggedIn = hasAnyProfile(user)

  // Welcome toast if redirected from register
  useEffect(() => {
    if (toast.current && sessionStorage.getItem('justRegistered') === '1') {
      const body = toastRef.current?.querySelector('.toast-body')
      if (body) body.textContent = `Welcome, ${user.name || 'User'}! Your account is ready.`
      toast.current.show()
      sessionStorage.removeItem('justRegistered')
    }
  }, [user.name])

  // Handlers: Quick Login (no DB)
  const quickLogin = (e) => {
    e.preventDefault()
    const form = quickLoginRef.current
    if (!form.checkValidity()) { form.classList.add('was-validated'); return }

    const data = Object.fromEntries(new FormData(form).entries())
    const next = saveCanonicalUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    })
    setUser(next)

    const body = toastRef.current?.querySelector('.toast-body')
    if (body) body.textContent = `Welcome, ${next.name || 'User'}!`
    toast.current?.show()
  }

  // Handlers: Save edits
  const onSubmit = (e) => {
    e.preventDefault()
    const form = formRef.current
    if (!form.checkValidity()) { form.classList.add('was-validated'); return }

    setSubmitting(true)
    const data = Object.fromEntries(new FormData(form).entries())
    const next = saveCanonicalUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    })
    setUser(next)

    const body = toastRef.current?.querySelector('.toast-body')
    if (body) body.textContent = 'Profile updated successfully.'
    toast.current?.show()
    setSubmitting(false)
  }

  const onReset = (e) => {
    e.preventDefault()
    formRef.current.reset()
    formRef.current.classList.remove('was-validated')
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser({})
    try { window.location.assign('index.html') } catch { window.location.href = 'index.html' }
  }

  // -------------------- NOT LOGGED IN → Quick Login --------------------
  if (!loggedIn) {
    return (
      <>
        <Navbar />
        <main className="container py-5">
          <h1 className="h3 mb-4">User Panel — Quick Login</h1>
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Sign in (no database)</h5>
                  <p className="text-muted small">Demo only: your details are stored locally in this browser.</p>

                  {/* ORDER: Name, Email, Password, Phone */}
                  <form ref={quickLoginRef} className="row g-3 needs-validation" noValidate onSubmit={quickLogin}>
                    <div className="col-md-6">
                      <label htmlFor="ql_name" className="form-label">Name</label>
                      <input id="ql_name" name="name" className="form-control" required placeholder="e.g. Farhad Hossain" autoComplete="name" />
                      <div className="invalid-feedback">Please enter your name.</div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="ql_email" className="form-label">Email</label>
                      <input id="ql_email" name="email" type="email" className="form-control" required placeholder="name@example.com" autoComplete="email" />
                      <div className="invalid-feedback">Please provide a valid email.</div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="ql_password" className="form-label">Password</label>
                      <div className="input-group">
                        <input id="ql_password" name="password" type={showPwdQuick ? 'text' : 'password'}
                               className="form-control" required minLength={6}
                               placeholder="At least 6 characters" autoComplete="new-password" />
                        <button type="button" className="btn btn-outline-secondary"
                                onClick={() => setShowPwdQuick(v => !v)}
                                aria-pressed={showPwdQuick}
                                aria-label={showPwdQuick ? 'Hide password' : 'Show password'}>
                          {showPwdQuick ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="invalid-feedback">Enter a password (min 6 chars).</div>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="ql_phone" className="form-label">Phone (optional)</label>
                      <input id="ql_phone" name="phone" type="tel" className="form-control"
                             placeholder="+61 4xx xxx xxx" pattern="^[0-9+ ()-]{6,}$"
                             autoComplete="tel" inputMode="tel" />
                      <div className="invalid-feedback">Please enter a valid phone number.</div>
                    </div>

                    <div className="col-12 d-flex gap-2">
                      <button className="btn btn-primary" type="submit">Continue to your dashboard</button>
                      <a className="btn btn-outline-secondary" href="index.html">Cancel</a>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="alert alert-info">
                Or create an account from <a className="alert-link" href="register.html">Register</a>.
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1080 }}>
          <div ref={toastRef} className="toast text-bg-success border-0" role="status" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">Welcome!</div>
              <button className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>
        </div>

        <ScrollToTop />
      </>
    )
  }

  // -------------------- LOGGED IN → Personalised panel + Edit --------------------
  const displayName = user.name || 'User'

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <h1 className="h3 mb-4">Welcome, {displayName}</h1>
        <div className="row g-4">
          {/* Summary card */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center"
                       style={{ width: 64, height: 64, background: 'var(--bs-secondary-bg)', fontWeight: 700 }}
                       aria-label={`Avatar for ${displayName}`}>
                    {displayName.split(' ').map(w => w[0]?.toUpperCase()).slice(0,2).join('') || 'U'}
                  </div>
                  <div>
                    <div className="fw-bold">{displayName}</div>
                    <div className="text-muted small">{user.email || '—'}</div>
                  </div>
                </div>
                <ul className="list-unstyled small mb-0">
                  <li><strong>Phone:</strong> {user.phone || '—'}</li>
                  <li><strong>Password:</strong> {user.password ? '••••••' : '—'}</li>
                </ul>
                <div className="d-flex gap-2 mt-3">
                  <a className="btn btn-outline-secondary" href="product.html">Start shopping</a>
                  <button className="btn btn-outline-danger" onClick={logout}>Logout</button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit card */}
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Update your details</h5>

                {/* ORDER: Name, Email, Password, Phone */}
                <form ref={formRef} className="row g-3 needs-validation" noValidate onSubmit={onSubmit}>
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      id="name" name="name" className="form-control"
                      defaultValue={user.name || ''} required placeholder="e.g. Farhad Hossain"
                      autoComplete="name"
                    />
                    <div className="invalid-feedback">Please enter your name.</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      id="email" name="email" type="email" className="form-control"
                      defaultValue={user.email || ''} required placeholder="name@example.com"
                      autoComplete="email"
                    />
                    <div className="invalid-feedback">Please provide a valid email.</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        id="password" name="password"
                        type={showPwdEdit ? 'text' : 'password'}
                        className="form-control"
                        defaultValue={user.password || ''}
                        minLength={6}
                        placeholder="Update password"
                        aria-describedby="pwdToggle"
                        autoComplete="new-password"
                      />
                      <button
                        id="pwdToggle"
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPwdEdit(v => !v)}
                        aria-pressed={showPwdEdit}
                        aria-label={showPwdEdit ? 'Hide password' : 'Show password'}
                      >
                        {showPwdEdit ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="form-text">Demo only: password is stored locally (not secure).</div>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">Phone (optional)</label>
                    <input
                      id="phone" name="phone" type="tel" className="form-control"
                      defaultValue={user.phone || ''} placeholder="+61 4xx xxx xxx"
                      pattern="^[0-9+ ()-]{6,}$" autoComplete="tel" inputMode="tel"
                    />
                    <div className="invalid-feedback">Please enter a valid phone number.</div>
                  </div>

                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? 'Saving…' : 'Save changes'}
                    </button>
                    <button className="btn btn-outline-secondary" onClick={onReset}>Reset</button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Toast */}
      <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1080 }}>
        <div ref={toastRef} className="toast text-bg-success border-0" role="status" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Saved.</div>
            <button className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard />)
