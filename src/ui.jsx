/* Shared hatch patterns — hatching always means "the part that isn't filled". */
export function Hatch() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#EDF1EF" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#CBD8D1" strokeWidth="3.5" />
        </pattern>
        <pattern id="hatchWarn" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#FDF0DF" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#EFCB9B" strokeWidth="3.5" />
        </pattern>
      </defs>
    </svg>
  )
}

export function Card({ children, className = '', dark = false }) {
  return <section className={`${dark ? 'card-dark' : 'card'} ${className}`}>{children}</section>
}

export function CardHead({ title, sub, action }) {
  return (
    <header className="card-head">
      <div className="min-w-0">
        <h3 className="card-title truncate">{title}</h3>
        {sub && <p className="card-sub truncate">{sub}</p>}
      </div>
      <div className="ml-auto flex items-center gap-1.5 shrink-0">{action}</div>
    </header>
  )
}

export function Pill({ tone = 'muted', children }) {
  const map = {
    good:  ['var(--color-good)', 'var(--color-good-bg)'],
    warn:  ['var(--color-warn)', 'var(--color-warn-bg)'],
    bad:   ['var(--color-bad)',  'var(--color-bad-bg)'],
    muted: ['var(--color-muted)', 'var(--color-surface-2)'],
    onDark:['#fff', 'rgba(255,255,255,.16)'],
  }
  const [fg, bg] = map[tone] || map.muted
  return <span className="pill" style={{ color: fg, background: bg }}>{children}</span>
}

export function Stat({ label, value, unit, foot, pill, dark = false }) {
  return (
    <Card dark={dark} className="p-5 flex flex-col min-h-[142px]">
      <div className="flex items-start gap-2">
        <span className="text-[.86rem] font-semibold" style={{ color: dark ? 'rgba(255,255,255,.82)' : 'var(--color-ink)' }}>
          {label}
        </span>
        <span className="ml-auto iconbtn" style={dark ? {
          borderColor: 'rgba(255,255,255,.25)', background: 'transparent', color: '#fff'
        } : undefined} aria-hidden>↗</span>
      </div>
      <div className="mt-auto pt-3">
        <div className="text-[2.55rem] font-extrabold leading-none tnum tracking-tight">
          {value}<span className="text-[1.1rem] font-bold ml-0.5">{unit}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap min-h-[20px]">
          {pill}
          {foot && (
            <span className="text-[.72rem] font-medium"
                  style={{ color: dark ? 'rgba(255,255,255,.66)' : 'var(--color-muted)' }}>
              {foot}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export function Seg({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-full" style={{ background: 'var(--color-surface-2)' }}>
      {options.map(o => {
        const on = o.value === value
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            className="text-[.7rem] font-semibold px-2.5 py-1 rounded-full transition-colors"
            style={{ background: on ? 'var(--color-brand-700)' : 'transparent', color: on ? '#fff' : 'var(--color-muted)' }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Empty({ children }) { return <div className="empty">{children}</div> }
