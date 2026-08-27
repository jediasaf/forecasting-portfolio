export function Panel({ title, toolbar, children, className = '', pad = true }) {
  return (
    <section className={`panel flex flex-col ${className}`}>
      {(title || toolbar) && (
        <header className="panel-head">
          <span className="panel-title">{title}</span>
          <div className="ml-auto flex items-center gap-1.5">{toolbar}</div>
        </header>
      )}
      <div className={pad ? 'p-4 flex-1 min-h-0' : 'flex-1 min-h-0'}>{children}</div>
    </section>
  )
}

export function Chip({ tone = 'muted', children }) {
  const map = {
    good: ['var(--color-good)', 'var(--color-good-bg)', 'var(--color-good-ring)'],
    warn: ['var(--color-warn)', 'var(--color-warn-bg)', 'var(--color-warn-ring)'],
    bad:  ['var(--color-bad)',  'var(--color-bad-bg)',  'var(--color-bad-ring)'],
    muted:['var(--color-muted)','var(--color-surface-2)','var(--color-line)'],
  }
  const [fg, bg, ring] = map[tone] || map.muted
  return <span className="chip" style={{ color: fg, background: bg, borderColor: ring }}>{children}</span>
}

export function Kpi({ label, value, unit, delta, tone = 'muted', note }) {
  const color = tone === 'bad' ? 'var(--color-bad)' : tone === 'good' ? 'var(--color-good)' : 'var(--color-ink)'
  return (
    <div className="panel p-4">
      <div className="flex items-start gap-2">
        <span className="panel-title">{label}</span>
        {delta && <span className="ml-auto">{delta}</span>}
      </div>
      <div className="display text-[2.1rem] font-bold mt-2 tnum" style={{ color }}>
        {value}<span className="text-base ml-0.5 font-semibold">{unit}</span>
      </div>
      {note && <p className="mono text-[10.5px] text-muted mt-1.5 leading-snug">{note}</p>}
    </div>
  )
}

export function ToolbarBtn({ active, children, ...p }) {
  return (
    <button {...p}
      className="mono text-[10.5px] px-2 py-1 rounded border transition-colors"
      style={{
        borderColor: active ? 'var(--color-model)' : 'var(--color-line)',
        background: active ? '#EEF2FF' : 'var(--color-surface)',
        color: active ? 'var(--color-model)' : 'var(--color-muted)',
      }}>
      {children}
    </button>
  )
}

export function Empty({ children }) { return <div className="empty">{children}</div> }
