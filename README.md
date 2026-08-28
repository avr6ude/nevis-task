# Clients dashboard

Stacked bar chart of client counts by acquisition channel over 12 months, and an
expandable table of the same numbers by company, branch, adviser, channel.

## Run

```bash
npm install
npm run dev
```

Client on http://localhost:5173, API on http://localhost:8787, Vite proxies
`/api`. `npm run build` type-checks and builds, `npm run lint` runs Biome.

`GET /api/clients` returns the dataset, photos come from
`GET /api/avatars/:file`. The client forwards two query params from its own URL
so the states can be checked by hand: `/?delay=6000` for loading, `/?fail=1` for
the error. Running without the API (`npm run dev:web`) also errors.

## Assumptions

- **The chart stacks the three channels**, not each node's children, because the
  legend in the design is a list of channels.
- **Above adviser level the split is derived.** `organic` and `paid` are summed
  from below and `existing` is the remainder, so a node with no channel data
  reads as one full band.
- **The chart always shows the company.** Rows have no selected state in the
  design, so the table drills on its own.
- **Rows are nodes and columns are months.** Expanding a row reveals its
  children, not a breakdown of a single month.
- **Adviser photos live in the payload.** The design shows pictures per adviser but
  the data has none, so I've added an `image` path to `company.json`.
- **The name column has a visible "Name" header.** In the design that cell reads
  "Placeholder" in white on white.
- **Expand controls appear only where they do something.** The design puts a
  chevron on every adviser, but four of the five have no channels.
- **Secondary text is 0.65 alpha, not the 0.6 in the design.** At 0.6 it lands
  at 4.3:1 on the cream background and fails WCAG AA.
- **The table wrapper is focusable.** It scrolls sideways, and focusing a row
  does not scroll it, so without this a keyboard user cannot reach the later
  months. Biome's `noNoninteractiveTabindex` is turned off for that folder in
  `biome.json` because it and axe disagree here.

## What I think you got wrong

**The numbers do not add up.** Children do not always sum to their parent:
Company May 2024 is 301 against 279, Branch 1 Aug 2024 is 214 against 216, and
Anna Blackwood is off by one or two in five of the twelve months. Each bar uses
the node's own total and splits channels inside it, so bars match the row above
them in the table. In practice a parent should either carry a total that agrees
with its children, or carry none at all and let the client sum them, which is
cheap and cannot drift.

**The design shows a channel legend on the company chart,** but channels only
exist under one adviser, so that split cannot come from the data.

**The design covers one state and one width,** so loading, errors, focus and the
narrow layout have no reference to match.

## Next

- Rescope the chart to the expanded row, once we agree whether it should stack
  channels or each node's children.
- Label the remainder band where a node has no channel data, so the chart stops
  implying those clients are all existing ones.
- Keep the expanded rows in the URL so a drilled-in view can be shared.
- Virtualise the table if data becomes heavy in future, and load subtrees on demand
  (with cursor or pagination).
