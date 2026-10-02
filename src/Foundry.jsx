import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LabelList, LineChart, Line, ReferenceLine
} from 'recharts'
import { Card, CardHead, Pill, Stat, Seg } from './ui.jsx'
import d from './data/foundry.json'

const pct = n => (n == null ? '—' : `${(n * 100).toFixed(1)}%`)
const LABEL = { new_launch: 'new launch', trending_up: 'trending up', eol: 'end of life' }
const sgn = n => (n > 0 ? `+${(n * 100).toFixed(1)}%` : `${(n * 100).toFixed(1)}%`)

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white px-2.5 py-2 mono text-[11px] leading-relaxed rounded">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? pct(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Foundry() {
  const [cut, setCut] = useState('behaviour')   // behaviour | bu

  const bars = useMemo(() => (
    cut === 'behaviour'
      ? d.behaviour.map(r => ({ name: LABEL[r.behaviour] ?? r.behaviour, wape: r.wape, bias: r.bias, volume: r.volume }))
      : d.bu.map(r => ({ name: r.bu, wape: r.wape, bias: r.bias, volume: r.volume }))
  ), [cut])

  const worst = bars[0]

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">

      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[1.35rem] font-extrabold tracking-tight">
            Forecast accuracy ontology
          </h1>
          <p className="text-[13px] mt-1 max-w-[62ch]" style={{ color: 'var(--color-muted)' }}>
            A demand-planning ontology and two pipeline transforms written for Palantir Foundry.
            The question is not how wrong the forecast was. It is what is driving the error and
            what a planner should change. The figures below come from the metric logic run in
            Python; the transforms have not yet been executed inside Foundry.
          </p>
        </div>
        <div className="flex gap-2">
          <Pill tone="muted">Foundry transforms</Pill>
          <Pill tone="muted">PySpark</Pill>
          <Pill tone="warn">synthetic data</Pill>
        </div>
      </div>

      {/* ── the numbers ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="demand rows" value={d.summary.rows.toLocaleString()} />
        <Stat label="SKUs × countries" value={`${d.summary.skus} × ${d.summary.countries}`} />
        <Stat label="WAPE, lag-1" value={pct(d.summary.wape_lag1)} />
        <Stat label="months" value={d.summary.months} />
      </div>

      {/* ── the point of the project ───────────────────────────── */}
      <Card className="mb-5">
        <CardHead title="Why the aggregation order matters"
                  sub="the same data, two defensible-looking numbers" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.4fr] gap-5 p-4 pt-0">
          <div>
            <div className="mono text-[26px] font-bold leading-none">{pct(d.summary.wape_lag1)}</div>
            <div className="text-[12px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
              WAPE, computed as <span className="mono">sum(|error|) / sum(actual)</span>
            </div>
          </div>
          <div>
            <div className="mono text-[26px] font-bold leading-none" style={{ color: 'var(--color-warn)' }}>
              {pct(d.summary.mean_mape)}
            </div>
            <div className="text-[12px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
              mean of row-level percentage errors
            </div>
          </div>
          <div className="text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            The second number is not simply higher or lower. It is{' '}
            <strong style={{ color: 'var(--color-ink)' }}>undefined</strong> wherever actual demand
            is zero, so it silently drops{' '}
            <strong style={{ color: 'var(--color-ink)' }}>
              {d.summary.zero_demand_rows.toLocaleString()} of {d.summary.total_rows_lag1.toLocaleString()}
            </strong>{' '}
            rows. Those rows belong to the intermittent SKUs, the second-worst group in the
            portfolio after new launches. The metric hides the part of the business it should be flagging.
          </div>
        </div>
      </Card>

      {/* ── error by cut ───────────────────────────────────────── */}
      <Card className="mb-5">
        <CardHead
          title="Where the error lives"
          sub={`worst: ${worst?.name} at ${pct(worst?.wape)}`}
          action={
            <Seg value={cut} onChange={setCut} options={[
              { value: 'behaviour', label: 'Demand behaviour' },
              { value: 'bu', label: 'Business unit' },
            ]} />
          } />
        <div className="h-[280px] px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 18, right: 16, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--color-line)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }}
                     tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<Tip />} cursor={{ fill: 'rgba(0,0,0,.04)' }} />
              <Bar dataKey="wape" name="WAPE" radius={[4, 4, 0, 0]}>
                {bars.map((b, i) => (
                  <Cell key={i} fill={b.wape > 0.3 ? 'var(--color-bad)'
                                    : b.wape > 0.15 ? 'var(--color-warn)'
                                    : 'var(--color-brand-500)'} />
                ))}
                <LabelList dataKey="wape" position="top"
                           formatter={v => `${(v * 100).toFixed(0)}%`}
                           style={{ fontSize: 10, fill: 'var(--color-muted)' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="px-4 pb-4 text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          Each SKU in the generator carries a hidden demand behaviour, and its forecast is wrong in
          the way that behaviour is usually wrong. The test is whether the ontology recovers those
          behaviours from the data alone. It does: new launches, intermittent demand and
          end-of-life lines separate cleanly from stable and seasonal ones.
        </div>
      </Card>

      {/* ── horizon ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-4 mb-5">
        <Card>
          <CardHead title="Error grows with horizon" sub="as it should" />
          <div className="h-[200px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.horizon} margin={{ top: 16, right: 20, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--color-line)" />
                <XAxis dataKey="horizon" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11 }}
                       tickLine={false} axisLine={false} width={44} domain={['dataMin - 0.02', 'dataMax + 0.02']} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="wape" name="WAPE" strokeWidth={2}
                      stroke="var(--color-brand-500)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHead title="Top error contributors" sub="ranked by share of absolute error, not by rate" />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left" style={{ color: 'var(--color-muted)' }}>
                  <th className="font-medium py-1.5 pl-4">SKU</th>
                  <th className="font-medium">Family</th>
                  <th className="font-medium text-right">Share</th>
                  <th className="font-medium text-right">WAPE</th>
                  <th className="font-medium text-right pr-4">Bias</th>
                </tr>
              </thead>
              <tbody>
                {d.drivers.slice(0, 8).map(r => (
                  <tr key={r.sku} style={{ borderTop: '1px solid var(--color-line)' }}>
                    <td className="mono py-1.5 pl-4">{r.sku}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{r.family}</td>
                    <td className="mono text-right">{pct(r.share)}</td>
                    <td className="mono text-right">{pct(r.wape)}</td>
                    <td className="mono text-right pr-4"
                        style={{ color: r.direction === 'over' ? 'var(--color-bad)'
                                       : r.direction === 'under' ? 'var(--color-warn)'
                                       : 'var(--color-muted)' }}>
                      {sgn(r.bias)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            A low-volume SKU at 300% WAPE is noise. A large one at 20% may be the real problem.
            Ranking on contribution to absolute error puts the review in the right order.
          </div>
        </Card>
      </div>

      {/* ── honest status ──────────────────────────────────────── */}
      <Card>
        <CardHead title="Status" sub="what is built and what is not" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 pt-0 text-[12.5px] leading-relaxed">
          <div>
            <div className="font-semibold mb-1.5" style={{ color: 'var(--color-ink)' }}>Built</div>
            <ul className="space-y-1" style={{ color: 'var(--color-muted)' }}>
              <li>Synthetic generator: 180 SKUs, 9 countries, 20 months, three forecast horizons, seeded.</li>
              <li>Ontology: three object types, two link types, eight reporting grains.</li>
              <li>Two transforms written against Foundry's <span className="mono">transforms.api</span>:
                  accuracy metrics at eight grains, and driver ranking with a recommended action.</li>
              <li>Metric logic validated in plain Python before any platform code was written.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1.5" style={{ color: 'var(--color-ink)' }}>Not yet</div>
            <ul className="space-y-1" style={{ color: 'var(--color-muted)' }}>
              <li>The transforms have not been run inside Foundry. The aggregation logic is tested in
                  pandas, not on the platform.</li>
              <li>No Workshop application on top of the ontology.</li>
              <li>No AIP or LLM layer.</li>
            </ul>
          </div>
        </div>
        <div className="px-4 pb-4 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
          All data is generated by a seeded script. Business units and product families are generic
          labels. No employer data, taxonomy or system is used anywhere in this project.
        </div>
      </Card>
    </div>
  )
}
