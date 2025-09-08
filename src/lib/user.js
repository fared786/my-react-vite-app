const KEY = 'user'

// Convert any old shapes to { name, email, phone, password }
export function normalizeUser(u) {
  if (!u) return {}
  try { if (typeof u === 'string') u = JSON.parse(u) } catch { return {} }

  const name =
    (u.name || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ')).toString().trim()

  const email =
    (u.email || u.userEmail || u.username || '').toString().trim()

  const phone =
    (u.phone || u.mobile || u.contact || '').toString().trim()

  const password =
    (u.password || u.pwd || '').toString()

  // Only keep canonical fields
  return { name, email, phone, password }
}

export function migrateUserStorage() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return
    const nu = normalizeUser(JSON.parse(raw))
    localStorage.setItem(KEY, JSON.stringify(nu))
  } catch {}
}

export function getUser() {
  migrateUserStorage()
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function setUser(u) {
  const nu = normalizeUser(u)
  localStorage.setItem(KEY, JSON.stringify(nu))
  return nu
}

export function clearUser() {
  localStorage.removeItem(KEY)
}

export function isLoggedIn(u) {
  return !!(u && (u.name || u.email || u.phone))
}
