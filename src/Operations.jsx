import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table'
import {
  ResponsiveContainer, ComposedChart, Bar, BarChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts'
import { Card, CardHead, Pill, Stat, Seg, Empty } from './ui.jsx'
import head from './data/opsHead.json'
import monthly from './data/opsMonthly.json'
import terminals from './data/opsTerminals.json'
import dow from './data/opsDow.json'
import heat from './data/opsHeat.json'
import airlines from './data/opsAirlines.json'
import arrdep from './data/opsArrDep.json'

const nf = n => n.toLocaleString()
const mn = m => m.slice(5)
const tone = v => (v >= 60 ? 'good' : v >= 52 ? 'warn' : 'bad')

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-lg"
         style={{ background: 'var(--color-ink)', color: '#fff' }}>
      <div className="opacity-60 mb-1 mono">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="mono">{p.name}: {p.value?.toLocaleString?.() ?? p.value}</div>
      ))}
    </div>
  )
}

const cols = [
  { accessorKey: 'airline', header: 'Airline', cell: i => <span className="font-semibold">{i.getValue()}</span> },
  { accessorKey: 'flights', header: 'Flights', cell: i => <span className="tnum" style={{ color: 'var(--color-muted)' }}>{nf(i.getValue())}</span> },
  { accessorKey: 'seats', header: 'Seats', cell: i => <span className="tnum" style={{ color: 'var(--color-muted)' }}>{nf(i.getValue())}</span> },
  { accessorKey: 'lf', header: 'Load factor', cell: i => <Pill tone={tone(i.getValue())}>{i.getValue()}%</Pill> },
]

export default function Operations() {
  const [sorting, setSorting] = useState([{ id: 'seats', desc: true }])
  const [split, setSplit] = useState('terminal')

  const table = useReactTable({
    data: airlines, columns: cols, state: { sorting }, onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
  })
  const heatByT = useMemo(() => {
    const t = {}; heat.forEach(h => { (t[h.terminal] ||= {})[h.month] = h.lf }); return t
  }, [])
  const months = monthly.map(m => m.month)
  const worst = [...monthly].sort((a, b) => a.lf - b.lf)[0]
  const best = [...monthly].sort((a, b) => b.lf - a.lf)[0]
  const split_data = split === 'terminal' ? terminals : dow
  const T3 = terminals.find(t => t.terminal === 'T3'), T2 = terminals.find(t => t.terminal === 'T2')

  // capsule bars: filled portion = load factor, hatched remainder = empty seats
  const capsules = split_data.map(r => ({ ...r, gap: 100 - r.lf, key: r.terminal || r.day }))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1 px-1">
        <div>
          <h1 className="text-[1.75rem] font-extrabold tracking-tight leading-tight">Operations</h1>
          <p className="card-sub">Airport capacity utilisation · {nf(head.flights)} movements · {head.year}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Pill tone="muted">{head.terminals} terminals</Pill>
          <Pill tone="muted">{head.airlines} airlines</Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat dark label="Seats flown empty" value={(100 - head.lf).toFixed(1)} unit="%"
              pill={<Pill tone="onDark">{(head.empty / 1e6).toFixed(1)}M seats</Pill>}
              foot="capacity unsold" />
        <Stat label="Load factor" value={head.lf} unit="%"
              pill={<Pill tone="warn">below 60%</Pill>} foot="pax ÷ seats" />
        <Stat label="Passengers" value={(head.pax / 1e6).toFixed(1)} unit="M"
              foot={`across ${nf(head.flights)} flights`} />
        <Stat label="Seasonal swing" value={(best.lf - worst.lf).toFixed(1)} unit="pp"
              pill={<Pill tone="muted">{mn(worst.month)} → {mn(best.month)}</Pill>}
              foot={`${worst.lf}% to ${best.lf}%`} />
      </div>

      <div className="grid lg:grid-cols-12 gap-3">
        <Card className="lg:col-span-8">
          <CardHead title="Load factor by month" sub="Bars show seats flown; line shows utilisation"
                    action={<Pill tone="muted">avg {head.lf}%</Pill>} />
          <div className="h-[268px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 12, right: 6, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mn} tickLine={false} axisLine={false}
                       tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-muted)' }} />
                <YAxis yAxisId="l" unit="%" domain={[40, 70]} width={40} tickLine={false} axisLine={false}
                       tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <YAxis yAxisId="r" orientation="right" width={44} tickLine={false} axisLine={false}
                       tickFormatter={v => `${(v / 1e6).toFixed(1)}M`}
                       tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <Tooltip content={<Tip />} cursor={{ fill: 'var(--color-surface-2)' }} />
                <ReferenceLine yAxisId="l" y={head.lf} stroke="var(--color-brand-300)" strokeDasharray="4 4" />
                <Bar yAxisId="r" dataKey="seats" name="seats" radius={[10, 10, 10, 10]} barSize={22}>
                  {monthly.map(m => (
                    <Cell key={m.month}
                          fill={m.lf === best.lf ? 'var(--color-brand-900)'
                              : m.lf >= head.lf ? 'var(--color-brand-500)' : 'url(#hatch)'} />
                  ))}
                </Bar>
                <Line yAxisId="l" dataKey="lf" name="load factor" stroke="var(--color-brand-900)"
                      strokeWidth={2.5} dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4">
          <CardHead title={split === 'terminal' ? 'By terminal' : 'By weekday'}
                    sub="Hatched portion is unsold capacity"
                    action={<Seg value={split} onChange={setSplit}
                      options={[{ value: 'terminal', label: 'Terminal' }, { value: 'dow', label: 'Day' }]} />} />
          <div className="h-[268px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capsules} margin={{ top: 18, right: 6, bottom: 4, left: 0 }} barSize={30}>
                <XAxis dataKey="key" tickLine={false} axisLine={false}
                       tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-muted)' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<Tip />} cursor={false} />
                <Bar dataKey="lf" name="load factor" stackId="a" radius={[0, 0, 10, 10]}>
                  {capsules.map(r => (
                    <Cell key={r.key} fill={r.lf >= 60 ? 'var(--color-brand-900)' : 'var(--color-brand-500)'} />
                  ))}
                </Bar>
                <Bar dataKey="gap" name="empty" stackId="a" radius={[10, 10, 0, 0]} fill="url(#hatch)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <CardHead title="Terminal × month" sub="Darker means better utilised" />
          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full text-[10.5px]">
              <thead>
                <tr>
                  <th></th>
                  {months.map(m => (
                    <th key={m} className="font-semibold p-1 text-center" style={{ color: 'var(--color-muted)' }}>{mn(m)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(heatByT).map(([t, row]) => (
                  <tr key={t}>
                    <td className="p-1 font-bold text-[11px]">{t}</td>
                    {months.map(m => {
                      const v = row[m]
                      const a = v == null ? 0 : Math.max(.1, (v - 38) / 28)
                      return (
                        <td key={m} className="p-[3px]">
                          <div className="rounded-lg text-center py-2 tnum font-semibold" title={`${t} ${m}: ${v}%`}
                               style={{ background: `rgba(46,158,98,${a})`, color: a > .62 ? '#fff' : 'var(--color-ink)' }}>
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
        </Card>

        <Card className="lg:col-span-5">
          <CardHead title="Read-out" sub="What the numbers imply" />
          <div className="px-4 pb-4 space-y-3 text-[13px] leading-relaxed">
            <p>
              A {head.lf}% load factor means <strong>{(head.empty / 1e6).toFixed(1)}M</strong> seats were flown
              and not sold. Capacity, not demand, is the binding constraint.
            </p>
            <div className="rounded-xl p-3" style={{ background: 'var(--color-brand-100)' }}>
              <p style={{ color: 'var(--color-brand-900)' }}>
                <strong>T3</strong> runs at <strong>{T3?.lf}%</strong> on the fewest movements;{' '}
                <strong>T2</strong> at <strong>{T2?.lf}%</strong>. Ten points of utilisation between
                terminals is a scheduling and allocation question before it is a demand question.
              </p>
            </div>
            <p style={{ color: 'var(--color-muted)' }}>
              Seasonality spans {(best.lf - worst.lf).toFixed(1)}pp. A capacity plan built on the annual
              average is wrong in both directions.
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <CardHead title="Airlines by seats flown" sub="Click a column to sort"
                    action={<Pill tone="muted">top 12</Pill>} />
          <div className="max-h-[268px] overflow-auto">
            <table className="grid">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>{hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="cursor-pointer select-none">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted()] ?? ''}
                    </th>
                  ))}</tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(r => (
                  <tr key={r.id}>{r.getVisibleCells().map(c => (
                    <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <CardHead title="Arrivals vs departures" sub="Directional imbalance by month" />
          <div className="h-[236px] px-3 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={arrdep} margin={{ top: 12, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={mn} tickLine={false} axisLine={false}
                       tick={{ fontSize: 11, fontWeight: 600, fill: 'var(--color-muted)' }} />
                <YAxis unit="%" domain={[40, 70]} width={40} tickLine={false} axisLine={false}
                       tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                <Tooltip content={<Tip />} />
                <Line dataKey="arrivals" name="arrivals" stroke="var(--color-brand-900)" strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#fff', strokeWidth: 2 }} />
                <Line dataKey="departures" name="departures" stroke="var(--color-brand-300)" strokeWidth={2.5}
                      dot={false} strokeDasharray="5 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <p className="text-[11px] px-1 pb-2" style={{ color: 'var(--color-muted)' }}>
        Public airport movement data, {head.year}. Load factor = passengers carried ÷ seats flown.
        No employer data, systems or designs.
      </p>
    </div>
  )
}
