import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

const ACCENT = '#38bdf8'
const TICK_MS = 15000

// ---- helpers ---------------------------------------------------------------

function todayKey() {
  return new Date().toISOString().split('T')[0]
}

function parseHM(hm) {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function fmtTime(epoch) {
  return new Date(epoch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Spread pings_per_day across the window in equal buckets, randomised within
// each bucket, enforcing min_gap. Random by design — capture must not be
// predictable enough to pre-plan around.
function generateSchedule(config) {
  const startM = parseHM(config.window_start)
  const endM = parseHM(config.window_end)
  const n = Math.max(1, config.pings_per_day)
  const bucket = (endM - startM) / n
  const mins = []
  for (let i = 0; i < n; i++) {
    const lo = startM + i * bucket
    const hi = startM + (i + 1) * bucket
    let m = lo + Math.random() * (hi - lo)
    if (mins.length && m - mins[mins.length - 1] < config.min_gap_minutes) {
      m = mins[mins.length - 1] + config.min_gap_minutes
    }
    mins.push(Math.min(m, endM))
  }
  return mins.map((m, idx) => {
    const d = new Date()
    d.setHours(0, Math.round(m), 0, 0)
    return { id: `${todayKey()}-${idx}`, at: d.getTime(), fired: false, answered: false }
  })
}

function loadState() {
  try {
    const raw = localStorage.getItem(`pulse-v1-${todayKey()}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    localStorage.setItem(`pulse-v1-${todayKey()}`, JSON.stringify(state))
  } catch {
    /* storage unavailable — in-memory state still works for this session */
  }
}

// ---- component -------------------------------------------------------------

export default function Pulse() {
  const navigate = useNavigate()
  const [config, setConfig] = useState(null)
  const [armed, setArmed] = useState(false)
  const [schedule, setSchedule] = useState([])
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  )
  const [pending, setPending] = useState(null) // the ping awaiting an answer
  const scheduleRef = useRef(schedule)
  scheduleRef.current = schedule

  // Load config + restore today's state.
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}pulse-config.json`)
      .then((r) => r.json())
      .then((cfg) => {
        setConfig(cfg)
        const saved = loadState()
        if (saved) {
          setArmed(saved.armed)
          setSchedule(saved.schedule)
        }
      })
      .catch(() => setConfig({ error: true }))
  }, [])

  // Register the service worker (PWA + notification relay).
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(() => {})
    }
  }, [])

  const fireNotification = useCallback(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const opts = {
      body: 'Tap to log — two seconds, then back to work.',
      tag: 'pulse-ping',
      renotify: true,
      icon: `${import.meta.env.BASE_URL}favicon.svg`,
    }
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready
        .then((reg) => reg.showNotification('Pulse check-in', opts))
        .catch(() => new Notification('Pulse check-in', opts))
    } else {
      new Notification('Pulse check-in', opts)
    }
  }, [])

  // The tick loop: every TICK_MS, fire any ping whose time has passed.
  // Interval-poll rather than per-ping setTimeout so it survives background
  // tab throttling and navigation away from this page.
  useEffect(() => {
    if (!armed) return
    function tick() {
      const now = Date.now()
      const sched = scheduleRef.current
      const due = sched.find((p) => !p.fired && p.at <= now)
      if (due) {
        const next = sched.map((p) => (p.id === due.id ? { ...p, fired: true } : p))
        setSchedule(next)
        saveState({ armed: true, schedule: next })
        fireNotification()
        setPending((cur) => cur || due)
      }
    }
    tick()
    const iv = setInterval(tick, TICK_MS)
    return () => clearInterval(iv)
  }, [armed, fireNotification])

  // A tapped notification (from the SW) just needs the tab focused — the tick
  // loop already surfaced the form. Nothing else to do.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMsg = (e) => {
      if (e.data?.type === 'pulse-open') window.focus()
    }
    navigator.serviceWorker.addEventListener('message', onMsg)
    return () => navigator.serviceWorker.removeEventListener('message', onMsg)
  }, [])

  async function requestPermission() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  function arm() {
    const sched = generateSchedule(config)
    setSchedule(sched)
    setArmed(true)
    saveState({ armed: true, schedule: sched })
  }

  function disarm() {
    setArmed(false)
    setPending(null)
    saveState({ armed: false, schedule })
  }

  function markAnswered(ping) {
    const next = scheduleRef.current.map((p) =>
      p.id === ping.id ? { ...p, answered: true } : p,
    )
    setSchedule(next)
    saveState({ armed, schedule: next })
    setPending(null)
  }

  // Write the ping outcome to Supabase. Answered → responses object; skipped →
  // null responses so the pulse-updater agent can count it as a miss.
  async function recordPing(ping, responses) {
    if (supabase) {
      await supabase.from('habit_pings').insert({
        pinged_at: new Date(ping.at).toISOString(),
        answered_at: responses ? new Date().toISOString() : null,
        responses: responses || null,
        window_date: todayKey(),
      })
    }
    markAnswered(ping)
  }

  if (!config) return <Shell navigate={navigate}><Centered>Loading…</Centered></Shell>
  if (config.error) {
    return (
      <Shell navigate={navigate}>
        <Centered>Could not load pulse-config.json.</Centered>
      </Shell>
    )
  }

  const now = Date.now()
  const upcoming = schedule.filter((p) => !p.fired).length
  const nextPing = schedule.filter((p) => !p.fired).sort((a, b) => a.at - b.at)[0]

  return (
    <Shell navigate={navigate}>
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto', padding: '28px 24px 60px' }}>

        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
          Pulse fires {config.pings_per_day} random check-ins between{' '}
          {config.window_start} and {config.window_end}. Each one is a two-second
          tap — log it and return to deep work. Capture happens inside the flow,
          not at the edges of the day.
        </p>

        {/* Permission */}
        {permission !== 'granted' && permission !== 'unsupported' && (
          <Banner accent={ACCENT}>
            <span>Desktop notifications are off — pings will only show while this tab is open.</span>
            <button onClick={requestPermission} style={btnSmall(ACCENT)}>Enable</button>
          </Banner>
        )}
        {permission === 'unsupported' && (
          <Banner accent="#f87171">
            <span>This browser has no Notification API. Keep the tab open to receive pings.</span>
          </Banner>
        )}

        {/* Arm / disarm */}
        <div style={{
          background: 'var(--card-bg)', border: '1px solid var(--card-border)',
          borderRadius: 14, borderTop: `2px solid ${ACCENT}`, padding: '20px 22px',
          marginBottom: 22,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                {armed ? 'Session armed' : 'Session off'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {armed
                  ? (upcoming > 0
                      ? `${upcoming} ping${upcoming > 1 ? 's' : ''} left · next ~${nextPing ? fmtTime(nextPing.at) : '—'}`
                      : 'All pings done for today.')
                  : 'Arm at the start of your deep-work block.'}
              </div>
            </div>
            <button
              onClick={armed ? disarm : arm}
              style={{
                background: armed ? 'rgba(255,255,255,0.06)' : ACCENT,
                color: armed ? 'var(--muted)' : '#0a0a0a',
                border: armed ? '1px solid var(--card-border)' : 'none',
                borderRadius: 9, padding: '10px 20px', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {armed ? 'Stop' : 'Arm session'}
            </button>
          </div>
        </div>

        {/* Schedule */}
        {schedule.length > 0 && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Today's pings
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {schedule.map((p) => {
                const state = p.answered ? 'logged' : p.fired ? 'missed' : (p.at <= now ? 'due' : 'upcoming')
                const color = { logged: '#4ade80', missed: '#f87171', due: ACCENT, upcoming: 'var(--muted)' }[state]
                return (
                  <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    borderRadius: 9, padding: '11px 15px', fontSize: 13,
                  }}>
                    <span style={{ color: 'var(--text)' }}>{fmtTime(p.at)}</span>
                    <span style={{ color, fontWeight: 600, fontSize: 12 }}>
                      {state === 'logged' ? '✓ logged'
                        : state === 'missed' ? 'missed'
                        : state === 'due' ? 'due now'
                        : 'upcoming'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {pending && (
        <PingModal
          ping={pending}
          config={config}
          onSave={(responses) => recordPing(pending, responses)}
          onSkip={() => recordPing(pending, null)}
        />
      )}
    </Shell>
  )
}

// ---- micro-form modal ------------------------------------------------------

function PingModal({ ping, config, onSave, onSkip }) {
  const [picked, setPicked] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(config.auto_dismiss_seconds)

  useEffect(() => {
    if (secondsLeft <= 0) { onSkip(); return }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, onSkip])

  function toggle(id) {
    setPicked((p) => ({ ...p, [id]: !p[id] }))
  }

  function save() {
    const responses = {}
    for (const q of config.questions) responses[q.id] = !!picked[q.id]
    onSave(responses)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(8,12,20,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 380, background: '#0f1d30',
        border: `1px solid ${ACCENT}44`, borderRadius: 16,
        padding: '24px 24px 20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Quick pulse</h2>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{secondsLeft}s</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
          Tap what's true. Anything untapped is logged as no.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
          {config.questions.map((q) => {
            const on = !!picked[q.id]
            return (
              <button
                key={q.id}
                onClick={() => toggle(q.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  background: on ? `${ACCENT}1f` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${on ? ACCENT : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: 10, padding: '13px 15px', cursor: 'pointer',
                  transition: 'background 0.12s, border-color 0.12s',
                }}
              >
                <span style={{ fontSize: 18 }}>{q.icon}</span>
                <span style={{ fontSize: 14, color: 'var(--text)', flex: 1, textAlign: 'left' }}>{q.label}</span>
                <span style={{ fontSize: 13, color: on ? ACCENT : 'var(--muted)', fontWeight: 600 }}>
                  {on ? 'yes' : 'no'}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <button onClick={onSkip} style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9,
            padding: '11px 0', fontSize: 13, color: 'var(--muted)', cursor: 'pointer',
          }}>Skip</button>
          <button onClick={save} style={{
            flex: 2, background: ACCENT, color: '#0a0a0a', borderRadius: 9,
            padding: '11px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>Log it</button>
        </div>
      </div>
    </div>
  )
}

// ---- layout bits -----------------------------------------------------------

function Shell({ children, navigate }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(135deg, #0d1b2a, #1a2e44)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: 'rgba(232,237,242,0.4)', letterSpacing: '0.05em' }}
        >← OS</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e8edf2' }}>Pulse</span>
          <span style={{ fontSize: 11, color: ACCENT, background: `${ACCENT}18`, border: `1px solid ${ACCENT}33`, borderRadius: 20, padding: '2px 8px' }}>
            🔨 Building
          </span>
        </div>
        <span style={{ width: 32 }} />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  )
}

function Centered({ children }) {
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
      {children}
    </div>
  )
}

function Banner({ children, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      background: `${accent}12`, border: `1px solid ${accent}33`, borderRadius: 10,
      padding: '11px 14px', marginBottom: 16, fontSize: 12.5, color: 'var(--text)',
    }}>
      {children}
    </div>
  )
}

function btnSmall(accent) {
  return {
    background: accent, color: '#0a0a0a', borderRadius: 7,
    padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
  }
}
