# Forecasting & Operations Research — portfolio

Three working dashboards, all built on public data, all reporting their own failure modes.

**Live:** deployed on Vercel · **Stack:** React, Vite, Tailwind, Recharts

---

## 1. Forecast backtest

Walk-forward backtest of demand forecasts on the public Walmart M5 dataset
(California store 1), 7 departments, 3 folds, 2013-04-28 → 2014-01-22.

- Prophet, daily: **20.52% WAPE**
- Elastic Net, monthly: **5.46% WAPE**

Those two numbers are *not* comparable and the page says so — the Elastic Net ran on monthly
aggregates, where aggregation cancels noise. Reporting it as a four-fold improvement would be wrong.

`HOBBIES_2` is the worst department at **34.32%**, averaging 23.6 units/day. Low-volume
intermittent demand: mostly zeros with occasional spikes, which a smooth trend-plus-seasonality
model cannot fit. Croston's method is the right tool there.

Revenue concentration: the top **20%** of 3,049 SKUs by a revenue-weighted seasonal priority
score account for **56%** of realised revenue (predicted vs actual revenue, r = 0.922).

## 2. Planning control tower — forecast value add

Accuracy alone is close to meaningless without a baseline. Measured against seasonal naive
(same weekday, one week earlier):

| | |
|---|---|
| Forecast accuracy | 79.5% |
| Naive baseline | 85.2% |
| **Forecast value add** | **−5.7pp** |
| Bias | −0.3% |

**The model is beaten by the baseline on 5 of 7 departments.** It only earns its place on
`HOBBIES_2` (**+10.6pp**) — the intermittent series where repeating last week is a poor guess.

The planning conclusion is not that the model is bad. It is that model and baseline should be
selected per series, and that any accuracy figure quoted without a baseline beside it says little.

---

## Data

Public Walmart M5 competition data. Every figure on the site is computed from stored prediction
files at build time, not restated from a report. No employer data, systems or designs are used.

## Running it

```bash
npm install
npm run dev
```

## 3. Operations — airport capacity utilisation

240,000 flight movements across 3 terminals and 72 airlines, full year 2010.

| | |
|---|---|
| Load factor | **54.2%** |
| Passengers | 37.7M |
| Empty seats flown | **31.9M** |
| Seasonal swing | 17.5pp (44.9% Jan → 62.4% Dec) |

Nearly half of all seats flown were unsold. T3 runs at 60.1% on the fewest movements while T2
runs at 50.2% — about 10 points of utilisation between terminals, which is a scheduling and
allocation question before it is a demand question.
