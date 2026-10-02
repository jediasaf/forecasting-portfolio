import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, LineChart, Line, Legend
} from 'recharts'
import { Card, CardHead, Pill, Stat, Seg } from './ui.jsx'
import d from './data/ev.json'

/* The map is the point of this page: the faint cloud is where charging already is,
   and the marked points are the 26 the model puts down. Everything else explains it. */
const PAD = 0.012
const bounds = (() => {
  const pts = [...d.existing, ...d.sites]
  const la = pts.map(p => p.lat), lo = pts.map(p => p.lon)
  return {
    la0: Math.min(...la) - PAD, la1: Math.max(...la) + PAD,
    lo0: Math.min(...lo) - PAD, lo1: Math.max(...lo) + PAD,
  }
})()
const W = 1000
const H = Math.round(W * (bounds.la1 - bounds.la0) / (bounds.lo1 - bounds.lo0) / Math.cos(1.35 * Math.PI / 180))
const px = lon => ((lon - bounds.lo0) / (bounds.lo1 - bounds.lo0)) * W
const py = lat => H - ((lat - bounds.la0) / (bounds.la1 - bounds.la0)) * H

/* "SARIMA(1, 1, 2)x(1, 1, 0)" -> "SARIMA", but "Holt-Winters (Additive)" keeps its
   qualifier, because two Holt-Winters variants sit in the same ranking. */
const shortName = m => m
  .replace(/\([\d,\s]+\)(x\([\d,\s]+\))?/g, '')
  .replace(/\(([^)]+)\)/g, (_, w) => w.toLowerCase())
  .replace(/\s+/g, ' ')
  .trim()

function Tip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink text-white px-2.5 py-2 mono text-[11px] leading-relaxed rounded">
      <div className="opacity-60 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{unit}
        </div>
      ))}
    </div>
  )
}

export default function EvSiting() {
  const [metric, setMetric] = useState('rmse')
  const [hover, setHover] = useState(null)

  /* Ranking by RMSE and by MAPE do not agree. Sorting on the chosen metric is the
     whole demonstration, so the sort is the interaction. */
  const ranked = useMemo(
    () => [...d.models].sort((a, b) => a[metric] - b[metric]).slice(0, 8)
      .map(m => ({ ...m, short: shortName(m.model) })),
    [metric]
  )
  const best = ranked[0]
  const rmseWinner = [...d.models].sort((a, b) => a.rmse - b.rmse)[0]
  const mapeWinner = [...d.models].sort((a, b) => a.mape - b.mape)[0]

  const skipped = d.areas.find(a => a.candidates === 0)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">

      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[1.35rem] font-extrabold tracking-tight">
            Where to put the next charger
          </h1>
          <p className="text-[13px] mt-1 max-w-[64ch]" style={{ color: 'var(--color-muted)' }}>
            Singapore has {d.summary.existing_outlets.toLocaleString()} public charging outlets and they
            are not spread the way demand is. This picks {d.summary.sites_selected} new sites from
            {' '}{d.summary.candidate_carparks.toLocaleString()} HDB carparks with a binary
            mixed-integer program, trading how far residents currently walk against how far apart the
            new sites sit.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Pill tone="muted">PuLP / CBC</Pill>
          <Pill tone="muted">MILP</Pill>
          <Pill tone="good">public data</Pill>
        </div>
      </div>

      {/* ── the numbers ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="Planning areas" value={d.summary.planning_areas}
              foot={`${d.summary.under_served} under-served`} />
        <Stat label="Candidate carparks" value={d.summary.candidate_carparks.toLocaleString()}
              foot="the decision space" />
        <Stat label="Sites selected" value={d.summary.sites_selected}
              foot={`across ${d.summary.areas_sited} areas`} />
        <Stat label="Existing outlets" value={d.summary.existing_outlets.toLocaleString()}
              foot="plotted below" />
      </div>

      {/* ── the map: the one large visual moment ───────────────── */}
      <Card className="mb-5">
        <CardHead title="The existing network, and the 26 additions"
                  sub={`${d.summary.areas_sited} of the ${d.summary.under_served} under-served areas received sites`} />
        <div className="px-4 pb-1 flex items-center gap-4 text-[11.5px]"
             style={{ color: 'var(--color-muted)' }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-line)' }} />
            {d.existing.length.toLocaleString()} existing locations
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: 'var(--color-brand-700)' }} />
            {d.sites.length} selected sites
          </span>
        </div>
        <div className="px-4 pb-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img"
               aria-label={`Map of Singapore showing ${d.existing.length} existing charging locations and the ${d.sites.length} sites selected by the model.`}>
            {d.existing.map((p, i) => (
              <circle key={i} cx={px(p.lon)} cy={py(p.lat)} r={1.7}
                      fill="var(--color-line)" opacity={0.85} />
            ))}
            {d.sites.map((s, i) => {
              const on = hover === i
              return (
                <g key={s.id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <circle cx={px(s.lon)} cy={py(s.lat)} r={on ? 11 : 7}
                          fill="var(--color-brand-500)" fillOpacity={on ? 0.28 : 0.16} />
                  <circle cx={px(s.lon)} cy={py(s.lat)} r={on ? 4.4 : 3.4}
                          fill="var(--color-brand-700)" />
                </g>
              )
            })}
          </svg>
        </div>
        <div className="px-4 pb-4 min-h-[42px] text-[12.5px] leading-relaxed"
             style={{ color: 'var(--color-muted)' }}>
          {hover != null ? (
            <span>
              <strong className="mono" style={{ color: 'var(--color-ink)' }}>{d.sites[hover].id}</strong>
              {' · '}{d.sites[hover].address}{' · '}{d.sites[hover].pa}
              {' · '}nearest existing charger{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{Math.round(d.sites[hover].gap_m)} m</strong>
            </span>
          ) : (
            <span>
              The additions are pushed into the residential belt rather than the centre, which is
              where the network is thinnest relative to the people living under it. Hover a site for
              the carpark and its current walk to a charger.
            </span>
          )}
        </div>
      </Card>

      {/* ── how the areas were chosen ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-4 mb-5">
        <Card>
          <CardHead title="Which areas qualified" sub="the 11 under-served areas, ranked by access gap to the nearest charger" />
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left" style={{ color: 'var(--color-muted)' }}>
                  <th className="font-medium py-1.5 pl-4">Planning area</th>
                  <th className="font-medium text-right pl-3">Population</th>
                  <th className="font-medium text-right pl-3">Outlets</th>
                  <th className="font-medium text-right pl-3">EVs / outlet</th>
                  <th className="font-medium text-right pl-4">Access gap</th>
                  <th className="font-medium text-right pl-3 pr-4">Sited</th>
                </tr>
              </thead>
              <tbody>
                {d.areas.map(a => {
                  const s = d.sited.find(x => x.pa === a.pa)
                  return (
                    <tr key={a.pa} style={{ borderTop: '1px solid var(--color-line)' }}>
                      <td className="py-1.5 pl-4">{a.pa}</td>
                      <td className="mono text-right pl-3">{a.population.toLocaleString()}</td>
                      <td className="mono text-right pl-3">{a.outlets}</td>
                      <td className="mono text-right pl-3">{a.evs_per_outlet.toFixed(2)}</td>
                      <td className="mono text-right pl-4 whitespace-nowrap">{a.gap_km.toFixed(2)} km</td>
                      <td className="mono text-right pl-3 pr-4"
                          style={{ color: s ? 'var(--color-ink)' : 'var(--color-bad)' }}>
                        {s ? s.sites : '0'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {skipped && (
            <div className="px-4 py-3 text-[12.5px] leading-relaxed"
                 style={{ color: 'var(--color-muted)' }}>
              <strong style={{ color: 'var(--color-ink)' }}>{skipped.pa}</strong> has the worst access
              gap of any area at {skipped.gap_km} km and {skipped.evs_per_outlet} EVs per outlet, and
              it receives nothing. It has {skipped.candidates} candidate carparks in the dataset,
              because the candidate set is HDB carparks and {skipped.pa} is largely private housing.
              The model can only choose from what it is given, and that is a property of the data,
              not of the need.
            </div>
          )}
        </Card>

        <Card>
          <CardHead title="What the objective trades" sub="coverage gap against spatial spread" />
          <div className="p-4 pt-0 text-[12.5px] leading-relaxed"
               style={{ color: 'var(--color-muted)' }}>
            <p className="mb-3">
              Picking the <em>n</em> carparks furthest from a charger clusters them, because
              under-served pockets are contiguous. The objective adds a second term: the minimum
              pairwise distance among the chosen sites, linearised with a big-M constraint so a
              minimum can live in a linear program.
            </p>
            <div className="mono text-[11.5px] p-3 rounded leading-relaxed mb-3"
                 style={{ background: 'var(--color-surface-2)', color: 'var(--color-ink)' }}>
              max &nbsp;(α / n·d<sub>max</sub>) Σ gap<sub>j</sub>·y<sub>j</sub> &nbsp;+&nbsp; (1−α)/d<sub>ref</sub> · z<br />
              s.t. &nbsp;Σ y<sub>j</sub> = n<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;z ≤ D<sub>ij</sub> + M(2 − y<sub>i</sub> − y<sub>j</sub>) &nbsp;∀ i&lt;j<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y<sub>j</sub> ∈ &#123;0,1&#125;, z ≥ 0
            </div>
            <p>
              Both terms are normalised per area, so α means the same thing in Yishun as in Bishan.
              In the sensitivity run on a single area, the same five sites came out for every
              α in [0.3, 0.6]. That is a check on one area, not a guarantee for all ten.
            </p>
          </div>
        </Card>
      </div>

      {/* ── the forecasting half ───────────────────────────────── */}
      <Card className="mb-5">
        <CardHead
          title="How many chargers will be needed"
          sub={`${d.summary.models_benchmarked} models benchmarked · best on ${metric.toUpperCase()}: ${best?.short}`}
          action={
            <Seg value={metric} onChange={setMetric} options={[
              { value: 'rmse', label: 'RMSE' },
              { value: 'mape', label: 'MAPE' },
            ]} />
          } />
        <div className="h-[260px] px-2 pb-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranked} layout="vertical"
                      margin={{ top: 8, right: 28, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" horizontal={false} stroke="var(--color-line)" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="short" width={140} tick={{ fontSize: 11 }}
                     tickLine={false} axisLine={false} />
              <Tooltip content={<Tip unit={metric === 'mape' ? '%' : ''} />}
                       cursor={{ fill: 'rgba(0,0,0,.04)' }} />
              <Bar dataKey={metric} name={metric.toUpperCase()} radius={[0, 4, 4, 0]}>
                {ranked.map((r, i) => (
                  <Cell key={i} fill={i === 0 ? 'var(--color-brand-500)' : 'var(--color-brand-100)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="px-4 pb-4 text-[12.5px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          The two metrics disagree about the winner.{' '}
          <strong style={{ color: 'var(--color-ink)' }}>{rmseWinner.model}</strong> takes RMSE at{' '}
          {rmseWinner.rmse} while <strong style={{ color: 'var(--color-ink)' }}>{mapeWinner.model}</strong>
          {' '}takes MAPE at {mapeWinner.mape}%. RMSE punishes the large misses, the biggest of which in
          the held-out window is December 2024; MAPE weights every month the same and so prefers the model that is steadier
          in the quiet months. Neither is wrong. Choosing one before seeing the ranking is what keeps
          the comparison honest.
        </div>
      </Card>

      {/* ── forward view ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card>
          <CardHead title="Backtest" sub="held-out months, actual against the two leaders" />
          <div className="h-[200px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.backtest} margin={{ top: 14, right: 18, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--color-line)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="actual" name="Actual" strokeWidth={2.2}
                      stroke="var(--color-actual)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="sarima" name="SARIMA" strokeWidth={1.6}
                      stroke="var(--color-model)" dot={false} />
                <Line type="monotone" dataKey="hw" name="Holt-Winters" strokeWidth={1.6}
                      stroke="var(--color-naive)" strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHead title="Forward forecast" sub="new EV registrations per month" />
          <div className="h-[200px] px-2 pb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.future} margin={{ top: 14, right: 18, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--color-line)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="sarima" name="SARIMA" strokeWidth={2}
                      stroke="var(--color-model)" dot={false} />
                <Line type="monotone" dataKey="hw" name="Holt-Winters" strokeWidth={1.6}
                      stroke="var(--color-brand-500)" dot={false} />
                <Line type="monotone" dataKey="prophet" name="Prophet" strokeWidth={1.6}
                      stroke="var(--color-naive)" strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── honest status ──────────────────────────────────────── */}
      <Card>
        <CardHead title="What this model is, and is not" sub="stated so the scope is not overread" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 pt-0 text-[12.5px] leading-relaxed">
          <div>
            <div className="font-semibold mb-1.5" style={{ color: 'var(--color-ink)' }}>In the model</div>
            <ul className="space-y-1" style={{ color: 'var(--color-muted)' }}>
              <li>Binary site-selection MILP solved per planning area with PuLP and CBC.</li>
              <li>A cardinality constraint fixing how many sites each area receives.</li>
              <li>A big-M linearisation of the minimum pairwise distance between chosen sites.</li>
              <li>Per-area normalisation of both objective terms, and a sweep of the weighting α.</li>
              <li>A 15-model forecast benchmark sizing how much new demand is coming.</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1.5" style={{ color: 'var(--color-ink)' }}>Not in the model</div>
            <ul className="space-y-1" style={{ color: 'var(--color-muted)' }}>
              <li>No station capacity, no queueing, no utilisation limit per site.</li>
              <li>No build cost, no budget constraint, and so no cost-benefit ranking.</li>
              <li>No dual values or shadow prices: the sensitivity here is a sweep of α, not duals.</li>
              <li>Candidates are HDB carparks only, which excludes private housing entirely.</li>
            </ul>
          </div>
        </div>
        <div className="px-4 pb-4 text-[12.5px]" style={{ color: 'var(--color-muted)' }}>
          Group coursework for SMU ISSS604, Applied Data Science in Operations (Group 5), on
          public LTA, HDB and Singstat data. The optimisation and routing workstream is mine.
          Code at{' '}
          <a className="underline underline-offset-2" style={{ color: 'var(--color-brand-700)' }}
             href="https://github.com/jediasaf/ev-charging-site-optimisation"
             target="_blank" rel="noopener noreferrer">
            github.com/jediasaf/ev-charging-site-optimisation
          </a>.
        </div>
      </Card>
    </div>
  )
}
