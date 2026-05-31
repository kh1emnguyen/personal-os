import { useNavigate } from 'react-router-dom'

const cards = [
  {
    title: 'Stovetop',
    description: 'Burner matrix for active projects. Track momentum, heat level, and what\'s simmering. Real-time view of where energy is allocated across Lenexa, BMSS, Celiva, and writing.',
    accent: '#f97316',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/stovetop/',
    external: true,
  },
  {
    title: 'Health OS',
    description: 'Real-time habit baselines from Garmin + Strava. Sleep trends, body battery, activity log, and stress metrics synced at 6am daily.',
    accent: '#06b6d4',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/health-os/',
    external: true,
  },
  {
    title: 'Anti-Rut',
    description: 'Personalised mantra player + rut architecture mirror. Two modes: meditate (voice narration) and understand (five-layer psychological map).',
    accent: '#4ade80',
    status: 'building',
    href: '/anti-rut',
    external: false,
  },
  {
    title: 'Weekly Check-In',
    description: 'Sunday night form — movie watched, Garmin sleep data, food, training. A co-work agent turns your answers into vault notes by Monday morning.',
    accent: '#a78bfa',
    status: 'building',
    href: '/check-in',
    external: false,
  },
  {
    title: 'Pulse',
    description: 'Passive life capture. ~8 random check-ins a day (under a minute each) — tap habits, log a meal in plain English, jot one rotating note (media, movement, feelings, to-dos). Feeds Health OS and the background life-state agent.',
    accent: '#38bdf8',
    status: 'building',
    href: '/pulse',
    external: false,
  },
  {
    title: 'Writing Dashboard',
    description: 'Live editorial feedback loop. 7-section analysis (Progress, Quality, Quick Wins, Critique, Q&A, Sources). Supabase-backed feedback items.',
    accent: '#c8a96e',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/mind-matter-writing/',
    external: true,
  },
  {
    title: 'Fleet Tracker',
    description: 'Interactive visualization of the Personal OS agent fleet. Pan, zoom, and inspect 44 nodes with 90+ relationship edges. View agent dependencies, skill groups, inputs, and apps in a force-directed network layout.',
    accent: '#8b5cf6',
    status: 'live',
    href: '/fleet-tracker.html',
    external: false,
  },
  {
    title: 'Nawarries Hub',
    description: 'BMSS internal operations — Slow Movers console (~290 SKUs, margin-floor promo pricing) and Swing Trade Dashboard (4,362 SKUs vs Duncans). Arbitrage pricing, quotable discount column.',
    accent: '#e94560',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/nawarries-hub/',
    external: true,
  },
  {
    title: 'Lenexa Progress Tracker',
    description: 'Real-time record of contribution at Lenexa Medical — installations, Claude ops workflow, All Saints Home project, and what comes next.',
    accent: '#d4882a',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/lenexa-progress/',
    external: true,
  },
  {
    title: 'Fleet Tracker',
    description: 'Live network map of the full agent fleet — 44 nodes across data sources, skills, agents, and apps. Typed predecessor/successor edges (feeds · enables · triggers · passes · writes). Track build progress per node.',
    accent: '#6366f1',
    status: 'live',
    href: 'https://kh1emnguyen.github.io/fleet-tracker/',
    external: true,
  },
  {
    title: 'Financial OS',
    description: 'FY tax position (property + BMSS salary + Lenexa), depreciation schedule, $500/wk loan tracker, salary optimisation.',
    accent: '#fbbf24',
    status: 'soon',
    disabled: true,
  },
  {
    title: 'Longevity Tracker',
    description: 'Body comp log (target: 65 kg, ≤15% BF), macro tracking (130g protein fixed), sleep window, training scenario selector.',
    accent: '#4ade80',
    status: 'soon',
    disabled: true,
  },
  {
    title: 'Place Reviews',
    description: 'Personal curated venue notebook. Subjective writing, meal scores, atmosphere notes, revisit flags.',
    accent: '#c8a96e',
    status: 'soon',
    disabled: true,
  },
  {
    title: 'Property Admin',
    description: 'Strata, council rates, mortgage schedule, depreciation tables (DV, 40yr). Body corporate, insurance, water charges.',
    accent: '#fbbf24',
    status: 'soon',
    disabled: true,
  },
]

const stats = [
  { label: 'Live tools',       value: '7' },
  { label: 'Tools building',   value: '2' },
  { label: 'Repos on GitHub',  value: '7' },
  { label: 'Supabase vectors', value: '~3,500' },
]

function StatusBadge({ status }) {
  if (status === 'live') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80', fontWeight: 600 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
        animation: 'pulse-dot 1.8s ease-in-out infinite', display: 'inline-block',
      }} />
      Live
    </span>
  )
  if (status === 'building') return (
    <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>🔨 Building</span>
  )
  if (status === 'migrating') return (
    <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>Migrating</span>
  )
  return (
    <span style={{ fontSize: 12, color: 'rgba(232,237,242,0.35)', fontWeight: 500 }}>Coming Soon</span>
  )
}

export default function Home() {
  const navigate = useNavigate()

  function handleCardClick(card) {
    if (card.disabled) return
    if (card.external) {
      window.open(card.href, '_blank', 'noopener')
    } else {
      navigate(card.href)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0d1b2a, #1a2e44, #0f3460)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #e94560, #0f3460)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>⬡</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>Personal OS</h1>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '2px 9px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse-dot 1.8s ease-in-out infinite', display: 'inline-block' }} />
                Operational
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>kh1emnguyen.github.io — mission control</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', padding: '32px 24px', width: '100%' }}>

        {/* Card Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 18,
          marginBottom: 36,
        }}>
          {cards.map(card => (
            <div
              key={card.title}
              onClick={() => handleCardClick(card)}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 14,
                borderTop: `2px solid ${card.accent}`,
                padding: '20px 22px',
                cursor: card.disabled ? 'default' : 'pointer',
                opacity: card.disabled ? 0.55 : 1,
                pointerEvents: card.disabled ? 'none' : 'auto',
                transition: 'transform 0.18s, box-shadow 0.18s',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
              onMouseEnter={e => {
                if (!card.disabled) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${card.accent}22`
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' }}>{card.title}</h2>
                <StatusBadge status={card.status} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, flex: 1 }}>{card.description}</p>
              {!card.disabled && (
                <div style={{ fontSize: 12, color: card.accent, marginTop: 4, fontWeight: 500 }}>
                  {card.external ? 'Open ↗' : 'Open →'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 10,
              padding: '14px 18px',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--card-border)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
        fontSize: 12,
        color: 'var(--muted)',
      }}>
        <span>kh1emnguyen.github.io</span>
        <span style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 11,
        }}>Dispatched by Max · Khiem's AI agent</span>
      </footer>
    </div>
  )
}
