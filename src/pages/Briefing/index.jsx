import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { AuthGate, signOut } from '../../lib/auth.jsx'
import { sectionize, sectionFor, boldParts, okUrl, accentFor, longDate } from './model.js'

// Interactive daily briefing. One row per date in public.briefings (owner-only). Sections collapse and open;
// the email links straight to a section with ?s=<block id>, which opens it and scrolls to it.

const BODY = 19

function logEvent(date, blockId, kind, url) {
  // Return signal for the owner: which sections get opened, which links get followed. Never blocks the UI.
  if (!supabase) return
  supabase.from('briefing_events').insert({ date, block_id: blockId || null, kind, url: url || null }).then(() => {}, () => {})
}

function Ext({ href, date, id, children, style }) {
  if (!okUrl(href)) return <>{children}</>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => logEvent(date, id, 'link', href)}
       style={{ color: 'var(--accent)', textDecoration: 'underline', textUnderlineOffset: 3, ...style }}>
      {children}
    </a>
  )
}

function Bold({ text, bold }) {
  return boldParts(text, bold).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>))
}

function Line({ l, first, date, id, accent }) {
  const inner = (
    <>
      <Bold text={l.text} bold={l.bold} />
      {okUrl(l.url) && <> <Ext href={l.url} date={date} id={id}>{l.urlLabel || 'open'} ↗</Ext></>}
    </>
  )
  const base = { fontSize: BODY, lineHeight: 1.6, marginTop: first ? 0 : 11 }
  if (l.kind === 'quote') return <blockquote style={{ ...base, fontStyle: 'italic', fontSize: 17.5, paddingLeft: 14, borderLeft: '3px solid rgba(255,255,255,0.2)' }}>{inner}</blockquote>
  if (l.kind === 'note') return <p style={{ ...base, fontSize: 16 }}><em style={{ color: accent }}>{l.label || 'my note:'}</em> {inner}</p>
  if (l.kind === 'small') return <p style={{ ...base, fontSize: 15.5, color: 'var(--muted)' }}>{inner}</p>
  return <p style={base}>{inner}</p>
}

function Block({ item, date, highlight }) {
  const { b, id } = item
  switch (b.type) {
    case 'panel': {
      const accent = accentFor(b.stream)
      return (
        <section id={id} style={{
          borderLeft: `5px solid ${accent}`, background: `${accent}1f`, padding: '16px 20px', margin: '12px 0',
          borderRadius: '0 10px 10px 0', scrollMarginTop: 16,
          boxShadow: highlight ? `0 0 0 2px ${accent}` : 'none',
        }}>
          {b.label && <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '.09em', color: accent, marginBottom: 8 }}>{b.label}</div>}
          {b.headline && (
            <h3 style={{ fontSize: 21, lineHeight: 1.38, fontWeight: 700, marginBottom: 8 }}>
              <Ext href={b.url} date={date} id={id} style={{ color: 'var(--text)' }}>{b.headline}</Ext>
            </h3>
          )}
          {(b.lines || []).map((l, i) => <Line key={i} l={l} first={i === 0 && !b.headline} date={date} id={id} accent={accent} />)}
          {(b.rows || []).map((r, i) => (
            <p key={i} style={{ fontSize: 17.5, lineHeight: 1.5, marginTop: 9 }}>
              <strong style={{ color: accent }}>{r.when}</strong> · {okUrl(r.url) ? <Ext href={r.url} date={date} id={id}>{r.text} ↗</Ext> : r.text}
              {r.amount && <span style={{ color: 'var(--muted)' }}> {r.amount}</span>}
            </p>
          ))}
          {b.cite && (
            <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 12 }}>
              — {b.cite.title}{b.cite.author ? ` · ${b.cite.author}` : ''}{okUrl(b.cite.url) && <> <Ext href={b.cite.url} date={date} id={id}>open ↗</Ext></>}
            </p>
          )}
        </section>
      )
    }
    case 'para': return <p id={id} style={{ fontSize: b.size ? Math.round(b.size * 1.22) : 17, lineHeight: 1.55, margin: '0 0 12px', color: 'rgba(232,237,242,0.82)' }}>{b.text}</p>
    case 'connective': return <p id={id} style={{ textAlign: 'center', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', margin: '18px 0 6px' }}>— {b.text} —</p>
    case 'blurb': return <p id={id} style={{ fontSize: 15.5, lineHeight: 1.55, color: 'var(--muted)', paddingLeft: 18, borderLeft: '1px dotted rgba(255,255,255,0.25)', margin: '7px 0 4px' }}><em>{b.label || 'the thread it pulls:'}</em> {b.text}</p>
    case 'source': return <p id={id} style={{ fontSize: 14.5, margin: '4px 0 14px', paddingLeft: 18 }}>{okUrl(b.url) ? <Ext href={b.url} date={date} id={id}>▣ {b.label} ↗</Ext> : b.label}</p>
    case 'hr': return <hr id={id} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '26px 0' }} />
    case 'footer': return <p id={id} style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--muted)', margin: '18px 0 0' }}>{b.text}</p>
    default: return null
  }
}

function Section({ s, open, onToggle, date, target }) {
  const panels = s.items.filter((x) => x.b.type === 'panel').length
  if (!s.title) {
    return <div style={{ marginBottom: 8 }}>{s.items.map((x) => <Block key={x.id} item={x} date={date} highlight={x.id === target} />)}</div>
  }
  return (
    <div id={s.id} style={{ margin: '14px 0', border: '1px solid var(--card-border)', borderRadius: 14, background: 'var(--card-bg)', scrollMarginTop: 16 }}>
      <button type="button" onClick={onToggle} aria-expanded={open}
        style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', minHeight: 64 }}>
        <span style={{ fontSize: 22, color: 'var(--accent)', width: 20 }}>{open ? '▾' : '▸'}</span>
        <span style={{ flex: 1, fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.25, color: 'var(--text)' }}>{s.title}</span>
        {panels > 0 && <span style={{ fontSize: 15, color: 'var(--muted)' }}>{panels} {panels === 1 ? 'item' : 'items'}</span>}
      </button>
      {open && <div style={{ padding: '0 22px 20px' }}>{s.items.map((x) => <Block key={x.id} item={x} date={date} highlight={x.id === target} />)}</div>}
    </div>
  )
}

function Briefing() {
  const { date: dateParam } = useParams()
  const [search] = useSearchParams()
  const target = search.get('s')
  const [row, setRow] = useState(null)
  const [neighbours, setNeighbours] = useState({ prev: null, next: null })
  const [state, setState] = useState('loading')
  const [open, setOpen] = useState(new Set())

  useEffect(() => {
    let alive = true
    async function load() {
      setState('loading')
      let q = supabase.from('briefings').select('*')
      q = dateParam ? q.eq('date', dateParam) : q.order('date', { ascending: false }).limit(1)
      const { data, error } = await q.maybeSingle()
      if (!alive) return
      if (error) { setState('error'); return }
      if (!data) { setState('empty'); return }
      setRow(data)
      setState('ready')
      const [p, n] = await Promise.all([
        supabase.from('briefings').select('date').lt('date', data.date).order('date', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('briefings').select('date').gt('date', data.date).order('date', { ascending: true }).limit(1).maybeSingle(),
      ])
      if (alive) setNeighbours({ prev: p.data ? p.data.date : null, next: n.data ? n.data.date : null })
      logEvent(data.date, target, 'open')
    }
    load()
    return () => { alive = false }
  }, [dateParam, target])

  const sections = useMemo(() => (row ? sectionize(row.brief.blocks) : []), [row])

  // Open the targeted section (or the first titled one), then scroll to the target.
  useEffect(() => {
    if (state !== 'ready') return
    const hit = sectionFor(sections, target)
    const first = sections.find((s) => s.title)
    setOpen(new Set([(hit || first || { id: '' }).id]))
    if (target) setTimeout(() => { const el = document.getElementById(target); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 80)
  }, [state, sections, target])

  const titled = sections.filter((s) => s.title)
  const allOpen = titled.length > 0 && titled.every((s) => open.has(s.id))
  const toggle = (id) => setOpen((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const nav = { fontSize: 16, color: 'var(--muted)', padding: '10px 4px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 20px 64px', fontSize: BODY, lineHeight: 1.6 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <Link to="/" style={nav}>← OS</Link>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/briefings" style={nav}>Archive</Link>
            <button type="button" onClick={() => signOut()} style={nav}>Sign out</button>
          </div>
        </div>

        {state === 'loading' && <p style={{ color: 'var(--muted)', marginTop: 32 }}>Loading…</p>}
        {state === 'error' && <p role="alert" style={{ color: '#f87171', marginTop: 32 }}>Could not load the briefing. If this is the first run, the 0004 migration has not been applied yet.</p>}
        {state === 'empty' && <p style={{ color: 'var(--muted)', marginTop: 32 }}>{dateParam ? `No briefing for ${dateParam}.` : 'No briefings yet.'} <Link to="/briefings" style={{ color: 'var(--accent)' }}>See the archive</Link></p>}

        {state === 'ready' && row && (
          <>
            <p style={{ fontSize: 15, letterSpacing: '.16em', fontWeight: 700, color: 'var(--accent)', marginTop: 24 }}>DAILY BRIEF{row.edition === 'late' ? ' · LATE EDITION' : ''}</p>
            <h1 style={{ fontSize: 30, lineHeight: 1.2, fontWeight: 700, margin: '4px 0 10px' }}>{longDate(row.date)}</h1>
            {row.mantra && <p style={{ fontSize: 22, lineHeight: 1.45, fontStyle: 'italic', margin: '8px 0 18px' }}>{row.mantra}</p>}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {neighbours.prev ? <Link to={`/briefing/${neighbours.prev}`} style={{ ...nav, border: '1px solid var(--card-border)', borderRadius: 10, padding: '10px 14px' }}>← {neighbours.prev}</Link> : null}
                {neighbours.next ? <Link to={`/briefing/${neighbours.next}`} style={{ ...nav, border: '1px solid var(--card-border)', borderRadius: 10, padding: '10px 14px' }}>{neighbours.next} →</Link> : null}
              </div>
              <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(titled.map((s) => s.id)))}
                style={{ ...nav, color: 'var(--accent)', fontWeight: 600 }}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
            </div>

            {sections.map((s) => <Section key={s.id} s={s} open={open.has(s.id)} onToggle={() => { toggle(s.id); logEvent(row.date, s.id, 'toggle') }} date={row.date} target={target} />)}
          </>
        )}
      </div>
    </div>
  )
}

export default function BriefingPage() {
  return <AuthGate><Briefing /></AuthGate>
}
