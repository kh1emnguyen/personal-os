// Pure helpers for the briefing page. No React, no network, so they can be tested with plain node.

export const okUrl = (u) => /^https?:\/\/[^\s"<>]+$/i.test(String(u || ''))

// Same rule as the email renderer (render.js blockId): the id is the block's index in the ORIGINAL brief.
export const blockId = (b, i) => (b && b.id) || `b${i}`

// Group blocks into sections: each h2 opens one. Blocks before the first h2 form an untitled lead section.
export function sectionize(blocks) {
  const sections = []
  let cur = null
  ;(blocks || []).forEach((b, i) => {
    if (b.type === 'h2') {
      cur = { id: blockId(b, i), title: b.text, items: [] }
      sections.push(cur)
      return
    }
    if (!cur) {
      cur = { id: 'lead', title: null, items: [] }
      sections.push(cur)
    }
    cur.items.push({ b, id: blockId(b, i), i })
  })
  return sections
}

// The section that holds a target id (the section's own id or any block inside it).
export function sectionFor(sections, id) {
  if (!id) return null
  return sections.find((s) => s.id === id || s.items.some((x) => x.id === id)) || null
}

// Split text around a bold substring, the way the email does. Returns [{text, bold}].
export function boldParts(text, bold) {
  const t = String(text == null ? '' : text)
  const i = bold ? t.indexOf(bold) : -1
  if (i < 0) return [{ text: t, bold: false }]
  return [
    { text: t.slice(0, i), bold: false },
    { text: bold, bold: true },
    { text: t.slice(i + bold.length), bold: false },
  ].filter((p) => p.text)
}

// Stream colours match the email (templates/styles.js). The page is dark, so only the accent is used.
export const STREAM_ACCENT = {
  journal: '#6f9a74', token: '#8d7fe0', founder: '#d0566a', brother: '#d08a4a', highlight: '#e0b92a',
  newsletter: '#e0642f', film: '#6a95c4', book: '#b07895', draft: '#4fa39d', trail: '#9a9a9a',
  reminders: '#c9a24a', calendar: '#4fae8f', habits: '#a89f86', news: '#6f93c0', slack: '#4fb0cf',
  video: '#9a78d6', essay: '#c19a5b', cinema: '#cf5f5f', echo: '#9a9a9a',
}
export const accentFor = (stream) => STREAM_ACCENT[stream] || STREAM_ACCENT.habits

export const longDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return String(iso || '')
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12))
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
