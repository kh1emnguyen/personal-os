import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Risk Profile heuristic ─────────────────────────────── */
function getRiskProfile() {
  const now = new Date()
  const day = now.getDay()   // 0=Sun, 1=Mon … 6=Sat
  const hour = now.getHours()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[day]

  let activeLayer = 'COGNITIVE'
  let reason = ''
  let closedSystemRisk = 'LOW'
  let freshStartismRisk = 'low'

  if ((day === 1 || day === 2) && hour >= 21) {
    activeLayer = 'NEUROCHEMICAL'
    reason = 'Known alcohol window — Mon/Tue night. Cortisol awakening response blunted tomorrow.'
    closedSystemRisk = 'HIGH'
  } else if (day === 0) {
    activeLayer = 'COGNITIVE'
    reason = 'Sunday — new week staging. Fresh-startism spike. Performance requirements elevated.'
    freshStartismRisk = 'HIGH'
    closedSystemRisk = 'moderate'
  } else if (day === 4 || day === 6) {
    activeLayer = 'SOCIAL / RELATIONAL'
    reason = `${todayName} BMSS shift day — Care-Commerce Paradox risk. Relational energy deployed against indifference.`
    closedSystemRisk = 'LOW'
  } else if (day === 2 || day === 3) {
    activeLayer = 'IDENTITY'
    reason = `${todayName} — Lenexa accountability scaffold active. Closed-system risk low. Fresh-startism energy mid-week.`
    freshStartismRisk = 'moderate'
    closedSystemRisk = 'LOW'
  } else if (hour >= 6 && hour < 9) {
    activeLayer = 'COGNITIVE'
    reason = 'Morning window — middle-ground trap risk. Half-monitoring to-do, half-consuming.'
    closedSystemRisk = 'LOW'
  } else if (hour >= 20 && hour < 22) {
    activeLayer = 'NEUROCHEMICAL'
    reason = 'Post-work window — insipid anxiety zone. DMN firing. Low-demand stabilisation seeking.'
    closedSystemRisk = 'moderate'
  } else {
    activeLayer = 'COGNITIVE'
    reason = 'Standard operating window. Middle-ground trap the primary risk.'
    closedSystemRisk = 'LOW'
  }

  return {
    activeLayer,
    reason,
    closedSystemRisk,
    freshStartismRisk,
    dayLabel: now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }),
    timeLabel: now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
  }
}

/* ── Mirror Layer Data ───────────────────────────────────── */
const LAYERS = [
  {
    key: 'NEUROCHEMICAL',
    label: 'NEUROCHEMICAL',
    tag: 'most proximate',
    mechanisms: ['Elastic ratchet', 'GABA agonism', 'Cortisol blunting', 'DMN firing'],
    body: 'The mechanics of entry. Each low-effort decision lowers activation energy for the next. Sports video → infrastructure → Fern → Casino is not capitulation — it is a slope. At each step the next feels only marginally worse than the current one.',
    vaultQuote: '"By the time Casino is on, the day has already been categorised as a loss — and the brain follows its own accounting."',
    mantra: 'Remove the first rung. You don\'t fight the slope from the bottom.',
    source: 'Architecture of the Inevitable — I, X',
  },
  {
    key: 'COGNITIVE',
    label: 'COGNITIVE',
    tag: 'operating system',
    mechanisms: ['Fresh-startism', 'Middle Ground Trap', 'Performance staging'],
    body: 'Two mechanisms sustain the rut beyond its chemical trigger. Fresh-startism assigns disproportionate power to arbitrary temporal boundaries — the staged new chapter that ordinary Tuesdays cannot maintain. The Middle Ground Trap: neither rest nor work. Continuous low-grade cognitive distress — the worst of both, the restoration of neither.',
    vaultQuote: '"The fresh start hyperinflates performance. The rut collapses it. Both avoid the continuous, undramatic, accountability-to-nobody middle."',
    mantra: 'The day is already mine. One true thing or full rest. Nothing between is the trap.',
    source: 'Architecture of the Inevitable — III, XI',
  },
  {
    key: 'IDENTITY',
    label: 'IDENTITY',
    tag: 'structural wiring',
    mechanisms: ['Closed system', 'Inferiority-superiority binary', 'Accountability scaffold'],
    body: 'The rut concentrates in specific conditions: a night when social plans dissolve, a public holiday, a solo weekday where nothing is mandatory. The accountability scaffold — Lenexa, BMSS, Celiva, Kaspar, Isabel — keeps the closed system at bay. One bad Monday night trips a binary switch. This is why the rut feels total even when the precipitant is minor.',
    vaultQuote: '"It doesn\'t just cost a Tuesday, it temporarily dismantles the scaffolding managing the wound underneath."',
    mantra: 'A dolphin is not performing its membership in the ocean. It moves through it, leaves it, returns.',
    source: 'Architecture of the Inevitable — VI, XIII',
  },
  {
    key: 'SOCIAL / RELATIONAL',
    label: 'SOCIAL / RELATIONAL',
    tag: 'the fuel',
    mechanisms: ['Compliant persona', 'Care-Commerce Paradox', 'Projective care', 'Family amplifier'],
    body: 'The compliant persona formed to secure belonging by suppressing authentic impulses. The same mechanism that mirrored a crush\'s Spotify playlists now assembles a medtech founder / property owner / Substack writer identity. The rut is what happens when the performance of that identity temporarily becomes impossible.',
    vaultQuote: '"Being busy became my new status symbol. I worked so hard just to satisfy an old habit, dying hard." — Fish out of Water',
    mantra: 'Care that gets depleted against indifference is not available for the people who actually need it.',
    source: 'Architecture of the Inevitable — IV, VIII',
  },
  {
    key: 'EXISTENTIAL',
    label: 'EXISTENTIAL',
    tag: 'deepest root',
    mechanisms: ['Purposiveness as terror management', 'Internal task deficit', 'The tank insight'],
    body: 'The fixation on productivity is, at its honest bottom, motivated by the desire not to die — Becker\'s symbolic immortality project. Every goal by 30 is external and measurable. The internal tasks — becoming a person who can rest without guilt, who can be unobserved without collapsing, who can tolerate the undramatic Tuesday — have no due date, no metric.',
    vaultQuote: '"The rut is the psyche\'s recurring protest that the internal tasks are still deferred."',
    mantra: 'The goal isn\'t to be a land animal. It\'s to build a tank so you can carry your water with you.',
    source: 'Architecture of the Inevitable — V, XIV',
  },
]

/* ── Sanctuary Section ───────────────────────────────────── */
function Sanctuary() {
  const [mantras, setMantras] = useState([])
  const [week, setWeek] = useState('')
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const synthRef = useRef(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'anti-rut-content.json')
      .then(r => r.json())
      .then(d => { setMantras(d.mantras); setWeek(d.week) })
      .catch(() => {})

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    }
  }, [])

  function changeMantra(newIdx) {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setSpeaking(false)
    setFading(true)
    setTimeout(() => {
      setIdx(newIdx)
      setFading(false)
    }, 200)
  }

  function handlePlay() {
    if (!mantras[idx]) return
    if (!window.speechSynthesis) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utt = new SpeechSynthesisUtterance(mantras[idx].text)
    utt.rate = 0.85
    utt.pitch = 0.95
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
    setSpeaking(true)
  }

  const current = mantras[idx]
  const total = mantras.length

  return (
    <div className="anti-rut-sanctuary" style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px 72px',
      userSelect: 'none',
    }}>
      {week && (
        <p style={{ position: 'absolute', top: 64, right: 24, fontSize: 11, color: 'rgba(232,237,242,0.25)', letterSpacing: '0.06em' }}>
          week of {week}
        </p>
      )}

      {/* Mantra text */}
      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.2s ease',
        marginBottom: 52,
      }}>
        {current ? (
          <>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 28,
              lineHeight: 1.5,
              color: '#e8edf2',
              marginBottom: 28,
              fontWeight: 400,
            }}>
              "{current.text}"
            </p>
            <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.3)', letterSpacing: '0.06em' }}>
              source: {current.source}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'rgba(232,237,242,0.3)' }}>Loading…</p>
        )}
      </div>

      {/* Play button */}
      <button
        onClick={handlePlay}
        disabled={!current}
        style={{
          width: 64, height: 64, borderRadius: '50%',
          border: `1px solid ${speaking ? '#c8a96e' : 'rgba(200,169,110,0.5)'}`,
          background: speaking ? 'rgba(200,169,110,0.12)' : 'transparent',
          fontSize: 22,
          color: speaking ? '#c8a96e' : 'rgba(232,237,242,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 36,
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s, color 0.2s',
          boxShadow: speaking ? '0 0 24px rgba(200,169,110,0.2)' : 'none',
        }}
        onMouseEnter={e => { if (!speaking) e.currentTarget.style.boxShadow = '0 0 20px rgba(200,169,110,0.25)' }}
        onMouseLeave={e => { if (!speaking) e.currentTarget.style.boxShadow = 'none' }}
        title={speaking ? 'Stop' : 'Play'}
      >
        {speaking ? '■' : '▶'}
      </button>

      {/* Navigation */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 13, color: 'rgba(232,237,242,0.3)' }}>
          <button
            onClick={() => changeMantra((idx - 1 + total) % total)}
            style={{ fontSize: 18, color: 'rgba(232,237,242,0.2)', transition: 'color 0.15s', padding: '4px 8px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.2)'}
          >←</button>
          <span style={{ letterSpacing: '0.1em' }}>{idx + 1}/{total}</span>
          <button
            onClick={() => changeMantra((idx + 1) % total)}
            style={{ fontSize: 18, color: 'rgba(232,237,242,0.2)', transition: 'color 0.15s', padding: '4px 8px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.2)'}
          >→</button>
        </div>
      )}
    </div>
  )
}

/* ── Mirror Layer Panel ──────────────────────────────────── */
function LayerPanel({ layer, isActive, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || isActive)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isActive ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`,
      borderLeft: `3px solid ${isActive ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 8,
      overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#c8a96e' : '#e8edf2', flex: 1, letterSpacing: '0.05em' }}>
          {open ? '▼' : '▶'}  LAYER {LAYERS.indexOf(layer) + 1} — {layer.label}
        </span>
        <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.08em' }}>[{layer.tag}]</span>
        {isActive && (
          <span style={{ fontSize: 10, color: '#c8a96e', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em' }}>
            ● ACTIVE TODAY
          </span>
        )}
      </button>

      <div style={{
        maxHeight: open ? '800px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.25s ease',
      }}>
        <div style={{ padding: '0 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Mechanisms */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {layer.mechanisms.map(m => (
              <span key={m} style={{
                fontSize: 11, color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20, padding: '2px 10px', letterSpacing: '0.04em',
                fontFamily: 'var(--font-sans)', fontWeight: 500,
              }}>{m}</span>
            ))}
          </div>

          {/* Body */}
          <p style={{ fontSize: 13, color: 'rgba(232,237,242,0.75)', lineHeight: 1.7 }}>{layer.body}</p>

          {/* Vault quote */}
          <p style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: 16, color: 'rgba(232,237,242,0.6)',
            lineHeight: 1.6, borderLeft: '2px solid rgba(200,169,110,0.3)',
            paddingLeft: 14,
          }}>{layer.vaultQuote}</p>

          {/* Mantra */}
          <p style={{ fontSize: 14, color: '#c8a96e', fontFamily: 'var(--font-serif)', lineHeight: 1.5 }}>
            "{layer.mantra}"
          </p>

          {/* Source */}
          <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{layer.source}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Mirror Section ──────────────────────────────────────── */
function Mirror() {
  const profile = getRiskProfile()

  const riskColour = (r) => {
    const s = String(r).toUpperCase()
    if (s === 'HIGH') return '#f87171'
    if (s === 'moderate') return '#fbbf24'
    return '#4ade80'
  }

  return (
    <div className="anti-rut-mirror" style={{
      flex: 1, overflow: 'auto', padding: '20px 20px 80px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Today's Risk Profile */}
        <div style={{
          marginBottom: 24,
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            TODAY'S PROFILE · {profile.dayLabel}, {profile.timeLabel}
          </div>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }} />

          <div style={{ fontSize: 13, color: '#e8edf2', marginBottom: 8 }}>
            Most active layer: <span style={{ color: '#c8a96e', fontWeight: 600 }}>{profile.activeLayer}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>{profile.reason}</p>

          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <span>
              Closed-system risk:{' '}
              <span style={{ color: riskColour(profile.closedSystemRisk), fontWeight: 600 }}>
                {String(profile.closedSystemRisk).toUpperCase()}
              </span>
            </span>
            <span>
              Fresh-startism risk:{' '}
              <span style={{ color: riskColour(profile.freshStartismRisk), fontWeight: 600 }}>
                {String(profile.freshStartismRisk).toUpperCase()}
              </span>
            </span>
          </div>
        </div>

        {/* Layer Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LAYERS.map((layer, i) => (
            <LayerPanel
              key={layer.key}
              layer={layer}
              isActive={profile.activeLayer === layer.key}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Tab Bar ─────────────────────────────────────────────── */
function TabBar({ active, onChange }) {
  const tabs = [
    { key: 'sanctuary', label: 'SANCTUARY', icon: '◉' },
    { key: 'mirror',    label: 'MIRROR',    icon: '◎' },
  ]
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      height: 56,
      background: '#0a0808',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      zIndex: 100,
    }}>
      {tabs.map(t => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
              color: isActive ? '#c8a96e' : 'var(--muted)',
              borderTop: isActive ? '2px solid #c8a96e' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            <span style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/* ── Root ────────────────────────────────────────────────── */
export default function AntiRut() {
  const [tab, setTab] = useState('sanctuary')
  const navigate = useNavigate()
  const isMirror = tab === 'mirror'

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: isMirror ? 'var(--navy)' : '#0a0a0a',
    }}>
      {/* Top bar */}
      <div style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: isMirror ? 'rgba(13,27,42,0.95)' : '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: 'rgba(232,237,242,0.35)', letterSpacing: '0.05em', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.35)'}
        >← OS</button>
        <span style={{ fontSize: 12, color: 'rgba(232,237,242,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Anti-Rut — {isMirror ? 'Mirror' : 'Sanctuary'}
        </span>
        <span style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {tab === 'sanctuary' ? <Sanctuary /> : <Mirror />}
      </div>

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
