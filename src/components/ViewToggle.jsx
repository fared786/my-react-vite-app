import React from 'react'

export default function ViewToggle({ view, setView }) {
  return (
    <div className="btn-group view-switch" role="group" aria-label="View toggle">
      <button type="button" className={`btn btn-outline-secondary ${view==='grid'?'active':''}`} onClick={() => setView('grid')} aria-pressed={view==='grid'} title="Grid view">▦</button>
      <button type="button" className={`btn btn-outline-secondary ${view==='list'?'active':''}`} onClick={() => setView('list')} aria-pressed={view==='list'} title="List view">≡</button>
    </div>
  )
}
