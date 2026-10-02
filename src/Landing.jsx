import headline from './data/headline.json'
import planning from './data/planningOverall.json'
import planningDepts from './data/planningDepts.json'
import ops from './data/opsHead.json'
import fnb from './data/fnbHead.json'
import agent from './data/agentStats.json'
import foundry from './data/foundry.json'
import ev from './data/ev.json'

const nf = n => n.toLocaleString('en-SG')
const hobbies = planningDepts.find(d => d.dept === 'HOBBIES_2')

/* Every number on a row is read from the same JSON the dashboard renders, so the
   landing page cannot drift from the work it points at. */
const PROJECTS = [
  {
    k: 'backtest',
    title: 'Backtesting Retail Demand Forecasts',
    topics: 'Time series · Prophet · Elastic Net · walk-forward validation',
    figure: `${headline.prophetWape}%`,
    unit: 'WAPE, daily Prophet',
    note: `Walmart M5, ${headline.depts} departments, ${headline.folds} walk-forward folds. The monthly Elastic Net scores ${headline.elasticWape}%, and the page explains why the two are not comparable.`,
  },
  {
    k: 'planning',
    title: 'Measuring Forecast Value Add Against a Naive Baseline',
    topics: 'Forecast evaluation · bias · baseline selection',
    figure: `${planning.fva > 0 ? '+' : '−'}${Math.abs(planning.fva)}pp`,
    unit: 'value add over seasonal naive',
    note: `Repeating last week beats the model on ${planning.total - planning.improved} of ${planning.total} departments. The model earns its place only on intermittent HOBBIES_2${hobbies ? `, at +${hobbies.fva}pp` : ''}.`,
  },
  {
    k: 'operations',
    title: 'Analysing Airport Capacity Utilisation',
    topics: 'Operations analytics · load factor · seasonality',
    figure: `${(ops.empty / 1e6).toFixed(1)}M`,
    unit: `empty seats flown, ${ops.year}`,
    note: `${nf(ops.flights)} movements across ${ops.terminals} terminals and ${ops.airlines} airlines, at a ${ops.lf}% load factor. A scheduling question before it is a demand question.`,
  },
  {
    k: 'fnb',
    title: 'Analysing Restaurant Trading Patterns',
    topics: 'Point-of-sale analytics · indexing · day-of-week demand',
    figure: `${Math.round(fnb.peakIdx)} : ${Math.round(fnb.troughIdx)}`,
    unit: `${fnb.peakDay} against ${fnb.troughDay}, indexed`,
    note: `${nf(fnb.tradingDays)} trading days from an independent operation. Every figure is indexed to an internal average; no absolute revenue is published.`,
  },
  {
    k: 'agent',
    title: 'Answering Forecast Questions with an LLM Agent',
    topics: 'Tool calling · evaluation · Anthropic API',
    figure: agent.hardPass,
    unit: `hard questions, baseline ${agent.baselinePass}`,
    note: `The agent calls strict-schema tools and never computes a number itself. ${agent.mainPass} on the main set, at a mean ${agent.meanCost} and ${agent.meanSeconds}s per question.`,
  },
  {
    k: 'foundry',
    title: 'Diagnosing Forecast Error with a Foundry Ontology',
    topics: 'Ontology design · PySpark · error attribution',
    figure: nf(foundry.summary.zero_demand_rows),
    unit: `of ${nf(foundry.summary.total_rows_lag1)} rows MAPE silently drops`,
    note: 'Synthetic data, generated with known demand behaviours to see whether the ontology recovers them. Transforms are written for Foundry and not yet run there.',
  },
  {
    k: 'evsiting',
    title: 'Siting EV Chargers with Mixed-Integer Programming',
    topics: 'Optimisation · PuLP · demand forecasting',
    figure: String(ev.summary.sites_selected),
    unit: `sites chosen from ${nf(ev.summary.candidate_carparks)} HDB carparks`,
    note: 'A binary program per planning area, trading coverage gap against spread. The area with the worst gap gets nothing, because it has no HDB carparks to choose from. Group coursework.',
  },
]

/* MASTER-CV §3 spine; one line per role, verbatim from the bullet bank (IDs noted). */
const ROLES = [
  {
    when: 'Dec 2025 – Dec 2026',
    org: 'Schneider Electric',
    title: 'Demand Supply Analytics, Global Supply Chain Planning (Postgraduate)',
    sub: 'Contracted title: Demand Supply Analytics Intern',
    lines: [
      // SE-1
      'Own product-level forecast-accuracy and bias measurement across nine countries and five business units: defined the metrics, computed them at the correct grain to avoid aggregation error, and recommended corrective actions by root-cause driver for the monthly demand review with planning leadership.',
      // SE-2
      'Built the forecast-accuracy root-cause application behind that review: a self-serve tool replacing manual analysis that ranks drivers across eight configurable grains and outputs a recommended action for each; gathered requirements from subject-matter experts and ran user acceptance testing before rollout.',
    ],
    link: { href: 'https://forecast-accuracy-rca.vercel.app', label: 'Sanitised rebuild on synthetic data' },
  },
  {
    when: 'May 2025 – Oct 2025',
    org: 'Kacific Broadband Satellites Group',
    title: 'Business & Corporate Development Manager',
    lines: [
      // KB-2
      'Sized commercial opportunities and translated cost structures and unit economics into stakeholder-ready analysis on a US$45M+ partnership and a US$2M+ active pipeline.',
    ],
  },
  {
    when: 'Sept 2024 – May 2025',
    org: 'Kacific Broadband Satellites Group',
    title: 'Network Performance Engineer (Operations Analytics)',
    lines: [
      // KA-1
      'Automated cloud-native ETL pipelines (Python, SQL, AWS, InfluxDB, Linux) extracting telemetry from disparate sources across 25+ APAC markets, cutting ~90% of manual reporting and standardising KPI tracking.',
    ],
  },
  {
    when: 'Dec 2023 – Aug 2024',
    org: 'Vertex Ventures SEA & India (Temasek)',
    title: 'Communication & Community Intern',
    lines: [
      // VX-1
      'Produced market analyses and investor communications for the SEA/India portfolio; built tracking and digital analytics workflows that grew audience impressions +30% (Google Analytics and campaign data).',
    ],
  },
  {
    when: 'Jul 2023 – Nov 2023',
    org: 'MDI Ventures (Telkom Indonesia)',
    title: 'IT Security Intern, Cyber Security Task Force',
    lines: [
      // MDI-1
      'Built Python automation for incident detection and alerting, cutting detection-to-response time by 40%+; authored ISO 27001-aligned incident-response workflows and operating documentation.',
    ],
  },
]

const EDUCATION = [
  { when: 'Aug 2025 – Nov 2026', org: 'Singapore Management University', title: 'Master of IT in Business (Data Science & Analytics)' },
  { when: 'Apr 2022 – Sept 2024', org: 'University of Wollongong, Australia', title: 'Bachelor of Computer Science (Cyber Security)' },
]

const CONTACT = [
  { href: 'mailto:jediasaf@gmail.com', label: 'jediasaf@gmail.com' },
  { href: 'https://linkedin.com/in/jedidiahasaf', label: 'LinkedIn', ext: true },
  { href: 'https://github.com/jediasaf', label: 'GitHub', ext: true },
]

function Label({ children }) {
  return <h2 className="lp-label">{children}</h2>
}

export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-wrap lp-head">
        <p className="lp-kicker">Singapore</p>
        <h1 className="lp-name">Jedidiah Asaf<br />Tallulembang</h1>
        <div className="lp-intro">
          <p className="lp-statement">Forecasting, built as software.</p>
          <p className="lp-lede">
            Demand forecasting and planning analytics, with the tooling built as well. I measure where
            forecasts go wrong and build the tools planners use to act on it. Each project below is
            computed from data and says where it falls short.
          </p>
          <nav className="lp-contact" aria-label="Contact">
            {CONTACT.map(c => (
              <a key={c.label} href={c.href} className="lp-link"
                 {...(c.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{c.label}</a>
            ))}
          </nav>
        </div>
      </header>

      <section className="lp-wrap lp-projects" aria-labelledby="projects">
        <Label><span id="projects">Projects</span></Label>
        <ol className="lp-rows">
          {PROJECTS.map((p, i) => (
            <li key={p.k}>
              <a className="lp-row" href={`#/work/${p.k}`}>
                <span className="lp-idx mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="lp-fig">
                  <span className="lp-figure">{p.figure}</span>
                  <span className="lp-unit">{p.unit}</span>
                </span>
                <span className="lp-body">
                  <span className="lp-title">{p.title}<span className="lp-arrow" aria-hidden>→</span></span>
                  <span className="lp-topics">Topics: {p.topics}</span>
                  <span className="lp-note">{p.note}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
        <p className="lp-aside">
          Also public: <a className="lp-link" href="https://github.com/jediasaf/forecast-accuracy-at-scale"
            target="_blank" rel="noopener noreferrer">forecast accuracy at scale</a>, PySpark and BigQuery
          over 30,490 M5 series.
        </p>
      </section>

      <section className="lp-wrap lp-exp" aria-labelledby="experience">
        <Label><span id="experience">Experience</span></Label>
        <ol className="lp-timeline">
          {ROLES.map(r => (
            <li key={r.title} className="lp-role">
              <span className="lp-when mono">{r.when}</span>
              <div>
                <h3 className="lp-org">{r.org}</h3>
                <p className="lp-role-title">{r.title}</p>
                {r.sub && <p className="lp-sub">{r.sub}</p>}
                {r.lines.map((l, i) => <p key={i} className="lp-line">{l}</p>)}
                {r.link && (
                  <a className="lp-link lp-small" href={r.link.href} target="_blank"
                     rel="noopener noreferrer">{r.link.label}</a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="lp-wrap lp-edu" aria-labelledby="education">
        <Label><span id="education">Education</span></Label>
        <ol className="lp-timeline lp-timeline-tight">
          {EDUCATION.map(e => (
            <li key={e.org} className="lp-role">
              <span className="lp-when mono">{e.when}</span>
              <div>
                <h3 className="lp-org">{e.org}</h3>
                <p className="lp-role-title">{e.title}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="lp-wrap lp-close">
        <p className="lp-close-line">Write to me at</p>
        <a className="lp-close-mail" href="mailto:jediasaf@gmail.com">jediasaf@gmail.com</a>
      </footer>
    </div>
  )
}
