import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardHead, Pill, Stat } from './ui.jsx'
import traces from './data/agentTraces.json'
import stats from './data/agentStats.json'

/* ---------------------------------------------------------------- helpers */

function fmtArgs(input) {
  const entries = Object.entries(input || {})
  if (!entries.length) return '()'
  return '(' + entries.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ') + ')'
}

function OutputPreview({ output }) {
  const [open, setOpen] = useState(false)
  const text = JSON.stringify(output, null, 1)
  const short = text.length > 190 ? text.slice(0, 190) + ' …' : text
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="mono block w-full text-left text-[.66rem] leading-relaxed mt-1.5 p-2.5 rounded-xl transition-colors"
      style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      title={open ? 'Collapse' : 'Expand full return'}>
      {open ? text : short}
    </button>
  )
}

/* ---------------------------------------------------------------- replay */

function Trace({ trace }) {
  const [step, setStep] = useState(0)
  const total = trace.calls.length + 1 // calls, then the answer
  const timer = useRef(null)

  useEffect(() => {
    setStep(0)
    timer.current = setInterval(() => {
      setStep(s => {
        if (s >= total) { clearInterval(timer.current); return s }
        return s + 1
      })
    }, 550)
    return () => clearInterval(timer.current)
  }, [trace, total])

  const report = trace.report
  return (
    <div className="flex flex-col gap-2.5">
      {/* the question */}
      <div className="self-end max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md text-[.84rem] font-semibold text-white"
           style={{ background: 'var(--color-brand-700)' }}>
        {trace.question}
      </div>

      {/* tool calls */}
      <AnimatePresence>
        {trace.calls.slice(0, step).map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .25 }}
            className="max-w-[92%] px-3 py-2.5 rounded-2xl rounded-bl-md"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[.62rem] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                    style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-900)' }}>
                tool {i + 1}
              </span>
              <span className="mono text-[.72rem] font-semibold truncate">
                {c.tool}<span style={{ color: 'var(--color-muted)' }}>{fmtArgs(c.input)}</span>
              </span>
            </div>
            {c.output && <OutputPreview output={c.output} />}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* the structured answer */}
      {step >= total && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-[92%] p-3.5 rounded-2xl rounded-bl-md"
          style={{ background: report.unanswerable ? 'var(--color-warn-bg)' : 'var(--color-brand-100)' }}>
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            {report.unanswerable
              ? <Pill tone="warn">declined — the data can't answer this</Pill>
              : <Pill tone="good">answered · confidence {report.confidence}</Pill>}
            <span className="mono text-[.64rem]" style={{ color: 'var(--color-muted)' }}>
              {trace.calls.length} tool calls · ${trace.usage.cost_usd} · {trace.usage.seconds}s
            </span>
          </div>
          <p className="text-[.84rem] leading-relaxed">{report.answer}</p>
          {report.figures_cited.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {report.figures_cited.map((f, i) => (
                <span key={i} className="mono text-[.64rem] font-semibold px-2 py-1 rounded-lg"
                      style={{ background: 'var(--color-surface)', color: 'var(--color-brand-900)' }}>
                  {f.dept ? `${f.dept} · ` : ''}{f.metric} = {f.value}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ view */

export default function Agent() {
  const [key, setKey] = useState(traces[0]?.key)
  const [run, setRun] = useState(0)
  const trace = useMemo(() => traces.find(t => t.key === key) || traces[0], [key])

  return (
    <div className="flex flex-col gap-3">
      {/* headline stats — measured by eval/run_eval.py, never hand-written */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat dark label="Eval pass rate" value={stats.mainPass} foot={`${stats.mainModel} · ${stats.mainQuestions} questions, 4 checks each`} />
        <Stat label="Hard multi-hop set" value={stats.hardPass}
              pill={<Pill tone={stats.hardTone}>{stats.hardNote}</Pill>} />
        <Stat label="Cost per question" value={stats.meanCost} unit="USD"
              foot={`${stats.meanSeconds}s mean latency`} />
        <Stat label="Prompt-stuffing baseline" value={stats.baselinePass}
              pill={<Pill tone="bad">{stats.baselineNote}</Pill>} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        {/* question picker */}
        <Card className="p-3 h-fit">
          <CardHead title="Ask the forecast" sub="recorded runs, replayed verbatim" />
          <div className="flex flex-col gap-1 p-1">
            {traces.map(t => (
              <button key={t.key}
                data-on={t.key === key ? '1' : '0'} className="navitem text-left"
                onClick={() => { setKey(t.key); setRun(r => r + 1) }}>
                <span className="truncate flex-1 text-[.78rem]">{t.question}</span>
                {t.report.unanswerable && <Pill tone="warn">refuses</Pill>}
              </button>
            ))}
          </div>
          <p className="text-[.68rem] leading-relaxed p-2.5" style={{ color: 'var(--color-muted)' }}>
            An LLM agent (<span className="mono">{trace?.model}</span>) that answers by calling
            strict-schema tools over this site's backtest data — it never computes a number itself.
            These are recorded runs of the real agent, not a live endpoint.{' '}
            <a className="font-semibold underline" href="https://github.com/jediasaf/ask-the-forecast"
               target="_blank" rel="noreferrer">Repo & eval harness ↗</a>
          </p>
        </Card>

        {/* replay panel */}
        <Card className="p-4 min-h-[420px]">
          <CardHead title="Tool-call replay" sub="every figure traces to a tool return"
            action={
              <button className="iconbtn" title="Replay" onClick={() => setRun(r => r + 1)}>↺</button>
            } />
          <div className="p-2">
            {trace && <Trace key={`${trace.key}-${run}`} trace={trace} />}
          </div>
        </Card>
      </div>
    </div>
  )
}
