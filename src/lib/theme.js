const THEME_KEY = 'pref-theme'
export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) document.documentElement.setAttribute('data-bs-theme', saved)
}
export function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-bs-theme') || 'light'
  const next = cur === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', next)
  localStorage.setItem(THEME_KEY, next)
}
