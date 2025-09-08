import React, { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      id="scrollTopBtn"
      className={`btn btn-primary ${show ? 'd-inline-flex' : 'd-none'}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >↑</button>
  )
}
