import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../bootstrap.js'
import '../styles/main.css'
import { initTheme } from '../lib/theme'
import Navbar from '../components/Navbar'
import ScrollToTop from '../components/ScrollToTop'
import * as bootstrap from 'bootstrap'

initTheme()

// ---------- Helpers ----------

// Simple password strength calculator (0..4)
function calcStrength(pwd = '') {
  let score = 0
  if (pwd.length >= 6) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(score, 4)
}

export default function Register() {
  const formRef = useRef(null)

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdStrength, setPwdStrength] = useState(0)
  const [errors, setErrors] = useState([]) // aria-live summary

  // Toast
  const toastRef = useRef(null)
  const toast = useRef(null)
  useEffect(() => {
    if (toastRef.current) {
      toast.current = new bootstrap.Toast(toastRef.current, { delay: 1200 })
    }
  }, [])
  const showToast = (msg) => {
    const body = toastRef.current?.querySelector('.toast-body')
    if (body) body.textContent = msg
    toast.current?.show()
  }

  // Minimal i18n hook: support ?lang=ar to demo RTL/readiness
  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get('lang') || 'en'
    document.documentElement.lang = lang
    document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr')
  }, [])

  const onSubmit = (e) => {
    e.preventDefault()
    const form = formRef.current

    const data = Object.fromEntries(new FormData(form).entries())
    const name = (data.name || '').trim()
    const email = (data.email || '').trim()
    const password = (data.password || '').trim()
    const confirm = (data.confirmPassword || '').trim()
    const phone = (data.phone || '').trim()

    // Collect readable errors for the aria-live summary (in addition to HTML5)
    const errs = []
    if (!name) errs.push('Name is required')
    if (!email) errs.push('Valid email is required')
    if (password.length < 6) errs.push('Password must be at least 6 characters')
    if (password !== confirm) errs.push('Passwords must match')
    if (phone && !/^[0-9+ ()-]{6,}$/.test(phone)) errs.push('Phone number looks invalid')

    // Optional: client-side "email already registered" check (demo of API-like validation)
    try {
      const existing = JSON.parse(localStorage.getItem('user') || '{}')
      if (existing?.email && existing.email.toLowerCase() === email.toLowerCase()) {
        errs.push('This email is already registered')
      }
    } catch (err) {
      console.warn('[register] could not parse localStorage.user:', err)  // treat as if no existing user; no extra action needed
 
    }

    setErrors(errs)

    // Field-level custom validity for better UX
    form.password.setCustomValidity(password.length < 6 ? 'Password should be at least 6 characters.' : '')
    form.confirmPassword.setCustomValidity(password !== confirm ? 'Passwords do not match.' : '')

    if (!form.checkValidity() || errs.length) {
      form.classList.add('was-validated')
      return
    }

    setSubmitting(true)

    // Save canonical user shape (matches Dashboard): { name, email, phone, password }
    const user = { name, email, phone, password }
    localStorage.setItem('user', JSON.stringify(user))

    // Flag for dashboard welcome toast
    sessionStorage.setItem('justRegistered', '1')

    showToast('Account created! Redirecting to your dashboard…')
    setTimeout(() => {
      try { window.location.assign('dashboard.html') } catch { window.location.href = 'dashboard.html' }
    }, 1300)
  }

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <h1 className="h3 mb-4">Create your account</h1>

        <form ref={formRef} className="needs-validation" noValidate onSubmit={onSubmit} aria-describedby="formErrors">
          {/* Screen-reader friendly, live error summary */}
          <div id="formErrors" className="visually-hidden" aria-live="polite">
            {errors.length ? `Please fix: ${errors.join('; ')}` : ''}
          </div>

          <div className="row g-3">
            {/* Name */}
            <div className="col-md-6">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name" name="name" className="form-control" required
                placeholder="e.g. Farhad Hossain" autoComplete="name"
              />
              <div className="invalid-feedback">Please enter your name.</div>
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email" name="email" type="email" className="form-control" required
                placeholder="name@example.com" autoComplete="email"
              />
              <div className="invalid-feedback">Please provide a valid email.</div>
            </div>

            {/* Password with Show/Hide + strength meter */}
            <div className="col-md-6">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-group">
                <input
                  id="password" name="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-control" required minLength={6}
                  placeholder="At least 6 characters" autoComplete="new-password"
                  aria-describedby="passwordToggle passwordStrengthHelp"
                  onInput={(e) => setPwdStrength(calcStrength(e.target.value))}
                />
                <button
                  id="passwordToggle" type="button" className="btn btn-outline-secondary"
                  onClick={() => setShowPwd(v => !v)} aria-pressed={showPwd}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Strength meter */}
              <div className="progress mt-2" aria-hidden={false}>
                <div
                  className={`progress-bar ${pwdStrength>=3?'bg-success':pwdStrength===2?'bg-warning':''}`}
                  role="progressbar"
                  style={{ width: `${(pwdStrength/4)*100}%` }}
                  aria-valuenow={pwdStrength} aria-valuemin={0} aria-valuemax={4}
                />
              </div>
              <div id="passwordStrengthHelp" className="form-text">
                {['Very weak','Weak','Fair','Good','Strong'][pwdStrength]}
              </div>

              <div className="invalid-feedback">Password must be at least 6 characters.</div>
            </div>

            {/* Confirm password with Show/Hide */}
            <div className="col-md-6">
              <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
              <div className="input-group">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control" required
                  placeholder="Re-enter password" autoComplete="new-password"
                  aria-describedby="confirmToggle"
                />
                <button
                  id="confirmToggle" type="button" className="btn btn-outline-secondary"
                  onClick={() => setShowConfirm(v => !v)} aria-pressed={showConfirm}
                  aria-label={showConfirm ? 'Hide confirmation password' : 'Show confirmation password'}
                >
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="invalid-feedback">Please re-enter the same password.</div>
            </div>

            {/* Phone */}
            <div className="col-md-6">
              <label htmlFor="phone" className="form-label">Phone (optional)</label>
              <input
                id="phone" name="phone" type="tel" className="form-control"
                placeholder="+61 4xx xxx xxx" pattern="^[0-9+ ()-]{6,}$"
                autoComplete="tel" inputMode="tel"
              />
              <div className="invalid-feedback">Please enter a valid phone number.</div>
            </div>
          </div>

          <p className="form-text mt-3">
            Demo only: your details are stored locally in this browser for the assignment. Do not use a real password.
          </p>

          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
            <a className="btn btn-outline-secondary" href="index.html">Cancel</a>
          </div>
        </form>
      </main>

      {/* Success toast */}
      <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1080 }}>
        <div ref={toastRef} className="toast align-items-center text-bg-success border-0" role="status" aria-live="assertive" aria-atomic="true">
          <div className="d-flex">
            <div className="toast-body">Your account has been created!</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Register />)
