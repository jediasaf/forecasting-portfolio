import { useState } from 'react'
import { motion } from 'motion/react'
import Backtest from './Backtest.jsx'
import Planning from './Planning.jsx'
import Operations from './Operations.jsx'

const VIEWS = [
  ['backtest', 'Forecast backtest', 'Walk-forward accuracy & failure modes'],
  ['planning', 'Planning control tower', 'Forecast value add vs baseline'],
  ['operations', 'Operations', 'Airport capacity utilisation'],
]

function Shell({ view, setView }) {
  return (
    <header className="border-b border-line bg-surface sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 py-2.5">
          <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
               style={{ background: 'var(--color-ink)' }}>
            <span className="mono text-[10px] font-semibold text-white">JT</span>
          </div>
          <div className="min-w-0">
            <div className="mono text-[11px] font-semibold truncate">Jedidiah Tallulembang</div>
            <div className="mono text-[9.5px] text-muted truncate">Forecasting · operations research</div>
          </div>
          <a href="https://github.com/jediasaf" target="_blank" rel="noreferrer"
             className="ml-auto mono text-[10.5px] text-muted hover:text-ink transition-colors shrink-0">
            github ↗
          </a>
        </div>
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {VIEWS.map(([k, label, sub]) => {
            const on = view === k
            return (
              <button key={k} onClick={() => setView(k)}
                className="text-left px-3 py-2 border-b-2 transition-colors shrink-0"
                style={{ borderColor: on ? 'var(--color-ink)' : 'transparent' }}>
                <div className="mono text-[11px]" style={{ color: on ? 'var(--color-ink)' : 'var(--color-muted)' }}>
                  {label}
                </div>
                <div className="mono text-[9.5px] text-muted hidden sm:block">{sub}</div>
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [view, setView] = useState('backtest')
  return (
    <div className="min-h-screen">
      <Shell view={view} setView={setView} />
      <motion.div key={view}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .28, ease: [.22, .61, .36, 1] }}>
        {view === 'backtest' ? <Backtest /> : view === 'planning' ? <Planning /> : <Operations />}
      </motion.div>
    </div>
  )
}
