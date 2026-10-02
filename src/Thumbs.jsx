import daily from './data/dailySeries.json'
import planningDepts from './data/planningDepts.json'
import opsMonthly from './data/opsMonthly.json'
import fnbDow from './data/fnbDow.json'
import traces from './data/agentTraces.json'
import foundry from './data/foundry.json'
import ev from './data/ev.json'

/* Each project's thumbnail is drawn from that project's own data, with the finding
   picked out in the accent. They are small charts, not illustrations. */
const W = 320, H = 160
const INK = 'var(--color-ink)', MUTED = 'var(--lp-muted)', LINE = 'var(--color-line)'
const ACC = 'var(--color-brand-500)', ACC_D = 'var(--color-brand-700)', BAD = 'var(--color-bad)'

const lin = (d0, d1, r0, r1) => v => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)
const path = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('')

function Frame({ label, children }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="lp-thumb" role="img" aria-label={label}>
      {children}
    </svg>
  )
}

function Backtest() {
  const d = daily.slice(0, 120)
  const ys = d.flatMap(r => [r.actual, r.forecast])
  const x = lin(0, d.length - 1, 4, W - 4), y = lin(Math.min(...ys), Math.max(...ys), H - 10, 10)
  return (
    <Frame label="Daily actual sales against the Prophet forecast: the forecast is smooth while actuals swing widely.">
      <path d={path(d.map((r, i) => [x(i), y(r.actual)]))} fill="none" stroke={MUTED} strokeWidth="1" opacity=".55" />
      <path d={path(d.map((r, i) => [x(i), y(r.forecast)]))} fill="none" stroke={ACC_D} strokeWidth="2.2" />
    </Frame>
  )
}

function Planning() {
  const d = planningDepts
  const m = Math.max(...d.map(r => Math.abs(r.fva)))
  const bw = (W - 8) / d.length, y = lin(-m, m, H - 8, 8), y0 = y(0)
  return (
    <Frame label="Forecast value add by department: below zero on five of seven, above zero only on HOBBIES_2.">
      <line x1="0" x2={W} y1={y0} y2={y0} stroke={INK} strokeWidth="1" />
      {d.map((r, i) => {
        const top = Math.min(y(r.fva), y0), h = Math.abs(y(r.fva) - y0)
        return <rect key={r.dept} x={4 + i * bw + bw * .22} width={bw * .56} y={top} height={Math.max(h, 1)}
                     fill={r.fva > 0 ? ACC : 'none'} stroke={r.fva > 0 ? ACC : MUTED} strokeWidth="1.2" rx="2" />
      })}
    </Frame>
  )
}

function Operations() {
  const d = opsMonthly
  const bw = (W - 8) / d.length, top = 10, bot = H - 8, y = lin(0, 100, bot, top)
  return (
    <Frame label="Monthly load factor as filled capsules; the hollow part of each is empty seats.">
      {d.map((r, i) => {
        const cx = 4 + i * bw + bw * .2, w = bw * .6
        return (
          <g key={r.month}>
            <rect x={cx} y={top} width={w} height={bot - top} rx={w / 2} fill="none" stroke={MUTED} strokeWidth="1" opacity=".6" />
            <rect x={cx} y={y(r.lf)} width={w} height={bot - y(r.lf)} rx={w / 2} fill={ACC_D} />
          </g>
        )
      })}
    </Frame>
  )
}

function Fnb() {
  const d = fnbDow
  const max = Math.max(...d.map(r => r.index))
  const bw = (W - 8) / d.length, y = lin(0, max * 1.08, H - 8, 6)
  return (
    <Frame label="Trading index by weekday against an average of 100; Friday is highest and Monday lowest.">
      {d.map((r, i) => (
        <rect key={r.day} x={4 + i * bw + bw * .2} width={bw * .6} y={y(r.index)} height={H - 8 - y(r.index)} rx="2"
              fill={r.index === max ? ACC : 'none'} stroke={r.index === max ? ACC : MUTED} strokeWidth="1.2" />
      ))}
      <line x1="0" x2={W} y1={y(100)} y2={y(100)} stroke={INK} strokeWidth="1" strokeDasharray="3 4" />
    </Frame>
  )
}

function Agent() {
  const t = [...traces].sort((a, b) => b.calls.length - a.calls.length)[0]
  // consecutive repeats of one tool collapse to a single node with a count
  const runs = t.calls.reduce((acc, c) => {
    const last = acc[acc.length - 1]
    if (last && last.tool === c.tool) last.n++; else acc.push({ tool: c.tool, n: 1 })
    return acc
  }, [])
  const nodes = ['question', ...runs.map(r => `${r.tool}()${r.n > 1 ? ` ×${r.n}` : ''}`), 'answer']
  const step = Math.min(34, (H - 24) / (nodes.length - 1))
  return (
    <Frame label={`A recorded agent run: the question, ${t.calls.length} tool calls, then the answer.`}>
      <line x1="18" x2="18" y1="12" y2={12 + step * (nodes.length - 1)} stroke={MUTED} strokeWidth="1" />
      {nodes.map((n, i) => {
        const cy = 12 + i * step, end = i === 0 || i === nodes.length - 1
        return (
          <g key={i}>
            <circle cx="18" cy={cy} r={end ? 5 : 4} fill={end ? INK : 'var(--color-ground)'} stroke={end ? INK : ACC_D} strokeWidth="1.6" />
            <text x="34" y={cy + 4} fontSize="15" fontFamily="var(--font-mono)" fill={end ? MUTED : ACC_D}>
              {n}
            </text>
          </g>
        )
      })}
    </Frame>
  )
}

function Foundry() {
  const d = foundry.behaviour
  const max = Math.max(...d.map(r => r.wape))
  const bh = (H - 8) / d.length, x = lin(0, max, 0, W - 8)
  return (
    <Frame label="Forecast error by demand behaviour: new launches, intermittent and end-of-life lines are far worse than stable ones.">
      <line x1="1" x2="1" y1="0" y2={H} stroke={INK} strokeWidth="1" />
      {d.map((r, i) => (
        <rect key={r.behaviour} x="1" y={4 + i * bh + bh * .22} width={Math.max(x(r.wape), 2)} height={bh * .56} rx="2"
              fill={r.wape > 0.3 ? BAD : 'none'} stroke={r.wape > 0.3 ? BAD : MUTED} strokeWidth="1.2" opacity={r.wape > 0.3 ? .85 : 1} />
      ))}
    </Frame>
  )
}

function EvSiting() {
  const pts = [...ev.existing, ...ev.sites]
  const la = pts.map(p => p.lat), lo = pts.map(p => p.lon)
  const x = lin(Math.min(...lo), Math.max(...lo), 6, W - 6), y = lin(Math.min(...la), Math.max(...la), H - 6, 6)
  return (
    <Frame label={`Map of Singapore: ${ev.existing.length.toLocaleString()} existing charging locations, faint, and the ${ev.sites.length} selected sites in green.`}>
      {ev.existing.map((p, i) => <circle key={i} cx={x(p.lon)} cy={y(p.lat)} r=".9" fill={MUTED} opacity=".35" />)}
      {ev.sites.map(s => <circle key={s.id} cx={x(s.lon)} cy={y(s.lat)} r="3.4" fill={ACC_D} stroke="var(--color-ground)" strokeWidth="1" />)}
    </Frame>
  )
}

export const THUMBS = {
  backtest: Backtest, planning: Planning, operations: Operations, fnb: Fnb,
  agent: Agent, foundry: Foundry, evsiting: EvSiting,
}
