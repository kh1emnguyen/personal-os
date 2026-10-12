// node scripts/test-model.mjs  (no dependencies)
import assert from 'node:assert/strict'
import { sectionize, sectionFor, boldParts, okUrl, blockId, longDate } from '../src/pages/Briefing/model.js'

const blocks = [
  { type: 'para', text: 'lead' },                                  // 0
  { type: 'h2', text: 'Today' },                                   // 1
  { type: 'panel', stream: 'reminders', label: 'NEXT 7 DAYS' },    // 2
  { type: 'panel', stream: 'calendar', id: 'cal' },                // 3 (explicit id)
  { type: 'h2', text: 'Reading' },                                 // 4
  { type: 'panel', stream: 'highlight' },                          // 5
  { type: 'footer', text: 'f' },                                   // 6
]
let n = 0
const t = (name, fn) => { fn(); n++; console.log('PASS ', name) }

t('sectionize: lead section then one per h2, in order', () => {
  const s = sectionize(blocks)
  assert.deepEqual(s.map((x) => x.id), ['lead', 'b1', 'b4'])
  assert.equal(s[0].title, null)
  assert.deepEqual(s[1].items.map((x) => x.id), ['b2', 'cal'])
  assert.deepEqual(s[2].items.map((x) => x.id), ['b5', 'b6'])
})
t('ids match the email: index in the original brief unless the block names one', () => {
  assert.equal(blockId(blocks[2], 2), 'b2')
  assert.equal(blockId(blocks[3], 3), 'cal')
})
t('sectionFor finds a section by its own id or by a block inside it', () => {
  const s = sectionize(blocks)
  assert.equal(sectionFor(s, 'b4').id, 'b4')
  assert.equal(sectionFor(s, 'cal').id, 'b1')
  assert.equal(sectionFor(s, 'nope'), null)
  assert.equal(sectionFor(s, null), null)
})
t('no h2 at all gives a single lead section', () => {
  const s = sectionize([{ type: 'para', text: 'a' }, { type: 'hr' }])
  assert.equal(s.length, 1)
  assert.equal(s[0].items.length, 2)
})
t('boldParts splits around the bold phrase and tolerates a missing one', () => {
  assert.deepEqual(boldParts('a one b', 'one'), [{ text: 'a ', bold: false }, { text: 'one', bold: true }, { text: ' b', bold: false }])
  assert.deepEqual(boldParts('plain', 'zzz'), [{ text: 'plain', bold: false }])
  assert.deepEqual(boldParts(null, null), [{ text: '', bold: false }])
})
t('okUrl accepts only http(s)', () => {
  assert(okUrl('https://claude.ai/artifact/x?a=1&b=2'))
  assert(!okUrl('javascript:alert(1)'))
  assert(!okUrl('data:text/html,hi'))
  assert(!okUrl('https://a.b/"onmouseover='))
  assert(!okUrl(''))
})
t('longDate gives the weekday from the date, not the clock', () => {
  assert(longDate('2026-10-12').startsWith('Monday'))
  assert(longDate('2026-10-03').startsWith('Saturday'))
})
console.log(`\n${n} passed`)
