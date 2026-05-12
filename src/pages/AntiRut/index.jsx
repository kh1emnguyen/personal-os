import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Risk Profile ───────────────────────────────────────── */
function getRiskProfile() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  let activeLayer = 'COGNITIVE'
  let headline = ''
  let detail = ''
  let risks = []

  if ((day === 1 || day === 2) && hour >= 21) {
    activeLayer = 'NEUROCHEMICAL'
    headline = 'Known alcohol window'
    detail = 'Monday/Tuesday night. If you drink tonight, tomorrow morning will be harder than it looks right now. The cortisol awakening response will be blunted. The default mode network will fire. "Warming up with a few videos" will not prime your executive circuits — it will deepen the trench.'
    risks = ['Elastic ratchet risk: HIGH', 'Fresh-startism tomorrow: LIKELY', 'Closed system risk: HIGH']
  } else if (day === 0) {
    activeLayer = 'COGNITIVE'
    headline = 'Sunday — fresh-startism spike'
    detail = 'The new week energy is real but fragile. Your clean slates require performance — sorting clothes, social reintegration, staging the new chapter. Staged things require maintenance that ordinary Tuesdays do not provide.'
    risks = ['Fresh-startism risk: HIGH', 'Middle ground trap: moderate', 'Closed system risk: LOW']
  } else if (day === 4 || day === 6) {
    activeLayer = 'SOCIAL / RELATIONAL'
    headline = `${dayNames[day]} — BMSS shift day`
    detail = 'Care-Commerce Paradox risk. Authentic relational energy sent into a context that cannot absorb it. Care that gets depleted against indifference is not available for the people who actually need it. Transaction is transaction — it doesn\'t require full relational investment.'
    risks = ['Care-Commerce Paradox: ACTIVE', 'Depletion risk: moderate', 'Closed system risk: LOW']
  } else if (day === 2 || day === 3) {
    activeLayer = 'IDENTITY'
    headline = `${dayNames[day]} — Lenexa scaffold active`
    detail = 'Accountability is external and working. The closed system risk is low. But mid-week is also when fresh-startism energy shows up as restless urgency — the desire to declare momentum rather than just have it.'
    risks = ['Closed system risk: LOW', 'Fresh-startism energy: moderate', 'Identity performance: watch for it']
  } else if (hour >= 6 && hour < 9) {
    activeLayer = 'COGNITIVE'
    headline = 'Morning window'
    detail = 'The middle ground trap is most likely here — half-monitoring the to-do list, half-consuming content, fully restoring neither. Morning architecture matters: out by a specific time, first task set the night before, not after waking.'
    risks = ['Middle ground trap: HIGH', 'Decision paralysis: moderate', 'Closed system risk: LOW']
  } else if (hour >= 20 && hour < 22) {
    activeLayer = 'NEUROCHEMICAL'
    headline = 'Insipid anxiety window'
    detail = 'Post-work, pre-sleep. The 20-minute paralysis at the rest-work boundary. Phone scrolling short-circuits the negotiation and turns a 20-minute processing delay into a 90-minute void. The anxiety is not a bug — it\'s doing something. Let it negotiate.'
    risks = ['Decision paralysis: HIGH', 'Scrolling trap: HIGH', 'Neurochemical risk: moderate']
  } else {
    activeLayer = 'COGNITIVE'
    headline = 'Standard window'
    detail = 'No elevated risk flags. Middle ground trap remains the baseline. One true thing or full rest.'
    risks = ['Middle ground trap: moderate', 'All other risks: LOW']
  }

  return {
    activeLayer, headline, detail, risks,
    dayLabel: now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }),
    timeLabel: now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
  }
}

/* ── Mirror Layer Data ───────────────────────────────────── */
const LAYERS = [
  {
    key: 'NEUROCHEMICAL',
    label: 'Layer 1 — Your Brain Chemistry',
    shortLabel: 'NEUROCHEMICAL',
    colour: '#f87171',
    summary: 'Why Monday drinks make Tuesday feel impossible — and why "just a few videos" isn\'t laziness.',
    nodes: [
      {
        title: 'What alcohol actually does overnight',
        body: 'Alcohol is a GABA agonist — it sedates your brain, then demands a dopamine hit before letting you sleep. Sleep gets disrupted. Your cortisol (the "get up and go" hormone) barely peaks in the morning. You wake up dysregulated before the day has even started.',
        source: 'Architecture of the Inevitable — I',
      },
      {
        title: 'The Elastic Ratchet',
        body: 'Sports video → YouTube rabbit hole → Casino. This isn\'t a sudden collapse. It\'s a slope. Each step feels only marginally worse than the previous one. By the time Casino is on, the day has already been categorised as a loss — and the brain follows its own accounting: if today is spent, spend it well.',
        source: 'Architecture of the Inevitable — II',
      },
      {
        title: '"Warming up with a few videos" is not laziness',
        body: 'After a disrupted night, your brain attempts to stabilise through low-demand dopaminergic input. That\'s what the sports video is. The problem: this strategy never fully primes the executive circuits. It only deepens the trench.',
        source: 'Architecture of the Inevitable — I',
      },
      {
        title: 'The dopamine threshold problem',
        body: 'The more dopamine hits you take (phone, videos, sugar), the higher the threshold gets for the next one to feel satisfying. This is why the afternoon scrolling eventually feels hollow — but you keep going anyway, chasing a level of stimulation the circuit can no longer reach.',
        source: 'Ruts = Ritualized Addictions — 31.12.25',
      },
      {
        title: 'Remove the first rung',
        body: 'The practical fix isn\'t fighting the slope at the bottom — it\'s removing the first rung at the top. The 9am sports video is the first rung. Not Casino. You don\'t try to stop at Casino. You remove the reason the video goes on in the first place.',
        source: 'Architecture of the Inevitable — XV',
      },
      {
        title: 'The insipid anxiety window (8–10pm)',
        body: 'Post-work, pre-sleep: this is when the decision paralysis is worst. The 20-minute window between rest and work where neither happens and phone scrolling fills the void. The anxiety isn\'t a problem — it\'s your brain negotiating. Scrolling short-circuits that negotiation.',
        source: 'Insipid Anxiety — 03.05.26',
      },
    ],
  },
  {
    key: 'COGNITIVE',
    label: 'Layer 2 — Your Thinking Patterns',
    shortLabel: 'COGNITIVE',
    colour: '#60a5fa',
    summary: 'The two mental habits that keep the cycle going long after the chemistry has settled.',
    nodes: [
      {
        title: 'Fresh-startism',
        body: 'The belief that a new week, a birthday, a clean Monday will be different. These spikes are real — they genuinely do boost motivation short-term. The problem: they\'re exactly as durable as the conditions that produced the rut, which is not very. Your clean slates require performance: social reintegration, sorting clothes, staging the new chapter. Performances need maintenance ordinary Tuesdays don\'t provide.',
        source: 'Architecture of the Inevitable — III',
      },
      {
        title: 'Why your clean slates don\'t last',
        body: 'The March 23 entry: "I\'ve completed all the tasks I\'ve meant to complete for this transition... I don\'t expect it to run indefinitely." You knew, in the act of declaring the clean slate, that it was temporary. Which means the clean slate is not a genuine recovery mechanism — it\'s a psychological inflection point that produces the feeling of recovery without the structural conditions for it.',
        source: 'Architecture of the Inevitable — III',
      },
      {
        title: 'The Middle Ground Trap',
        body: 'Neither rest nor work. Your brain half-monitors the to-do list, half-watches content, fully satisfies neither. Genuine rest requires disengagement from goal-relevant cognition. Genuine work requires directed engagement. The middle state is continuous low-grade cognitive distress — the worst of both, the restoration of neither.',
        source: 'Architecture of the Inevitable — IV',
      },
      {
        title: 'The BetStop Principle',
        body: 'The most successful circuit-break you\'ve ever executed is not a mindset shift. It\'s BetStop — permanent, irreversible, environmentally enforced. You couldn\'t undo it when sober-you later rationalised wanting to. The environment enforced what willpower could not. Fresh-startism gives you the feeling of that moment without the permanence.',
        source: 'Architecture of the Inevitable — III',
      },
      {
        title: 'Fully choose the rut or fully choose work',
        body: 'If you\'re going to watch Casino, watch Casino all the way through. Don\'t try to salvage the day at 9pm with anxious productivity. The harm of the rut is not the rest itself — it\'s the chronic unresolved guilt that contaminates the rest and prevents recovery. A rut fully chosen costs half as much as one half-chosen twice.',
        source: 'Architecture of the Inevitable — IV',
      },
      {
        title: 'Design over willpower',
        body: 'Ruts can\'t be eliminated by willpower but they can be confined by design. Low-affect, dopamine-seeking behaviour clusters between 1–3pm. The fix is not to resist the rut when it arrives but to make it architecturally impossible to begin during protected windows — external commitments, app blocks, social costs installed while sober-you can be trusted to care.',
        source: 'Rut Confinement — 24.04.26',
      },
    ],
  },
  {
    key: 'IDENTITY',
    label: 'Layer 3 — Who You Think You Are',
    shortLabel: 'IDENTITY',
    colour: '#c8a96e',
    summary: 'The deeper wiring — why ruts concentrate when you\'re alone, and why they feel so total.',
    nodes: [
      {
        title: 'The closed system',
        body: 'Ruts concentrate in specific conditions: a night when social plans dissolve, a public holiday, a solo weekday where nothing is mandatory. The rut doesn\'t happen when you\'re accountable to others. It happens when you\'re accountable only to yourself. That\'s the closed system.',
        source: 'Architecture of the Inevitable — II',
      },
      {
        title: 'The accountability scaffold',
        body: 'Lenexa, BMSS, Celiva, Kaspar, Rithika — these function as an external accountability scaffold that keeps the closed system at bay. They work beautifully when you\'re already in forward motion. They don\'t function as ignition. That is the gap.',
        source: 'Architecture of the Inevitable — II',
      },
      {
        title: 'The binary toggle',
        body: 'Your mind doesn\'t modulate between states — it switches between poles. Adequate → inadequate. Competent → prostrated. Superior → inferior. There\'s no dial; there\'s a binary toggle. This is why one bad Monday night trips the whole switch. It doesn\'t just cost a Tuesday — it temporarily dismantles the scaffolding managing the wound underneath.',
        source: 'Architecture of the Inevitable — VIII',
      },
      {
        title: 'The gap that can\'t be closed by doing',
        body: 'Every achievement — the scholarship, BSS Treasurer, Celiva, Lenexa, the property — has been partly a response to the question "am I enough?" answered to the ghost of every school hierarchy navigated badly. The gap can\'t be closed by answering that question because the question was installed by systems that were wrong about you. True evidence can\'t solve a false premise.',
        source: 'Architecture of the Inevitable — VI',
      },
      {
        title: 'The internal tasks you keep deferring',
        body: 'Every goal by 30 is external and measurable. The internal tasks — becoming someone who can rest without guilt, who can be unobserved without collapsing, who can tolerate the undramatic Tuesday — have no due date, no metric, no Boston milestone. So they keep getting bumped. The rut is the psyche\'s recurring protest that they\'re still deferred.',
        source: 'Architecture of the Inevitable — X',
      },
      {
        title: 'The rut as a strike',
        body: '"What\'s the point?" isn\'t nihilism. It\'s the authentic protest of a self that suspects, correctly, that the doings aren\'t actually closing the gap. The rut is partly a refusal to keep performing adequacy for a tribunal that has no legitimate authority. The tragedy is not letting that refusal be honest rest instead of a shame spiral.',
        source: 'Architecture of the Inevitable — VI',
      },
    ],
  },
  {
    key: 'SOCIAL / RELATIONAL',
    label: 'Layer 4 — How Others Affect You',
    shortLabel: 'SOCIAL / RELATIONAL',
    colour: '#a78bfa',
    summary: 'Why certain environments drain you faster, and what happens when care goes somewhere it can\'t land.',
    nodes: [
      {
        title: 'The compliant persona',
        body: 'The same mechanism that made you mirror a crush\'s Spotify playlists at 14 now assembles the medtech founder / property owner / Substack writer identity. The form radicalised. The function is identical: fitting yourself to what the surrounding environment will accept in order to belong. The rut is what happens when maintaining that performance becomes temporarily impossible.',
        source: 'Architecture of the Inevitable — VII',
      },
      {
        title: 'The Care-Commerce Paradox',
        body: 'Brian at BMSS is the clearest data point. He\'s a genuine regular — philosophical exchanges, real attentiveness. But on a packed Saturday shift, he became an infringement. Because the authentic relational mode (genuine care) got applied to the full customer set — which operates on transaction, not relationship. Care collided with indifference and returned as frustration.',
        source: 'Care-Commerce Paradox — May 3 Synthesis',
      },
      {
        title: 'Projective care',
        body: 'Authentic relational energy sent into a context that cannot absorb it. With Brian, with colleagues, with family: full relational investment. With the stranger buying a slab at 11am: professional courtesy, nothing more. The distinction isn\'t cynicism. It\'s the preservation of the care itself — because care depleted against indifference is not available for the people who actually need it.',
        source: 'Care-Commerce Paradox — May 3 Synthesis',
      },
      {
        title: 'Being busy as a status symbol',
        body: '"Being busy became my new status symbol. I worked so hard just to satisfy an old habit, dying hard." — Fish out of Water. The achievement accumulation is responding to the wrong question, answered to the wrong audience. The rut is relief from that performance. Briefly, you are just a person watching a film.',
        source: 'Architecture of the Inevitable — V',
      },
      {
        title: 'The relief-guilt inversion',
        body: 'The rut feels like relief at first — before it turns into guilt. For a brief window, you\'re not trying to prove anything. That relief is real. The tragedy: you don\'t let it be relief. You contaminate it with guilt, and the guilt doesn\'t motivate — it only corrodes.',
        source: 'Architecture of the Inevitable — V',
      },
      {
        title: 'Family financial stress as amplifier',
        body: 'When family finances are under pressure — the March 23 entry mentioning the possibility of selling the house, written immediately before a rut — the inherited risk you feel responsible for but cannot control multiplies the load beyond what\'s individually addressable. The rut is, in part, a shutdown when the system is overwhelmed.',
        source: 'Architecture of the Inevitable — X',
      },
    ],
  },
  {
    key: 'EXISTENTIAL',
    label: 'Layer 5 — The Deepest Layer',
    shortLabel: 'EXISTENTIAL',
    colour: '#4ade80',
    summary: 'The root underneath everything else — why you work this hard, and what the rut is actually protesting.',
    nodes: [
      {
        title: 'Productivity as not-dying',
        body: 'Keynes argued that our fixation on purposiveness — on using time well for future purposes — is ultimately motivated by the desire not to die. Your own writing makes this explicit: "Being busy became my new status symbol." The achievement accumulation is a symbolic immortality project. The rut punctures it. And the puncture is why it feels existential.',
        source: 'Purposiveness as a Rut — 02.01.26',
      },
      {
        title: 'The symbolic immortality project',
        body: 'The six goals by 30 — retire your family, executive at medtech, married with a child, two houses, run a marathon — are all external and measurable. Every single one. They are responses to the deep terror that this specific spirit-soul-body combination will not recur. That fear is not wrong. The problem is the response: achievements answer "am I enough?" to the ghost of every school hierarchy you navigated badly.',
        source: 'Architecture of the Inevitable — V',
      },
      {
        title: 'The second brain as nervous system',
        body: 'When your Obsidian is disordered, your anxiety baseline rises. The state of your vault is a real-time proxy for psychological regulation. This creates a loop: rut → guilt → avoidance of second brain → vault accumulates disorder → higher anxiety → lower resistance to next rut. Maintaining the vault is one of the most psychologically protective things you do.',
        source: 'Architecture of the Inevitable — VII',
      },
      {
        title: 'The tank insight',
        body: '"I spent years being a fish out of water trying to learn how to walk on land. Now I\'m realising the goal isn\'t to be a land animal — it\'s to build a tank so I can carry my water with me." You don\'t clean-slate your way out of dysregulation. You build the environment that makes dysregulation harder to fall into. BetStop was a tank.',
        source: 'Architecture of the Inevitable — VII',
      },
      {
        title: 'Performative authenticity',
        body: 'Your journalling, your second brain, your CBT frameworks, your essays — all exist in dangerous proximity to what Minh-Khang Nguyen calls performative authenticity: being in an illusion of authenticity while still voluntarily alienated. You need an audience to breathe. The medium changed from mirroring a crush\'s playlists. The need for witnessed performance is the same.',
        source: 'Architecture of the Inevitable — IX',
      },
      {
        title: 'The unobserved self',
        body: 'On the Casino Tuesday, you were not building the second brain, not writing for an audience, not iterating the self-model. You were just a person watching a film. The zero-demand state — where you\'re not being witnessed, not performing adequacy — is the only place you feel genuinely unobserved. The work is not to eliminate that relief. It\'s to find other conditions where you can be unobserved without requiring a rut to get there.',
        source: 'Architecture of the Inevitable — IX',
      },
    ],
  },
]

/* ── Sanctuary ───────────────────────────────────────────── */
function Sanctuary() {
  const [mantras, setMantras] = useState([])
  const [week, setWeek] = useState('')
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'anti-rut-content.json')
      .then(r => r.json())
      .then(d => { setMantras(d.mantras); setWeek(d.week) })
      .catch(() => {})
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel() }
  }, [])

  function changeMantra(newIdx) {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setSpeaking(false)
    setFading(true)
    setTimeout(() => { setIdx(newIdx); setFading(false) }, 180)
  }

  function handlePlay() {
    const current = mantras[idx]
    if (!current || !window.speechSynthesis) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const text = `${current.text}. ${current.meaning}`
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.82; utt.pitch = 0.95
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
    setSpeaking(true)
  }

  const current = mantras[idx]
  const total = mantras.length

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: '24px 20px 80px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      {week && (
        <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.2)', letterSpacing: '0.06em', marginBottom: 28, alignSelf: 'flex-end' }}>
          week of {week}
        </p>
      )}

      <div style={{
        maxWidth: 540, width: '100%',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.18s ease',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {current ? (
          <>
            {/* Mantra */}
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.5,
              color: '#e8edf2', fontWeight: 400, textAlign: 'center',
            }}>
              "{current.text}"
            </p>

            {/* Meaning */}
            <p style={{
              fontSize: 14, color: 'rgba(232,237,242,0.65)', lineHeight: 1.7,
              textAlign: 'center',
            }}>
              {current.meaning}
            </p>

            {/* Play button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
              <button
                onClick={handlePlay}
                style={{
                  width: 60, height: 60, borderRadius: '50%',
                  border: `1px solid ${speaking ? '#c8a96e' : 'rgba(200,169,110,0.4)'}`,
                  background: speaking ? 'rgba(200,169,110,0.1)' : 'transparent',
                  fontSize: 20, color: speaking ? '#c8a96e' : 'rgba(232,237,242,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  boxShadow: speaking ? '0 0 20px rgba(200,169,110,0.2)' : 'none',
                }}
                title={speaking ? 'Stop' : 'Play'}
              >
                {speaking ? '■' : '▶'}
              </button>
            </div>

            {/* Supplement */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '2px solid rgba(200,169,110,0.4)',
              borderRadius: 8, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 11, color: 'rgba(200,169,110,0.6)', letterSpacing: '0.07em', marginBottom: 8, textTransform: 'uppercase' }}>
                related idea
              </p>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 15, color: 'rgba(232,237,242,0.55)', lineHeight: 1.65,
              }}>
                "{current.supplement}"
              </p>
              <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', marginTop: 8 }}>
                — {current.supplementSource}
              </p>
            </div>

            {/* Source */}
            <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', letterSpacing: '0.05em', textAlign: 'center' }}>
              {current.source}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'rgba(232,237,242,0.3)', textAlign: 'center' }}>
            Loading…
          </p>
        )}
      </div>

      {/* Navigation */}
      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 28, fontSize: 13, color: 'rgba(232,237,242,0.3)' }}>
          <button
            onClick={() => changeMantra((idx - 1 + total) % total)}
            style={{ fontSize: 18, color: 'rgba(232,237,242,0.2)', padding: '4px 10px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.2)'}
          >←</button>
          <span style={{ letterSpacing: '0.1em' }}>{idx + 1} / {total}</span>
          <button
            onClick={() => changeMantra((idx + 1) % total)}
            style={{ fontSize: 18, color: 'rgba(232,237,242,0.2)', padding: '4px 10px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.2)'}
          >→</button>
        </div>
      )}
    </div>
  )
}

/* ── Mirror Sub-Node ─────────────────────────────────────── */
function SubNode({ node, colour }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '11px 0', display: 'flex', alignItems: 'center', gap: 10,
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 11, color: open ? colour : 'rgba(255,255,255,0.2)', transition: 'color 0.15s', flexShrink: 0 }}>
          {open ? '▼' : '▶'}
        </span>
        <span style={{ fontSize: 13, color: open ? '#e8edf2' : 'rgba(232,237,242,0.7)', flex: 1, lineHeight: 1.4, transition: 'color 0.15s' }}>
          {node.title}
        </span>
      </button>

      <div style={{
        maxHeight: open ? 400 : 0, overflow: 'hidden',
        transition: 'max-height 0.22s ease',
      }}>
        <div style={{ padding: '0 0 14px 20px' }}>
          <p style={{ fontSize: 13, color: 'rgba(232,237,242,0.65)', lineHeight: 1.75 }}>
            {node.body}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', marginTop: 10, letterSpacing: '0.04em' }}>
            {node.source}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Mirror Layer Panel ──────────────────────────────────── */
function LayerPanel({ layer, isActive }) {
  const [open, setOpen] = useState(isActive)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? layer.colour + '55' : 'rgba(255,255,255,0.06)'}`,
      borderLeft: `3px solid ${isActive ? layer.colour : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 8, overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}>
      {/* Layer header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? layer.colour : '#e8edf2', letterSpacing: '0.03em' }}>
              {open ? '▼' : '▶'} {layer.label}
            </span>
            {isActive && (
              <span style={{
                fontSize: 10, color: layer.colour,
                background: layer.colour + '18',
                border: `1px solid ${layer.colour}33`,
                borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em',
              }}>● active today</span>
            )}
          </div>
          {!open && (
            <p style={{ fontSize: 12, color: 'rgba(232,237,242,0.4)', lineHeight: 1.4 }}>{layer.summary}</p>
          )}
        </div>
        <span style={{ fontSize: 11, color: 'rgba(232,237,242,0.3)', flexShrink: 0 }}>
          {layer.nodes.length} ideas
        </span>
      </button>

      {/* Sub-nodes */}
      <div style={{
        maxHeight: open ? 2000 : 0, overflow: 'hidden',
        transition: 'max-height 0.28s ease',
      }}>
        <div style={{ padding: '0 16px 4px' }}>
          {layer.nodes.map((node, i) => (
            <SubNode key={i} node={node} colour={layer.colour} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Mirror ──────────────────────────────────────────────── */
function Mirror() {
  const profile = getRiskProfile()

  const riskColour = r => {
    const s = String(r).toUpperCase()
    if (s.includes('HIGH')) return '#f87171'
    if (s.includes('MODERATE') || s.includes('WATCH')) return '#fbbf24'
    return '#4ade80'
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '20px 16px 80px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Today's profile */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 10, padding: '16px 18px', marginBottom: 6,
        }}>
          <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            TODAY'S PROFILE · {profile.dayLabel}, {profile.timeLabel}
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#e8edf2', marginBottom: 6 }}>{profile.headline}</p>
          <p style={{ fontSize: 13, color: 'rgba(232,237,242,0.6)', lineHeight: 1.65, marginBottom: 12 }}>{profile.detail}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.risks.map((r, i) => (
              <span key={i} style={{
                fontSize: 11, color: riskColour(r),
                background: riskColour(r) + '15',
                border: `1px solid ${riskColour(r)}30`,
                borderRadius: 20, padding: '3px 10px',
              }}>{r}</span>
            ))}
          </div>
        </div>

        {/* Layer panels */}
        {LAYERS.map(layer => (
          <LayerPanel
            key={layer.key}
            layer={layer}
            isActive={profile.activeLayer === layer.key}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Tab Bar ─────────────────────────────────────────────── */
function TabBar({ active, onChange }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, height: 56,
      background: '#090909', borderTop: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', zIndex: 100,
    }}>
      {[{ key: 'sanctuary', icon: '◉', label: 'SANCTUARY' }, { key: 'mirror', icon: '◎', label: 'MIRROR' }].map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontSize: 12, fontWeight: 600, letterSpacing: '0.08em',
            color: active === t.key ? '#c8a96e' : 'rgba(232,237,242,0.35)',
            borderTop: active === t.key ? '2px solid #c8a96e' : '2px solid transparent',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          <span style={{ fontSize: 15 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ── Root ────────────────────────────────────────────────── */
export default function AntiRut() {
  const [tab, setTab] = useState('sanctuary')
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: tab === 'mirror' ? 'var(--navy)' : '#0a0a0a',
    }}>
      {/* Top bar */}
      <div style={{
        height: 50, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px',
        background: tab === 'mirror' ? 'rgba(13,27,42,0.97)' : 'rgba(10,10,10,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: 'rgba(232,237,242,0.3)', letterSpacing: '0.05em', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.3)'}
        >← OS</button>
        <span style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Anti-Rut
        </span>
        <span style={{ width: 36 }} />
      </div>

      {tab === 'sanctuary' ? <Sanctuary /> : <Mirror />}

      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
