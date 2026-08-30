# Clients dashboard

Stacked bar chart of monthly client counts, and an expandable table of the same
numbers by company, branch, adviser, channel. The chart follows the table: it
stacks whichever level sits directly beneath the row you have drilled into.

## Run

Needs Node 24.

```bash
npm install
npm run dev
```

Client on http://localhost:5173, API on http://localhost:8787, Vite proxies
`/api`. `npm test` runs 50 tests, including axe against the table and chart.

## Data

`GET /api/clients` returns the months and the tree, photos come from
`GET /api/avatars/:file`. Months come from the payload, so the client renders
whatever periods it is given.

Both ends validate against one Zod schema (`src/domain/schema.ts`): the server
refuses to boot on bad data, the client rejects a response that does not match,
and every node's `values` has to line up with `months`. Query params check the
states by hand: `/?delay=6000`, `/?fail=1`, `/?bad=1`.

## Accessibility

The table is a treegrid. Rows carry `aria-level` and `aria-expanded`, and every
month is its own grid cell, so Left and Right walk across the year and a
keyboard user reaches December without a mouse.

The chart's SVG is hidden from assistive tech and the same figures sit beside it
in a visually hidden table with row and column headers, so the numbers are not
mouse-only.

## Assumptions

- **The chart stacks the level directly beneath the focused node.** Company into
  branches, a branch into advisers, an adviser into channels. Every segment is a
  real node, so nothing is invented at levels the data does not describe.
- **The chart follows expansion, not selection.** Rows have no selected state in
  the design, so scope is derived: walk down while exactly one child is open.
  Opening two branches falls back to their common parent.
- **Every parent figure is recomputed from its children,** because the payload
  totals do not add up. See below.
- **Rows are nodes and columns are months.** Expanding a row reveals its
  children, not a breakdown of one month.
- **Adviser photos live in the payload.** The design shows them, the data has
  none, so `company.json` carries an `image` path exported from the design file.
- **The name column has a visible "Name" header.** In the design that cell reads
  "Placeholder" in white on white.
- **Expand controls appear only where they do something.** The design puts a
  chevron on every adviser, but four of the five have no channels.

## What I think you got wrong

**The numbers do not add up.** Children never sum to their parent: Company May
2024 says 301 against 279 from its branches, Branch 1 Aug 2024 says 214 against
216, Anna Blackwood is off by one or two in five months. The errors compound, so
every parent is recomputed from the leaves and the payload totals are ignored.
Company May then reads 278. A parent should carry a total that agrees with its
children, or carry none at all.

**The design shows a channel legend on the company chart,** but channels exist
under one adviser only, so that split cannot come from the data at that level.
Drilling to Anna Blackwood reproduces the mockup's legend and colours exactly.
The legend is right, it is attached to the wrong node.

**The design covers one state and one width,** so loading, errors, focus and the
narrow layout have no reference to match.

## Next

- Virtualise the table with react-window and load subtrees on demand. Twelve
  nodes fit in the DOM; a real book of clients does not.
- Keep the expanded rows in the URL so a drilled-in view can be shared.
- Reconcile the totals with whoever owns the data.
