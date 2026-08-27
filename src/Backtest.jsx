import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender
} from '@tanstack/react-table'
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, ReferenceLine, LabelList
} from 'recharts'
import { Panel, Chip, Kpi, ToolbarBtn, Empty } from './ui.jsx'
import head from './data/headline.json'
import comparison from './data/comparison.json'
import daily from './data/dailySeries.json'
import pareto from './data/pareto.json'

const nf = n => n.toLocaleString()
const resid = daily.map(d => ({ ...d, gapLo: Math.min(d.actual, d.forecast), gap: Math.abs(d.actual - d.forecast) }))

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white px-2.5 py-2 mono text-[11px] leading-relaxed rounded">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.filter(p => p.dataKey !== 'gapLo').map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString?.() ?? p.value}</div>
      ))}
    </div>
  )
}

const cols = [
  { accessorKey: 'dept', header: 'Dept', cell: i => <span className="mono">{i.getValue()}</span> },
  { accessorKey: 'meanDaily', header: 'Mean/day', cell: i => <span className="tnum text-muted">{i.getValue()}</span> },
  { accessorKey: 'prophetWape', header: 'Prophet', cell: i =>
      <Chip tone={i.getValue() > 30 ? 'bad' : i.getValue() > 22 ? 'warn' : 'good'}>{i.getValue()}%</Chip> },
  { accessorKey: 'elasticWape', header: 'Elastic Net', cell: i =>
      <Chip tone={i.getValue() > 30 ? 'bad' : i.getValue() > 22 ? 'warn' : 'good'}>{i.getValue()}%</Chip> },
]

export default function Backtest() {
  const [sorting, setSorting] = useState([{ id: 'prophetWape', desc: true }])
  const [span, setSpan] = useState(270)

  const table = useReactTable({
    data: comparison, columns: cols, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  })
  const view = useMemo(() => resid.slice(-span), [span])
  const worst = [...comparison].sort((a, b) => b.prophetWape - a.prophetWape)[0]

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-5">
        <div>
          <div className="panel-title mb-1">Walk-forward backtest · Walmart M5</div>
          <h1 className="display text-2xl md:text-[1.9rem] font-bold">
            Where the forecasts were wrong
          </h1>
        </div>
        <div className="mono text-[11px] text-muted ml-auto flex flex-wrap gap-x-4 gap-y-1">
          <span>{nf(head.predictions)} forecasts</span>
          <span>{head.depts} departments</span>
          <span>{head.folds} folds</span>
          <span>{head.dateFrom} → {head.dateTo}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi label="Prophet · daily" value={head.prophetWape} unit="%" note="WAPE, pooled across departments" />
        <Kpi label="Elastic Net · monthly" value={head.elasticWape} unit="%"
             delta={<Chip tone="warn">not comparable</Chip>}
             note="Monthly aggregation cancels noise — different question" />
        <Kpi label="Worst department" value={worst.prophetWape} unit="%" tone="bad"
             delta={<Chip tone="bad">{worst.dept}</Chip>}
             note={`${worst.meanDaily} units/day — intermittent demand`} />
        <Kpi label="Revenue in top 20%" value={head.top20RevenuePct} unit="%" tone="good"
             note={`Of ${nf(head.skus)} SKUs, ranked by priority score`} />
      </div>

      <div className="grid lg:grid-cols-12 gap-3">
        {/* signature: the residual band */}
        <Panel className="lg:col-span-12"
          title={`FOODS_3 · actual vs forecast · shaded band = absolute error`}
          toolbar={<>
            {[90, 180, 270].map(s => (
              <ToolbarBtn key={s} active={span === s} onClick={() => setSpan(s)}>{s}d</ToolbarBtn>
            ))}
          </>}>
          {view.length === 0 ? <Empty>No observations in this window.</Empty> : (
            <motion.div className="h-[300px]"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .5, ease: [.22, .61, .36, 1] }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={view} margin={{ top: 6, right: 10, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke="var(--color-line)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={d => d.slice(5)} minTickGap={44}
                         tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" width={48} />
                  <Tooltip content={<Tip />} />
                  <Area dataKey="gapLo" stackId="g" stroke="none" fill="transparent" isAnimationActive={false} name="_" />
                  <Area dataKey="gap" stackId="g" stroke="none" fill="var(--color-bad)" fillOpacity={0.14} name="abs error" />
                  <Line dataKey="forecast" name="forecast" stroke="var(--color-model)" dot={false}
                        strokeWidth={1.5} strokeDasharray="4 3" />
                  <Line dataKey="actual" name="actual" stroke="var(--color-actual)" dot={false} strokeWidth={1.9} />
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </Panel>

        <Panel className="lg:col-span-5" title="Departments · sortable" pad={false}
          toolbar={<Chip tone="muted">click a header</Chip>}>
          <div className="max-h-[300px] overflow-auto">
            <table className="grid">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                          className="cursor-pointer select-none">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: ' ▲', desc: ' ▼' }[h.column.getIsSorted()] ?? ''}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(r => (
                  <tr key={r.id}>
                    {r.getVisibleCells().map(c => (
                      <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="lg:col-span-7" title="Prophet WAPE by department"
          toolbar={<Chip tone="muted">dashed = pooled {head.prophetWape}%</Chip>}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} layout="vertical" margin={{ left: 4, right: 44, top: 4, bottom: 4 }}>
                <CartesianGrid stroke="var(--color-line)" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis type="category" dataKey="dept" width={96}
                       tick={{ fontSize: 10.5, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine x={head.prophetWape} stroke="var(--color-muted)" strokeDasharray="3 3" />
                <Bar dataKey="prophetWape" name="WAPE">
                  {comparison.map(c => (
                    <Cell key={c.dept} fill={c.prophetWape > 30 ? 'var(--color-bad)' : 'var(--color-model)'} />
                  ))}
                  <LabelList dataKey="prophetWape" position="right" formatter={v => `${v}%`}
                             style={{ fontFamily: 'IBM Plex Mono', fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="lg:col-span-7" title={`Revenue concentration · ${nf(head.skus)} SKUs`}
          toolbar={<Chip tone="good">r = {head.revenueCorr}</Chip>}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pareto} margin={{ top: 6, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="itemsPct" unit="%" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis unit="%" width={46} tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} />
                <ReferenceLine x={20} stroke="var(--color-bad)" strokeDasharray="3 3" />
                <Area dataKey="revenuePct" name="revenue captured" stroke="var(--color-actual)"
                      strokeWidth={2} fill="var(--color-actual)" fillOpacity={0.1} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="lg:col-span-5" title="Read-out">
          <div className="space-y-3 text-[13.5px] leading-relaxed">
            <p>
              Elastic Net scores <span className="mono font-semibold">{head.elasticWape}%</span> and Prophet
              {' '}<span className="mono font-semibold">{head.prophetWape}%</span>. Quoting that as a four-fold
              improvement would be wrong — one ran on monthly aggregates, the other on daily series.
            </p>
            <div className="border-l-2 pl-3" style={{ borderColor: 'var(--color-bad)' }}>
              <p>
                <span className="mono font-semibold">{worst.dept}</span> fails at
                {' '}<span className="mono font-semibold">{worst.prophetWape}%</span> on
                {' '}<span className="mono">{worst.meanDaily}</span> units/day. Intermittent demand —
                mostly zeros with spikes — has nothing for a trend-plus-seasonality model to fit.
                Croston's method is the right tool.
              </p>
            </div>
            <p className="text-muted">
              Top {20}% of SKUs by priority score carry {head.top20RevenuePct}% of revenue, so effort
              spent forecasting the tail earns very little.
            </p>
          </div>
        </Panel>
      </div>

      <p className="mono text-[10.5px] text-muted mt-4 max-w-3xl leading-relaxed">
        Public Walmart M5 competition data, California store 1. Every figure computed from stored
        prediction files at build time. No employer data, systems or designs are used.
      </p>
    </div>
  )
}
