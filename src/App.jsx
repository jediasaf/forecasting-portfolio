import { useState } from 'react'
import Planning from './Planning.jsx'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Cell, LabelList, ReferenceLine
} from 'recharts'
import head from './data/headline.json'
import comparison from './data/comparison.json'
import daily from './data/dailySeries.json'
import monthly from './data/monthlySeries.json'
import pareto from './data/pareto.json'

const nf = (n) => n.toLocaleString()
const residualData = daily.map(d => ({ ...d, gapLo: Math.min(d.actual, d.forecast), gap: Math.abs(d.actual - d.forecast) }))

function Rule() { return <div className="h-px bg-rule" /> }

function Section({ eyebrow, title, children, id }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-28">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <h2 className="display text-4xl md:text-5xl font-bold mb-8 max-w-3xl">{title}</h2>
      {children}
    </section>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-paper px-3 py-2 mono text-xs leading-relaxed">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.filter(p => p.dataKey !== 'gapLo').map(p => (
        <div key={p.dataKey}>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</div>
      ))}
    </div>
  )
}

function Nav({ view, setView }) {
  const tabs = [['backtest', 'Forecast backtest'], ['planning', 'Planning control tower']]
  return (
    <nav className="border-b border-rule sticky top-0 bg-paper/95 backdrop-blur z-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex gap-8">
        {tabs.map(([k, label]) => (
          <button key={k} onClick={() => setView(k)}
            className="mono text-[11px] uppercase tracking-[0.14em] py-4 border-b-2 -mb-px transition-colors"
            style={{
              borderColor: view === k ? 'var(--color-ink)' : 'transparent',
              color: view === k ? 'var(--color-ink)' : 'var(--color-graphite)'
            }}>
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function App() {
  const [view, setView] = useState('backtest')
  const [dept, setDept] = useState(null)
  const worst = [...comparison].sort((a, b) => b.prophetWape - a.prophetWape)[0]

  if (view === 'planning') {
    return (
      <div className="min-h-screen">
        <Nav view={view} setView={setView} />
        <Planning />
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      <Nav view={view} setView={setView} />
      {/* ── HERO: the residual, not a vanity metric ────────────────── */}
      <header className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-4">
        <div className="eyebrow mb-6 rise">
          Jedidiah Tallulembang · Forecasting &amp; operations research
        </div>
        <h1 className="display text-[3.25rem] md:text-[5.5rem] font-bold max-w-4xl rise" style={{ animationDelay: '.05s' }}>
          Seven departments.<br />{nf(head.predictions)} forecasts.<br />
          <span className="text-residual">Here is where they were wrong.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-graphite rise" style={{ animationDelay: '.12s' }}>
          A walk-forward backtest on Walmart M5 retail demand, {head.folds} folds,
          {' '}{head.dateFrom} to {head.dateTo}. The shaded band below is forecast error —
          the gap between what the model predicted and what actually sold.
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pb-6 rise" style={{ animationDelay: '.2s' }}>
        <div className="eyebrow mb-2">
          FOODS_3 · daily · WAPE {comparison.find(c => c.dept === 'FOODS_3').prophetWape}% · shaded band = absolute error
        </div>
        <div className="h-[320px] md:h-[400px] border border-rule bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={residualData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="var(--color-rule)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                     tickFormatter={d => d.slice(5)} minTickGap={40} stroke="var(--color-rule)" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-rule)" width={52} />
              <Tooltip content={<ChartTip />} />
              <Area dataKey="gapLo" stackId="g" stroke="none" fill="transparent" isAnimationActive={false} name="_" />
              <Area dataKey="gap" stackId="g" stroke="none" fill="var(--color-residual)" fillOpacity={0.18} name="error" />
              <Line dataKey="actual" stroke="var(--color-actual)" dot={false} strokeWidth={1.75} name="actual" />
              <Line dataKey="forecast" stroke="var(--color-forecast)" dot={false} strokeWidth={1.5}
                    strokeDasharray="4 3" name="forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mono text-xs text-graphite mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <span><span className="inline-block w-3 h-px align-middle mr-2" style={{ background: 'var(--color-actual)' }} />actual units sold</span>
          <span><span className="inline-block w-3 h-px align-middle mr-2" style={{ background: 'var(--color-forecast)' }} />Prophet forecast</span>
          <span><span className="inline-block w-3 h-2 align-middle mr-2" style={{ background: 'var(--color-residual)', opacity: .18 }} />absolute error</span>
        </div>
      </div>

      <Rule />

      {/* ── THE HONEST COMPARISON ─────────────────────────────────── */}
      <Section id="models" eyebrow={`Model comparison · ${head.depts} departments`}
        title="Two models, and why the headline number lies">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-start">
          <div>
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparison} layout="vertical" margin={{ left: 8, right: 40 }}>
                  <CartesianGrid stroke="var(--color-rule)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                         stroke="var(--color-rule)" unit="%" />
                  <YAxis type="category" dataKey="dept" width={104}
                         tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-rule)" />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--color-rule)', opacity: .4 }} />
                  <ReferenceLine x={head.prophetWape} stroke="var(--color-graphite)" strokeDasharray="3 3" />
                  <Bar dataKey="prophetWape" name="Prophet WAPE (daily)" fill="var(--color-forecast)"
                       onMouseEnter={(_, i) => setDept(comparison[i].dept)} onMouseLeave={() => setDept(null)}>
                    {comparison.map((c) => (
                      <Cell key={c.dept} fill={c.prophetWape > 30 ? 'var(--color-residual)' : 'var(--color-forecast)'} />
                    ))}
                    <LabelList dataKey="prophetWape" position="right"
                               style={{ fontFamily: 'IBM Plex Mono', fontSize: 10 }} formatter={v => `${v}%`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mono text-xs text-graphite mt-3">
              Dashed line = pooled WAPE {head.prophetWape}%. Red = above 30%.
            </p>
          </div>

          <div className="space-y-6 text-[15px] leading-relaxed">
            <p>
              Elastic Net scores <span className="mono font-semibold">{head.elasticWape}%</span> WAPE and
              Prophet scores <span className="mono font-semibold">{head.prophetWape}%</span>. Quoting that
              as a four-fold improvement would be wrong.
            </p>
            <p>
              The Elastic Net ran on <strong>monthly</strong> aggregates; Prophet ran on <strong>daily</strong> series.
              Aggregation cancels noise, so the monthly figure is flattered by its granularity, not by the model.
              They answer different planning questions and are not directly comparable.
            </p>
            <div className="border-l-2 border-residual pl-4">
              <div className="eyebrow mb-1">Where it breaks</div>
              <p>
                <span className="mono">{worst.dept}</span> is the worst department at
                {' '}<span className="mono font-semibold">{worst.prophetWape}%</span>, averaging just
                {' '}<span className="mono">{worst.meanDaily}</span> units a day. Low-volume series are
                intermittent — mostly zeros with occasional spikes — and a smooth trend-plus-seasonality
                model has nothing useful to fit. Croston's method or a zero-inflated approach is the
                right tool there, not Prophet.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ── PRIORITISATION ────────────────────────────────────────── */}
      <Section id="prioritisation"
        eyebrow={`Revenue concentration · ${nf(head.skus)} SKUs`}
        title="A forecast is only useful if it changes what you stock">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-12 items-start">
          <div className="space-y-6 text-[15px] leading-relaxed">
            <p>
              Forecast accuracy alone does not tell a planner what to do. Ranking every SKU by a
              revenue-weighted seasonal priority score turns the forecast into a stocking decision.
            </p>
            <p>
              The top <span className="mono font-semibold">20%</span> of items by that score account for
              <span className="mono font-semibold"> {head.top20RevenuePct}%</span> of realised revenue —
              so effort spent forecasting the tail earns very little.
            </p>
            <p className="text-graphite">
              Predicted and actual revenue correlate at
              <span className="mono"> r = {head.revenueCorr}</span> across all {nf(head.skus)} items,
              which is what makes the ranking trustworthy enough to act on.
            </p>
          </div>
          <div className="h-[340px] border border-rule bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pareto} margin={{ top: 20, right: 24, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="var(--color-rule)" vertical={false} />
                <XAxis dataKey="itemsPct" unit="%" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                       stroke="var(--color-rule)" />
                <YAxis unit="%" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                       stroke="var(--color-rule)" width={48} />
                <Tooltip content={<ChartTip />} />
                <ReferenceLine x={20} stroke="var(--color-residual)" strokeDasharray="3 3" />
                <Area dataKey="revenuePct" name="revenue captured" stroke="var(--color-actual)"
                      strokeWidth={2} fill="var(--color-actual)" fillOpacity={0.1} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      <Rule />

      {/* ── OPERATIONS RESEARCH ───────────────────────────────────── */}
      <Section id="siting" eyebrow="Operations research · PuLP / CBC"
        title="Siting EV chargers as a binary program">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-5 text-[15px] leading-relaxed">
            <p>
              Given a set of candidate locations in Singapore, choose exactly <span className="mono">n</span> sites
              that are both far from existing chargers and well spread from each other. Two objectives that pull
              against one another.
            </p>
            <p>
              Coverage is straightforward to write down. Spread is not: maximising the <em>minimum</em> pairwise
              distance is not linear. It becomes linear by introducing <span className="mono">z</span> as a lower
              bound and releasing the constraint for any pair that is not selected.
            </p>
            <p className="text-graphite">
              A sweep over the weighting term returned the same five sites for every value in
              <span className="mono"> α ∈ [0.3, 0.6]</span> — the solution is not an artefact of how the two
              objectives were balanced.
            </p>
          </div>
          <div className="border border-rule bg-ink text-paper p-6 mono text-[12.5px] leading-relaxed overflow-x-auto">
            <div className="text-paper/40 mb-3"># objective: coverage gap + spatial spread</div>
            <pre className="whitespace-pre">{`model = pulp.LpProblem('EV_Site_Selection',
                       pulp.LpMaximize)

y = [LpVariable(f'y_{j}', cat='Binary')
     for j in range(k)]
z = LpVariable('z', lowBound=0)

model += gap_term + spread_term
model += lpSum(y) == n

# big-M: only binds when both i and j chosen
model += z <= D[i,j] + M*(2 - y[i] - y[j])`}</pre>
          </div>
        </div>
      </Section>

      <Rule />

      <footer className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="eyebrow mb-3">Contact</div>
        <p className="display text-3xl md:text-4xl font-bold mb-6">Jedidiah Asaf Tallulembang</p>
        <div className="mono text-sm text-graphite space-y-1">
          <div>jediasaf@gmail.com</div>
          <div>linkedin.com/in/jedidiahasaf</div>
          <div>github.com/jediasaf</div>
        </div>
        <p className="mono text-xs text-graphite mt-8 max-w-2xl">
          Data: Walmart M5 competition, California store 1. Backtest is walk-forward over {head.folds} folds;
          all figures on this page are computed from the stored prediction files, not restated from a report.
        </p>
      </footer>
    </main>
  )
}
