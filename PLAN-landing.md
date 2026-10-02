# Plan: person-first landing page

Reference: ulysseschong.com. It leads with the person (name, title, experience, education, then
projects) and names each project as a plain task title with a "Topics:" line underneath.
Borrowed: that order and that naming. Not borrowed: the employer-logo strip, the testimonial,
the centred template layout. All three are on the design kit's forbidden list.

## Structure

`/` becomes the landing page. The seven dashboards move one click in, to `/#/work/<view>`, using
hash routing with no new dependency. That also gives every dashboard a shareable link a CV can
point at, which the site does not have today (every view is held in React state on `/`).

The landing page, top to bottom, with density changing on purpose:

1. **Header, quiet.** Name, one-line statement, availability line, contact links (email,
   LinkedIn, GitHub). Photo small and to the right, not centred, once supplied.
2. **Projects, the one large moment.** Seven rows, not cards. Each row has the project title
   (Ulysses-style), a Topics line, and the one number that matters, set large in a serif, with
   the caveat the dashboard already states beside it. Each row links into its dashboard.
3. **Experience, dense.** A date-column spine in reverse chronological order, using the locked
   employment spine in MASTER-CV §3. One line per role, copied verbatim from the bullet bank,
   each traced to its bullet ID. No logos.
4. **Education, small.** Copied from MASTER-CV §2.
5. **Close, quiet.** Email only. No CTA box.

## Project titles

| Dashboard | Title | Topics | Number on the row |
|---|---|---|---|
| Backtest | Backtesting Retail Demand Forecasts | Time series, Prophet, Elastic Net, walk-forward validation | 20.52% WAPE, daily Prophet, Walmart M5 |
| Value add | Measuring Forecast Value Add Against a Naive Baseline | Forecast evaluation, bias, baseline selection | −5.7pp: the baseline wins on 5 of 7 departments |
| Operations | Analysing Airport Capacity Utilisation | Operations analytics, load factor, seasonality | 31.9M empty seats flown, 54.2% load factor |
| F&B | Analysing Restaurant Trading Patterns | Point-of-sale analytics, indexing, day-of-week demand | Friday at 141 against Monday at 79 (indexed) |
| Agent | Answering Forecast Questions with an LLM Agent | Tool calling, evaluation, Anthropic API | 14/14 on the hard set, against 6/14 without tools |
| Foundry | Diagnosing Forecast Error with a Foundry Ontology | Ontology design, PySpark, error attribution | MAPE undefined on 1,784 of 17,240 rows |
| EV siting | Siting EV Chargers with Mixed-Integer Programming | Optimisation, PuLP, demand forecasting | 26 sites from 2,265 carparks |

Every number above is already on the live site. Nothing new is claimed.

## Design

- Keep the site's own identity: green palette, Plus Jakarta Sans, IBM Plex Mono. The kit says
  a project with an established identity keeps it.
- Add one serif display face (Instrument Serif), on the landing page only, for the name and the
  project numbers. This is the editorial contrast the kit asks for, without restyling the
  dashboards.
- No new cards on the landing page. Hairline rules between rows.
- Mobile: each project row stacks with the number above the title; the experience date column
  moves above each role.
- Motion: none beyond the existing view fade. Reduced-motion is already respected.

## Also fixed in passing

- `index.html` meta and Open Graph text still say "Four dashboards". There are seven.
- The sidebar gets a link back to the landing page.

## Copy rules

- No CV fact that is not in `CV-master/MASTER-CV.md`.
- Schneider is shown as "Demand Supply Analytics, Global Supply Chain Planning (Postgraduate)"
  with the contracted title "Demand Supply Analytics Intern" under it (MASTER-CV §3, set
  26 Sep 2026).
- "2+ years", never more.
- No em-dashes.

## Decisions (Jedidiah, 2 Oct 2026)

1. Statement: forecasting and planning analytics, with the tooling built as well
   ("Forecasting, built as software").
2. Photo: yes, his LinkedIn photo. LinkedIn needs his login, so he supplies the file. The page
   ships without it and the photo slot is added when the file arrives.
3. Experience: core roles only. Schneider, Kacific (BD Manager, Network Performance Engineer),
   Vertex, MDI. No Butonas, no Kacific consultancy.
4. Availability line: left off the public page.

## Effort

One session: routing and the landing page, then a browser check at desktop and 375px, then
deploy.
