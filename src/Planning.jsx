import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ReferenceLine, LabelList
} from 'recharts'
import { Card, CardHead, Pill, Stat, Seg, Empty } from './ui.jsx'
import overall from './data/planningOverall.json'
import depts from './data/planningDepts.json'
import trend from './data/planningTrend.json'
import series from './data/deptSeries.json'

const sign = n => (n > 0 ? `+${n}` : `${n}`)
const toneFor = fva => (fva > 0 ? 'good' : fva > -5 ? 'warn' : 'bad')

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white px-2.5 py-2 mono text-[11px] leading-relaxed rounded">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.filter(p => !p.hide).map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString?.() ?? p.value}</div>
      ))}
    </div>
  )
}

export default function Planning() {
  const [sel, setSel] = useState('FOODS_3')
  const [only, setOnly] = useState('all')       // all | losing | winning
  const [win, setWin] = useState(90)            // trailing days in drill-down

  const rows = useMemo(() => depts.filter(d =>
    only === 'all' ? true : only === 'losing' ? d.fva <= 0 : d.fva > 0), [only])

  const drill = useMemo(() => (series[sel] || []).slice(-win), [sel, win])
  const selRow = depts.find(d => d.dept === sel)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
      {/* ── header strip ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-5">
        <div>
          <div className="card-sub mb-1">Demand planning · forecast value add</div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight leading-tight">Model vs seasonal-naive baseline</h1>
        </div>
        <div className="mono text-[11px] text-muted ml-auto flex flex-wrap gap-x-4 gap-y-1">
          <span>public M5 retail data</span>
          <span>{overall.points.toLocaleString()} daily points</span>
          <span>{overall.units.toLocaleString()} units</span>
          <span>3 walk-forward folds</span>
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Stat label="Forecast accuracy" value={overall.fa} unit="%"
             foot="100 − WAPE, volume weighted" />
        <Stat label="Naive baseline" value={overall.naiveFa} unit="%"
             foot="Same weekday, one week earlier" />
        <Stat label="Forecast value add" value={sign(overall.fva)} unit="pp" tone="bad"
             pill={<Pill tone="bad">below baseline</Pill>}
             foot={`Model loses on ${overall.total - overall.improved} of ${overall.total} departments`} />
        <Stat label="Bias" value={sign(overall.bias)} unit="%" tone="good"
             pill={<Pill tone="good">within ±1pp</Pill>}
             foot="No systematic over- or under-forecast" />
      </div>

      {/* ── main grid ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-3">

        {/* driver table */}
        <Card className="lg:col-span-5">
<CardHead title={`Departments · ${rows.length} of ${depts.length}`} pad={false} action={<Seg value={only} onChange={setOnly} options={[{value:'all',label:'All'},{value:'losing',label:'Losing'},{value:'winning',label:'Winning'}]} />} />
          {rows.length === 0
            ? <Empty>No departments match this filter.<br />Clear it to see all {depts.length}.</Empty>
            : (
              <div className="max-h-[330px] overflow-auto">
                <table className="grid">
                  <thead><tr>
                    <th>Dept</th><th>Volume</th><th>Accuracy</th><th>Naive</th><th>FVA</th><th>Bias</th>
                  </tr></thead>
                  <tbody>
                    {rows.map(d => (
                      <tr key={d.dept} data-sel={d.dept === sel ? '1' : '0'} onClick={() => setSel(d.dept)}>
                        <td className="mono">{d.dept}</td>
                        <td className="tnum text-muted">{d.volume.toLocaleString()}</td>
                        <td className="tnum">{d.fa}%</td>
                        <td className="tnum text-muted">{d.naiveFa}%</td>
                        <td><Pill tone={toneFor(d.fva)}>{sign(d.fva)}pp</Pill></td>
                        <td className="tnum text-muted">{sign(d.bias)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </Card>

        {/* FVA ranking */}
        <Card className="lg:col-span-7" title="Forecast value add by department · percentage points"
          toolbar={<Pill tone="muted">negative = worse than naive</Pill>}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts} layout="vertical" margin={{ left: 4, right: 52, top: 4, bottom: 4 }}>
                <CartesianGrid stroke="var(--color-line)" horizontal={false} />
                <XAxis type="number" unit="pp" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis type="category" dataKey="dept" width={96}
                       tick={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine x={0} stroke="var(--color-ink)" />
                <Bar dataKey="fva" name="FVA" onClick={(_, i) => setSel(depts[i].dept)} cursor="pointer">
                  {depts.map(d => (
                    <Cell key={d.dept}
                      fill={d.fva > 0 ? 'var(--color-good)' : 'var(--color-bad)'}
                      fillOpacity={d.dept === sel ? 1 : 0.55} />
                  ))}
                  <LabelList dataKey="fva" position="right" formatter={v => `${sign(v)}pp`}
                             style={{ fontFamily: 'IBM Plex Mono', fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* drill-down */}
        <Card className="lg:col-span-8">
<CardHead title={`${sel} · actual vs model vs naive · trailing ${win} days`} action={<Seg value={win} onChange={setWin} options={[60,90,180].map(v => ({ value: v, label: `${v}d` }))} />} />
          {drill.length === 0
            ? <Empty>No observations for {sel} in this window.</Empty>
            : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={drill} margin={{ top: 6, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke="var(--color-line)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={d => d.slice(5)} minTickGap={42}
                           tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                    <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" width={46} />
                    <Tooltip content={<Tip />} />
                    <Area dataKey="err" name="abs error" stroke="none"
                          fill="var(--color-bad)" fillOpacity={0.1} />
                    <Line dataKey="naive" name="naive" stroke="var(--color-naive)" dot={false}
                          strokeWidth={1.25} strokeDasharray="3 3" />
                    <Line dataKey="model" name="model" stroke="var(--color-brand-500)" dot={false} strokeWidth={1.6} />
                    <Line dataKey="actual" name="actual" stroke="var(--color-brand-900)" dot={false} strokeWidth={1.9} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
        </Card>

        {/* verdict for selected dept */}
        <Card className="lg:col-span-4" title="Read-out">
          {!selRow ? <Empty>Select a department.</Empty> : (
            <div className="space-y-3 text-[13.5px] leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="mono font-semibold">{selRow.dept}</span>
                <Pill tone={toneFor(selRow.fva)}>{sign(selRow.fva)}pp FVA</Pill>
              </div>
              <dl className="mono text-[11.5px] grid grid-cols-2 gap-y-1.5 text-muted">
                <dt>accuracy</dt><dd className="text-ink text-right">{selRow.fa}%</dd>
                <dt>naive</dt><dd className="text-ink text-right">{selRow.naiveFa}%</dd>
                <dt>bias</dt><dd className="text-ink text-right">{sign(selRow.bias)}%</dd>
                <dt>volume</dt><dd className="text-ink text-right">{selRow.volume.toLocaleString()}</dd>
              </dl>
              <p className="text-muted">
                {selRow.fva > 0
                  ? `The model beats the baseline here. ${selRow.dept} is low-volume and intermittent, so repeating last week is a poor guess and a fitted seasonal model has something to add.`
                  : `Repeating last week's same-weekday value beats the model on ${selRow.dept}. Retail demand is strongly weekly, and on volume this steady the baseline is hard to improve on. Keep the baseline in production here.`}
              </p>
            </div>
          )}
        </Card>

        {/* weekly trend */}
        <Card className="lg:col-span-12" title="Weekly accuracy · model vs naive"
          toolbar={<Pill tone="muted">weeks with ≥14 observations</Pill>}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend} margin={{ top: 6, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="week" tickFormatter={d => d.slice(5)} minTickGap={40}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis unit="%" domain={[40, 100]} width={46}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} />
                <Line dataKey="naiveFa" name="naive" stroke="var(--color-naive)" dot={false}
                      strokeWidth={1.4} strokeDasharray="4 3" />
                <Line dataKey="fa" name="model" stroke="var(--color-brand-500)" dot={false} strokeWidth={1.9} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <p className="mono text-[10.5px] text-muted mt-4 max-w-3xl leading-relaxed">
        Built on the public Walmart M5 competition dataset (California store 1). A demonstration of
        forecast-accuracy, bias and forecast-value-add measurement. Contains no employer data, systems or designs.
      </p>
    </div>
  )
}
