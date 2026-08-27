import {
  ResponsiveContainer, BarChart, Bar, ComposedChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts'
import { Card, CardHead, Pill, Stat } from './ui.jsx'
import head from './data/fnbHead.json'
import dow from './data/fnbDow.json'
import monthly from './data/fnbMonthly.json'

const mn = m => m.slice(2).replace('-', '·')

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-[11px] shadow-lg"
         style={{ background: 'var(--color-ink)', color: '#fff' }}>
      <div className="opacity-60 mb-1 mono">{label}</div>
      {payload.map(p => <div key={p.dataKey} className="mono">{p.name}: {p.value}</div>)}
    </div>
  )
}

export default function Fnb() {
  const bars = dow.map(d => ({ ...d, gap: Math.max(0, 145 - d.index) }))
  const peak = dow.find(d => d.day === head.peakDay)
  const trough = dow.find(d => d.day === head.troughDay)
  const bestGp = [...dow].sort((a, b) => b.gpm - a.gpm)[0]

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1 px-1">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight leading-tight">Food &amp; beverage trading</h1>
          <p className="card-sub">
            {head.tradingDays} trading days · {head.from} → {head.to} · figures indexed, no absolute values
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Pill tone="muted">{head.months} months</Pill>
          <Pill tone="muted">{head.bills.toLocaleString()} bills</Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat dark label="Peak trading night" value={head.peakIdx} unit=""
              pill={<Pill tone="onDark">{head.peakDay}</Pill>}
              foot={`vs ${head.troughIdx} on ${head.troughDay} · index 100 = average`} />
        <Stat label="Gross margin" value={head.gpm} unit="%"
              pill={<Pill tone="good">stable</Pill>} foot="across all trading days" />
        <Stat label="Trading days" value={head.tradingDays} unit=""
              pill={<Pill tone="muted">{head.closedDays} closed</Pill>} foot="of 760 calendar days" />
        <Stat label="Pax field unusable" value={head.paxEqBills} unit="%"
              pill={<Pill tone="bad">data quality</Pill>}
              foot="of days record pax = bill count exactly" />
      </div>

      <div className="grid lg:grid-cols-12 gap-3">
        <Card className="lg:col-span-7">
          <CardHead title="Trade by night of week" sub="Bill volume indexed to the weekly average"
                    action={<Pill tone="muted">100 = average</Pill>} />
          <div className="h-[280px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 18, right: 8, bottom: 4, left: 0 }} barSize={34}>
                <XAxis dataKey="day" tickLine={false} axisLine={false}
                       tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-muted)' }} />
                <YAxis hide domain={[0, 145]} />
                <Tooltip content={<Tip />} cursor={false} />
                <Bar dataKey="index" name="index" stackId="a" radius={[0, 0, 12, 12]}>
                  {bars.map(b => (
                    <Cell key={b.day}
                          fill={b.index >= 130 ? 'var(--color-brand-900)'
                              : b.index >= 100 ? 'var(--color-brand-500)' : 'var(--color-brand-300)'} />
                  ))}
                </Bar>
                <Bar dataKey="gap" name="below peak" stackId="a" radius={[12, 12, 0, 0]} fill="url(#hatch)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHead title="Read-out" sub="What the pattern implies" />
          <div className="px-4 pb-4 space-y-3 text-[13px] leading-relaxed">
            <p>
              <strong>{peak.day}</strong> runs at <strong>{peak.index}</strong> against
              {' '}<strong>{trough.day}</strong> at <strong>{trough.index}</strong> — the busiest night
              carries close to {(peak.index / trough.index).toFixed(1)}× the trade of the quietest.
            </p>
            <div className="rounded-xl p-3" style={{ background: 'var(--color-brand-100)' }}>
              <p style={{ color: 'var(--color-brand-900)' }}>
                {bestGp.day} is both busy and the strongest margin night at <strong>{bestGp.gpm}%</strong>.
                Where volume and margin peak together, roster and prep should follow — the cost of
                being under-staffed is highest exactly there.
              </p>
            </div>
            <p style={{ color: 'var(--color-muted)' }}>
              Margin sits in a narrow band across the week ({Math.min(...dow.map(d => d.gpm))}–
              {Math.max(...dow.map(d => d.gpm))}%), so the weekly swing is a volume story, not a mix story.
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <CardHead title="Monthly trade and margin" sub="Bills per trading day, indexed · margin on right"
                    action={<Pill tone="muted">{head.months} months</Pill>} />
          <div className="h-[250px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 12, right: 6, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mn} minTickGap={22} tickLine={false} axisLine={false}
                       tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--color-muted)' }} />
                <YAxis yAxisId="l" width={38} tickLine={false} axisLine={false}
                       tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis yAxisId="r" orientation="right" unit="%" domain={[40, 56]} width={40}
                       tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine yAxisId="l" y={100} stroke="var(--color-brand-300)" strokeDasharray="4 4" />
                <Bar yAxisId="l" dataKey="billsIdx" name="bills index" radius={[8, 8, 8, 8]} barSize={13}
                     fill="var(--color-brand-300)" />
                <Line yAxisId="r" dataKey="gpm" name="gross margin %" stroke="var(--color-brand-900)"
                      strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHead title="A metric that looks usable and isn't" sub="Why headcount was dropped" />
          <div className="px-4 pb-4 space-y-3 text-[13px] leading-relaxed">
            <p>
              The POS exports a <strong>Number of Pax</strong> field, which would give revenue per head —
              the metric everyone wants in hospitality. It does not survive inspection.
            </p>
            <ul className="space-y-1.5" style={{ color: 'var(--color-muted)' }}>
              <li>• <strong style={{ color: 'var(--color-ink)' }}>{head.paxEqBills}%</strong> of trading days
                record pax exactly equal to bill count — one cover per bill, which is a default, not a count.</li>
              <li>• 10% of days record <em>fewer</em> pax than bills, which cannot happen if pax means covers.</li>
              <li>• Correlation with bill count is only 0.66.</li>
            </ul>
            <p>
              Every figure on this page is therefore built on <strong>bill count</strong>, which the till
              produces mechanically. Per-head metrics are not reported at all.
            </p>
          </div>
        </Card>
      </div>

      <p className="text-[11px] px-1 pb-2" style={{ color: 'var(--color-muted)' }}>
        Independent F&amp;B operation. All figures indexed to internal averages or shown as percentages —
        no absolute revenue, cost or transaction values are published.
      </p>
    </div>
  )
}
