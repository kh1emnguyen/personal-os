import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { AuthGate, signOut } from '../../lib/auth.jsx'
import { longDate } from './model.js'

// Every past briefing, newest first, grouped by month.

function monthKey(d) { return d.slice(0, 7) }
function monthLabel(k) {
  const [y, m] = k.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, 1, 12)).toLocaleDateString('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function Archive() {
  const [rows, setRows] = useState([])
  const [state, setState] = useState('loading')
  const [q, setQ] = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('briefings').select('date,edition,subject,mantra').order('date', { ascending: false }).limit(800)
      .then(({ data, error }) => {
        if (!alive) return
        if (error) { setState('error'); return }
        setRows(data || [])
        setState('ready')
      })
    return () => { alive = false }
  }, [])

  const needle = q.trim().toLowerCase()
  const shown = needle ? rows.filter((r) => `${r.date} ${r.mantra || ''} ${r.subject || ''}`.toLowerCase().includes(needle)) : rows
  const groups = []
  shown.forEach((r) => {
    const k = monthKey(r.date)
    const last = groups[groups.length - 1]
    if (last && last.k === k) last.rows.push(r)
    else groups.push({ k, rows: [r] })
  })
  const nav = { fontSize: 16, color: 'var(--muted)', padding: '10px 4px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 20px 64px', fontSize: 19, lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link to="/" style={nav}>← OS</Link>
          <div style={{ display: 'flex', gap: 14 }}>
            <Link to="/briefing" style={nav}>Latest</Link>
            <button type="button" onClick={() => signOut()} style={nav}>Sign out</button>
          </div>
        </div>
        <h1 style={{ fontSize: 30, margin: '20px 0 14px' }}>Briefing archive</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dates and mantras"
          style={{ width: '100%', fontSize: 18, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.25)', color: 'var(--text)', marginBottom: 12 }} />

        {state === 'loading' && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
        {state === 'error' && <p role="alert" style={{ color: '#f87171' }}>Could not load the archive. Has migration 0004 been applied?</p>}
        {state === 'ready' && !shown.length && <p style={{ color: 'var(--muted)' }}>{rows.length ? 'Nothing matches.' : 'No briefings yet. The first one appears after the next daily run publishes.'}</p>}

        {groups.map((g) => (
          <div key={g.k} style={{ marginTop: 22 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--accent)', marginBottom: 6 }}>{monthLabel(g.k)}</h2>
            {g.rows.map((r) => (
              <Link key={r.date} to={`/briefing/${r.date}`}
                style={{ display: 'block', padding: '14px 4px', minHeight: 56, borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ fontSize: 19, fontWeight: 600 }}>{longDate(r.date)}{r.edition === 'late' ? ' · late edition' : ''}</div>
                {r.mantra && <div style={{ fontSize: 16, color: 'var(--muted)', fontStyle: 'italic' }}>{r.mantra}</div>}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ArchivePage() {
  return <AuthGate><Archive /></AuthGate>
}
