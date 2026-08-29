# Clients dashboard

Stacked bar chart of client counts over 12 months, and an expandable table of the
same numbers by company, branch, adviser, channel. The chart follows the table:
it stacks whichever level sits directly beneath the row you have drilled into.

## Run

Needs Node `^20.19 || ^22.13 || >=24` (Vite, Vitest and jsdom each pull the
floor up in different places).

```bash
npm install
npm run dev
```

Client on http://localhost:5173, API on http://localhost:8787, Vite proxies
`/api`. `npm run build` type-checks and builds, `npm run lint` runs Biome,
`npm test` runs Vitest.

Tests cover the two things the brief names: how the data maps into the chart
(`src/domain/childStack.test.ts`) and expand and collapse by pointer and
keyboard (`src/components/ClientsTable/ClientsTable.test.tsx`).

`GET /api/clients` returns the dataset, photos come from
`GET /api/avatars/:file`. The client forwards two query params from its own URL
so the states can be checked by hand: `/?delay=6000` for loading, `/?fail=1` for
the error. Running without the API (`npm run dev:web`) also errors.

## Assumptions

- **The chart stacks the level directly beneath the focused node.** Company
  splits into its branches, a branch into its advisers, an adviser into their
  channels. Every segment is a real node, so nothing is invented at levels the
  data does not describe.
- **The chart follows the table's expansion, not a selection.** Rows have no
  selected state in the design, so scope is derived: walk down while exactly one
  child is open, and stop. Opening two branches at once falls back to their
  common parent.
- **A bar is the sum of its children, which is not always the parent's own
  figure.** Where the two differ the tooltip shows both.
- **Rows are nodes and columns are months.** Expanding a row reveals its
  children, not a breakdown of a single month.
- **Adviser photos live in the payload.** The design shows pictures per adviser
  but the data has none, so I've added an `image` path to `company.json`. The
  images are exported from the design file.
- **The name column has a visible "Name" header.** In the design that cell reads
  "Placeholder" in white on white.
- **Expand controls appear only where they do something.** The design puts a
  chevron on every adviser, but four of the five have no channels.
- **The table wrapper is focusable.** It scrolls sideways, and focusing a row
  does not scroll it, so without this a keyboard user cannot reach the later
  months. Biome's `noNoninteractiveTabindex` is turned off for that folder in
  `biome.json` because it and axe disagree here.

## What I think you got wrong

**The numbers do not add up.** Children do not always sum to their parent:
Company May 2024 is 301 against 279, Branch 1 Aug 2024 is 214 against 216, and
Anna Blackwood is off by one or two in five of the twelve months. Each bar is the
sum of its children, so the chart surfaces the gap rather than papering over it,
and the tooltip prints both figures where they differ. In practice a parent
should either carry a total that agrees with its children, or carry none at all
and let the client sum them, which is cheap and cannot drift.

**The design shows a channel legend on the company chart,** but channels only
exist under one adviser, so that split cannot come from the data at that level.
A channel breakdown is what you get when the chart is scoped to an adviser:
drilling to Anna Blackwood reproduces the mockup's legend and colours exactly.
The legend looks right; it is attached to the wrong node.

**The design covers one state and one width,** so loading, errors, focus and the
narrow layout have no reference to match.

## Next

- Let a row be scoped directly, so opening two branches does not fall back to the
  company.
- Reconcile the parent totals with whoever owns the data.
- Keep the expanded rows in the URL so a drilled-in view can be shared.
- Virtualise the table if data becomes heavy in future, and load subtrees on demand
  (with cursor or pagination).
