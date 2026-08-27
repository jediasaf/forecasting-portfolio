import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender
} from '@tanstack/react-table'
import {
  ResponsiveContainer, ComposedChart, Area, Line, Bar, BarChart, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine, LabelList
} from 'recharts'
import { Panel, Chip, Kpi, ToolbarBtn, Empty } from './ui.jsx'
import head from './data/opsHead.json'
import monthly from './data/opsMonthly.json'
import terminals from './data/opsTerminals.json'
import dow from './data/opsDow.json'
import heat from './data/opsHeat.json'
import airlines from './data/opsAirlines.json'
import arrdep from './data/opsArrDep.json'

const nf = n => n.toLocaleString()
const mn = m => m.slice(5)
const lfTone = v => (v >= 60 ? 'good' : v >= 50 ? 'warn' : 'bad')

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white px-2.5 py-2 mono text-[11px] leading-relaxed rounded">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  )
}

const cols = [
  { accessorKey: 'airline', header: 'Airline', cell: i => <span className="mono">{i.getValue()}</span> },
  { accessorKey: 'flights', header: 'Flights', cell: i => <span className="tnum text-muted">{nf(i.getValue())}</span> },
  { accessorKey: 'seats', header: 'Seats', cell: i => <span className="tnum text-muted">{nf(i.getValue())}</span> },
  { accessorKey: 'lf', header: 'Load factor', cell: i => <Chip tone={lfTone(i.getValue())}>{i.getValue()}%</Chip> },
]

export default function Operations() {
  const [sorting, setSorting] = useState([{ id: 'seats', desc: true }])
  const [split, setSplit] = useState('terminal')   // terminal | dow
  const [selT, setSelT] = useState(null)

  const table = useReactTable({
    data: airlines, columns: cols, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  })

  const heatByT = useMemo(() => {
    const t = {}
    heat.forEach(h => { (t[h.terminal] ||= {})[h.month] = h.lf })
    return t
  }, [])
  const months = useMemo(() => monthly.map(m => m.month), [])
  const emptyPct = (100 - head.lf).toFixed(1)
  const worst = [...monthly].sort((a, b) => a.lf - b.lf)[0]
  const best = [...monthly].sort((a, b) => b.lf - a.lf)[0]

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-5">
        <div>
          <div className="panel-title mb-1">Airport operations · capacity utilisation</div>
          <h1 className="display text-2xl md:text-[1.9rem] font-bold">
            {emptyPct}% of seats flew empty
          </h1>
        </div>
        <div className="mono text-[11px] text-muted ml-auto flex flex-wrap gap-x-4 gap-y-1">
          <span>{nf(head.flights)} flights</span>
          <span>{head.terminals} terminals</span>
          <span>{head.airlines} airlines</span>
          <span>{head.year}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <Kpi label="Load factor" value={head.lf} unit="%" tone="warn"
             delta={<Chip tone="warn">below 60%</Chip>}
             note="Passengers carried ÷ seats flown" />
        <Kpi label="Passengers" value={(head.pax / 1e6).toFixed(1)} unit="M"
             note={`Across ${nf(head.flights)} movements`} />
        <Kpi label="Empty seats" value={(head.empty / 1e6).toFixed(1)} unit="M" tone="bad"
             note="Capacity flown and unsold" />
        <Kpi label="Seasonal swing" value={(best.lf - worst.lf).toFixed(1)} unit="pp"
             delta={<Chip tone="muted">{mn(worst.month)} → {mn(best.month)}</Chip>}
             note={`${worst.lf}% in ${mn(worst.month)}, ${best.lf}% in ${mn(best.month)}`} />
      </div>

      <div className="grid lg:grid-cols-12 gap-3">
        <Panel className="lg:col-span-8" title="Load factor and capacity by month"
          toolbar={<Chip tone="muted">bars = seats flown</Chip>}>
          <motion.div className="h-[280px]"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .45, ease: [.22, .61, .36, 1] }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 6, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mn} tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis yAxisId="l" unit="%" domain={[40, 70]} width={44}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis yAxisId="r" orientation="right" width={52} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine yAxisId="l" y={head.lf} stroke="var(--color-muted)" strokeDasharray="3 3" />
                <Bar yAxisId="r" dataKey="seats" name="seats" fill="var(--color-line)" />
                <Line yAxisId="l" dataKey="lf" name="load factor" stroke="var(--color-model)"
                      strokeWidth={2} dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </Panel>

        <Panel className="lg:col-span-4"
          title={split === 'terminal' ? 'By terminal' : 'By day of week'}
          toolbar={<>
            <ToolbarBtn active={split === 'terminal'} onClick={() => setSplit('terminal')}>terminal</ToolbarBtn>
            <ToolbarBtn active={split === 'dow'} onClick={() => setSplit('dow')}>weekday</ToolbarBtn>
          </>}>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={split === 'terminal' ? terminals : dow}
                        margin={{ top: 16, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey={split === 'terminal' ? 'terminal' : 'day'}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis unit="%" domain={[40, 70]} width={44}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine y={head.lf} stroke="var(--color-muted)" strokeDasharray="3 3" />
                <Bar dataKey="lf" name="load factor"
                     onClick={(_, i) => split === 'terminal' && setSelT(terminals[i].terminal)}
                     cursor={split === 'terminal' ? 'pointer' : 'default'}>
                  {(split === 'terminal' ? terminals : dow).map((r, i) => (
                    <Cell key={i} fill={
                      r.lf >= 60 ? 'var(--color-good)' : r.lf >= 52 ? 'var(--color-model)' : 'var(--color-bad)'} />
                  ))}
                  <LabelList dataKey="lf" position="top" formatter={v => `${v}%`}
                             style={{ fontFamily: 'IBM Plex Mono', fontSize: 10 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* heat grid — terminal x month */}
        <Panel className="lg:col-span-7" title="Load factor · terminal × month"
          toolbar={<div className="flex items-center gap-1.5 mono text-[9.5px] text-muted">
            <span>low</span>
            {[44, 50, 56, 62].map(v => (
              <span key={v} className="w-4 h-3 inline-block rounded-sm" style={{
                background: 'var(--color-model)', opacity: (v - 40) / 26
              }} />
            ))}
            <span>high</span>
          </div>}>
          <div className="overflow-x-auto">
            <table className="w-full mono text-[10.5px]">
              <thead>
                <tr>
                  <th className="text-left font-medium text-muted p-1"></th>
                  {months.map(m => <th key={m} className="font-medium text-muted p-1 text-center">{mn(m)}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(heatByT).map(([t, row]) => (
                  <tr key={t}>
                    <td className="p-1 font-semibold">{t}</td>
                    {months.map(m => {
                      const v = row[m]
                      return (
                        <td key={m} className="p-0.5">
                          <div className="rounded-sm text-center py-1.5 tnum"
                               title={`${t} ${m}: ${v}%`}
                               style={{
                                 background: 'var(--color-model)',
                                 opacity: v == null ? 0.04 : Math.max(.08, (v - 38) / 28),
                                 color: v >= 55 ? '#fff' : 'var(--color-ink)',
                               }}>
                            {v ?? '–'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="lg:col-span-5" title="Read-out">
          <div className="space-y-3 text-[13.5px] leading-relaxed">
            <p>
              A {head.lf}% load factor means <span className="mono font-semibold">{(head.empty / 1e6).toFixed(1)}M</span>{' '}
              seats were flown and not sold. Capacity, not demand, is the binding constraint here.
            </p>
            <div className="border-l-2 pl-3" style={{ borderColor: 'var(--color-good)' }}>
              <p>
                <span className="mono font-semibold">T3</span> runs at{' '}
                <span className="mono font-semibold">{terminals.find(t => t.terminal === 'T3')?.lf}%</span> on
                the fewest movements, while <span className="mono font-semibold">T2</span> runs at{' '}
                <span className="mono font-semibold">{terminals.find(t => t.terminal === 'T2')?.lf}%</span>.
                Roughly 10 points of utilisation separate them — a scheduling and allocation question
                before it is a demand question.
              </p>
            </div>
            <p className="text-muted">
              Seasonality is large: {worst.lf}% in {mn(worst.month)} against {best.lf}% in {mn(best.month)},
              a {(best.lf - worst.lf).toFixed(1)}pp swing. Any capacity plan built on the annual average
              will be wrong in both directions.
            </p>
          </div>
        </Panel>

        <Panel className="lg:col-span-5" title="Top airlines by seats flown" pad={false}
          toolbar={<Chip tone="muted">sortable</Chip>}>
          <div className="max-h-[290px] overflow-auto">
            <table className="grid">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(h => (
                      <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none">
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

        <Panel className="lg:col-span-7" title="Arrivals vs departures · load factor by month"
          toolbar={<Chip tone="muted">directional imbalance</Chip>}>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={arrdep} margin={{ top: 6, right: 10, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mn} tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <YAxis unit="%" domain={[40, 70]} width={44}
                       tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono' }} stroke="var(--color-line)" />
                <Tooltip content={<Tip />} />
                <Line dataKey="arrivals" name="arrivals" stroke="var(--color-actual)" strokeWidth={1.8} dot={false} />
                <Line dataKey="departures" name="departures" stroke="var(--color-model)" strokeWidth={1.8}
                      dot={false} strokeDasharray="4 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <p className="mono text-[10.5px] text-muted mt-4 max-w-3xl leading-relaxed">
        Public airport movement data, {head.year}. Load factor = passengers carried ÷ seats flown.
        Contains no employer data, systems or designs.
      </p>
    </div>
  )
}
