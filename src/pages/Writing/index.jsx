import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { AuthGate, signOut } from '../../lib/auth.jsx'
import { okUrl } from '../Briefing/model.js'

// /writing lists the blogs (rows in public.hub_links with kind = 'blog'); /writing/:slug is one page per blog.
// Each page redirects to its claude.ai feedback artifact. Titles and URLs live in Supabase, not in this public repo.
// This replaces the standalone mind-matter-writing site.

const nav = { fontSize: 16, color: 'var(--muted)', padding: '10px 4px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }
const shell = (children) => (
  <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 20px 64px', fontSize: 19, lineHeight: 1.6 }}>{children}</div>
  </div>
)

function useBlogs(slug) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let alive = true
    let q = supabase.from('hub_links').select('slug,title,url,note,sort').eq('kind', 'blog')
    if (slug) q = q.eq('slug', slug)
    q.order('sort', { ascending: true }).then(({ data, error: err }) => {
      if (!alive) return
      if (err) setError(true)
      else setRows(data || [])
    })
    return () => { alive = false }
  }, [slug])
  return { rows, error }
}

function Bar({ back, backLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <Link to={back} style={nav}>{backLabel}</Link>
      <button type="button" onClick={() => signOut()} style={nav}>Sign out</button>
    </div>
  )
}

function List() {
  const { rows, error } = useBlogs(null)
  return shell(
    <>
      <Bar back="/" backLabel="← OS" />
      <h1 style={{ fontSize: 30, margin: '20px 0 6px' }}>Writing</h1>
      <p style={{ color: 'var(--muted)', fontSize: 17, marginBottom: 18 }}>One page per blog. Each opens its feedback artifact on claude.ai.</p>
      {error && <p role="alert" style={{ color: '#f87171' }}>Could not load. Has migration 0004 been applied?</p>}
      {rows && !rows.length && <p style={{ color: 'var(--muted)' }}>No blogs listed yet. Add rows to hub_links with kind = 'blog'.</p>}
      {(rows || []).map((b) => (
        <Link key={b.slug} to={`/writing/${b.slug}`}
          style={{ display: 'block', padding: '18px 20px', marginBottom: 12, border: '1px solid var(--card-border)', borderTop: '2px solid #c8a96e', borderRadius: 14, background: 'var(--card-bg)' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{b.title}</div>
          {b.note && <div style={{ fontSize: 16, color: 'var(--muted)', marginTop: 4 }}>{b.note}</div>}
        </Link>
      ))}
    </>,
  )
}

function One({ slug }) {
  const { rows, error } = useBlogs(slug)
  const b = rows && rows[0]
  return shell(
    <>
      <Bar back="/writing" backLabel="← Writing" />
      {error && <p role="alert" style={{ color: '#f87171', marginTop: 24 }}>Could not load this blog.</p>}
      {rows && !b && <p style={{ color: 'var(--muted)', marginTop: 24 }}>No blog called “{slug}”.</p>}
      {b && (
        <>
          <p style={{ fontSize: 15, letterSpacing: '.16em', fontWeight: 700, color: '#c8a96e', marginTop: 24 }}>BLOG</p>
          <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: '4px 0 12px' }}>{b.title}</h1>
          {b.note && <p style={{ fontSize: 19, color: 'rgba(232,237,242,0.82)', marginBottom: 22 }}>{b.note}</p>}
          {okUrl(b.url) && (
            <a href={b.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', padding: '18px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 19, fontWeight: 700 }}>
              Open feedback in Claude ↗
            </a>
          )}
        </>
      )}
    </>,
  )
}

export default function WritingPage() {
  const { slug } = useParams()
  return <AuthGate>{slug ? <One slug={slug} /> : <List />}</AuthGate>
}
