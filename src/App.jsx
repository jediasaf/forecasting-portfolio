import { useState, lazy, Suspense } from 'react'
import { motion } from 'motion/react'
import { Hatch } from './ui.jsx'
import Backtest from './Backtest.jsx'
const Planning   = lazy(() => import('./Planning.jsx'))
const Operations = lazy(() => import('./Operations.jsx'))
const Fnb        = lazy(() => import('./Fnb.jsx'))

function Loading() {
  return <div className="card p-8 text-center text-[13px]" style={{ color: 'var(--color-muted)' }}>Loading…</div>
}

const NAV = [
  { k: 'backtest',   label: 'Forecast backtest', icon: '◱', badge: '2.1k' },
  { k: 'planning',   label: 'Value add',         icon: '◧' },
  { k: 'operations', label: 'Operations',        icon: '◨' },
  { k: 'fnb',        label: 'F&B trading',       icon: '◩' },
]

function Sidebar({ view, setView, open, close }) {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-[232px] shrink-0 p-3 transition-transform
                  ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      style={{ background: 'var(--color-ground)' }}>
      <div className="card h-full flex flex-col p-4">
        <div className="flex items-center gap-2.5 px-1 pb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'var(--color-brand-700)' }}>
            <span className="text-white font-extrabold text-[13px]">JT</span>
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-[.95rem] leading-tight truncate">Jedidiah</div>
            <div className="card-sub truncate">Forecasting &amp; OR</div>
          </div>
        </div>

        <div className="navlabel px-2 pb-2">Dashboards</div>
        <nav className="flex flex-col gap-1 pl-3">
          {NAV.map(n => (
            <button key={n.k} data-on={view === n.k ? '1' : '0'} className="navitem"
                    onClick={() => { setView(n.k); close() }}>
              <span className="text-[15px] leading-none opacity-70">{n.icon}</span>
              <span className="truncate flex-1">{n.label}</span>
              {n.badge && (
                <span className="ml-auto text-[.62rem] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-900)' }}>
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="navlabel px-2 pt-6 pb-2">Links</div>
        <nav className="flex flex-col gap-1 pl-3">
          <a className="navitem" href="https://github.com/jediasaf" target="_blank" rel="noreferrer">
            <span className="text-[15px] leading-none opacity-70">◆</span>GitHub
          </a>
          <a className="navitem" href="https://linkedin.com/in/jedidiahasaf" target="_blank" rel="noreferrer">
            <span className="text-[15px] leading-none opacity-70">◇</span>LinkedIn
          </a>
        </nav>

        <div className="mt-auto card-dark p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[.14]"
               style={{ background: 'radial-gradient(120px 90px at 78% 18%, #fff, transparent 70%)' }} />
          <div className="relative">
            <p className="text-[.78rem] font-bold leading-snug">Every figure here is computed from data, not restated.</p>
            <p className="text-[.68rem] mt-1.5" style={{ color: 'rgba(255,255,255,.62)' }}>
              Public datasets only.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  const [view, setView] = useState('backtest')
  const [open, setOpen] = useState(false)
  const active = NAV.find(n => n.k === view)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-ground)' }}>
      <Hatch />
      {open && <div className="fixed inset-0 bg-black/25 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <Sidebar view={view} setView={setView} open={open} close={() => setOpen(false)} />

      <div className="flex-1 min-w-0 p-3 lg:pl-0">
        {/* top bar */}
        <div className="card flex items-center gap-3 px-3 py-2.5 mb-3">
          <button className="iconbtn lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full min-w-0 flex-1 max-w-[380px]"
               style={{ background: 'var(--color-surface-2)' }}>
            <span className="opacity-40 text-[13px]">⌕</span>
            <span className="text-[.8rem] truncate" style={{ color: 'var(--color-muted)' }}>
              {active?.label}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="iconbtn" aria-hidden>◔</span>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-[11px]"
                   style={{ background: 'var(--color-brand-500)' }}>JT</div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[.78rem] font-bold">Jedidiah Tallulembang</div>
                <div className="text-[.68rem]" style={{ color: 'var(--color-muted)' }}>jediasaf@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        <motion.div key={view}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .3, ease: [.22, .61, .36, 1] }}>
          <Suspense fallback={<Loading />}>
            {view === 'backtest' ? <Backtest /> : view === 'planning' ? <Planning />
              : view === 'operations' ? <Operations /> : <Fnb />}
          </Suspense>
        </motion.div>
      </div>
    </div>
  )
}
