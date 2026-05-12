import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

const ACCENT = '#a78bfa'

function getMondayDate() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
}

function Label({ children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(232,237,242,0.85)', marginBottom: 8, letterSpacing: '0.01em' }}>
      {children}
    </p>
  )
}

function Hint({ children }) {
  return (
    <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.35)', marginBottom: 10, lineHeight: 1.5 }}>
      {children}
    </p>
  )
}

function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 8, padding: '11px 13px',
        color: '#e8edf2', fontSize: 14, fontFamily: 'var(--font-sans)',
        lineHeight: 1.65, resize: 'vertical',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = ACCENT + '80'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
  )
}

function NumberInput({ value, onChange, placeholder, min = 0, max = 100 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      style={{
        width: '100%', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 8, padding: '11px 13px',
        color: '#e8edf2', fontSize: 14, fontFamily: 'var(--font-sans)',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = ACCENT + '80'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
    />
  )
}

export default function CheckIn() {
  const navigate = useNavigate()
  const weekOf = getMondayDate()

  const [movieTitle, setMovieTitle] = useState('')
  const [movieThoughts, setMovieThoughts] = useState('')
  const [sleepScore, setSleepScore] = useState('')
  const [bodyBattery, setBodyBattery] = useState('')
  const [eatingNotes, setEatingNotes] = useState('')
  const [exerciseNotes, setExerciseNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      week_of: weekOf,
      movie_title: movieTitle.trim() || null,
      movie_thoughts: movieThoughts.trim() || null,
      sleep_score: sleepScore !== '' ? parseInt(sleepScore) : null,
      body_battery: bodyBattery !== '' ? parseInt(bodyBattery) : null,
      eating_notes: eatingNotes.trim() || null,
      exercise_notes: exerciseNotes.trim() || null,
    }

    if (!supabase) {
      setError('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.')
      setSaving(false)
      return
    }

    const { error: err } = await supabase.from('weekly_checkins').insert(payload)

    if (err) {
      setError(err.message)
      setSaving(false)
    } else {
      setDone(true)
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        height: 52, flexShrink: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(135deg, #0d1b2a, #1a2e44)',
      }}>
        <button
          onClick={() => navigate('/')}
          style={{ fontSize: 12, color: 'rgba(232,237,242,0.4)', letterSpacing: '0.05em', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#e8edf2'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,242,0.4)'}
        >← OS</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e8edf2' }}>Weekly Check-In</span>
          <span style={{ fontSize: 11, color: ACCENT, background: ACCENT + '18', border: `1px solid ${ACCENT}33`, borderRadius: 20, padding: '2px 8px' }}>
            🔨 Building
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', letterSpacing: '0.04em' }}>
          w/c {weekOf}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '32px 24px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 580 }}>

          {done ? (
            /* Success state */
            <div style={{
              background: 'rgba(167,139,250,0.08)',
              border: `1px solid ${ACCENT}33`,
              borderRadius: 14, padding: '36px 32px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 28, marginBottom: 16 }}>✓</p>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e8edf2', marginBottom: 10 }}>
                Logged for {weekOf}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(232,237,242,0.5)', lineHeight: 1.7, marginBottom: 28 }}>
                The co-work agent picks this up Sunday night and writes your movie review and health log into the vault by Monday morning.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => { setDone(false); setMovieTitle(''); setMovieThoughts(''); setSleepScore(''); setBodyBattery(''); setEatingNotes(''); setExerciseNotes('') }}
                  style={{
                    fontSize: 13, color: 'rgba(232,237,242,0.6)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 8, padding: '9px 18px',
                    background: 'rgba(255,255,255,0.04)',
                    transition: 'color 0.15s',
                  }}
                >New entry</button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    fontSize: 13, color: '#0a0a0a',
                    background: ACCENT, borderRadius: 8, padding: '9px 18px',
                    fontWeight: 600,
                  }}
                >← Back to OS</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

              {/* Q1 — Movie */}
              <div>
                <Label>1 — What did you watch or read this week?</Label>
                <Hint>Title first, then your honest reaction. No polish needed.</Hint>
                <input
                  value={movieTitle}
                  onChange={e => setMovieTitle(e.target.value)}
                  placeholder="Title"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 8, padding: '11px 13px', marginBottom: 8,
                    color: '#e8edf2', fontSize: 14, fontFamily: 'var(--font-sans)',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = ACCENT + '80'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <TextArea
                  value={movieThoughts}
                  onChange={setMovieThoughts}
                  placeholder="Your honest reaction…"
                  rows={4}
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Q2 — Sleep */}
              <div>
                <Label>2 — Garmin sleep this week</Label>
                <Hint>Average sleep score and body battery for the week. Just the numbers (0–100).</Hint>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.4)', marginBottom: 6 }}>Sleep score</p>
                    <NumberInput value={sleepScore} onChange={setSleepScore} placeholder="e.g. 78" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.4)', marginBottom: 6 }}>Body battery</p>
                    <NumberInput value={bodyBattery} onChange={setBodyBattery} placeholder="e.g. 64" />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Q3 — Food */}
              <div>
                <Label>3 — Eating this week</Label>
                <Hint>On target, off, or somewhere between? Any patterns worth noting?</Hint>
                <TextArea
                  value={eatingNotes}
                  onChange={setEatingNotes}
                  placeholder="Mostly on track. Hit protein most days. Went off-script Friday night…"
                  rows={3}
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

              {/* Q4 — Exercise */}
              <div>
                <Label>4 — Training this week</Label>
                <Hint>What did you do, how did it feel, anything to flag?</Hint>
                <TextArea
                  value={exerciseNotes}
                  onChange={setExerciseNotes}
                  placeholder="3 runs, one session at the gym. Legs felt heavy Tuesday…"
                  rows={3}
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontSize: 13, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? 'rgba(167,139,250,0.4)' : ACCENT,
                  color: '#0a0a0a', borderRadius: 10,
                  padding: '13px 0', fontWeight: 700, fontSize: 14,
                  letterSpacing: '0.02em',
                  transition: 'background 0.15s',
                  cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Submit check-in'}
              </button>

              <p style={{ fontSize: 11, color: 'rgba(232,237,242,0.25)', textAlign: 'center', marginTop: -12 }}>
                Saved to Supabase · Co-work agent runs Sunday 9pm AEST
              </p>

            </form>
          )}
        </div>
      </div>
    </div>
  )
}
