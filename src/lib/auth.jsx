import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// The site is public; private pages sit behind a Supabase login. Row-level security is the real lock:
// this gate only decides what to show. Without a session every private query returns nothing.

export function useSession() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return undefined
    let alive = true
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false) }
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => { alive = false; sub.subscription.unsubscribe() }
  }, [])

  return { session, loading }
}

export function signOut() {
  return supabase ? supabase.auth.signOut() : Promise.resolve()
}

const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--navy)' }
const card = { width: '100%', maxWidth: 420, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 16 }
const input = { width: '100%', fontSize: 18, padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.25)', color: 'var(--text)' }

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('That did not work. Check the email and password.')
    setBusy(false)
  }

  return (
    <div style={wrap}>
      <form onSubmit={submit} style={card}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Personal OS</h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', marginTop: 4 }}>Private pages. Sign in to continue.</p>
        </div>
        <input style={input} type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input style={input} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" style={{ fontSize: 16, color: '#f87171' }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ fontSize: 18, fontWeight: 700, padding: '14px 16px', borderRadius: 10, background: 'var(--accent)', color: '#fff', opacity: busy ? 0.6 : 1 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <a href="#/" style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center' }}>← Back to the public page</a>
      </form>
    </div>
  )
}

export function AuthGate({ children }) {
  const { session, loading } = useSession()
  if (!supabase) {
    return (
      <div style={wrap}><div style={card}>
        <h1 style={{ fontSize: 22 }}>Not connected</h1>
        <p style={{ fontSize: 16, color: 'var(--muted)' }}>This build has no Supabase settings, so private pages are off.</p>
        <a href="#/" style={{ fontSize: 15, color: 'var(--muted)' }}>← Back</a>
      </div></div>
    )
  }
  if (loading) return <div style={wrap}><p style={{ fontSize: 18, color: 'var(--muted)' }}>Loading…</p></div>
  if (!session) return <LoginForm />
  return children
}
