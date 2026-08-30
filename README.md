# Clients dashboard

Stacked bar chart of client counts over 12 months, and an expandable table of the
same numbers by company, branch, adviser, channel. The chart follows the table:
it stacks whichever level sits directly beneath the row you have drilled into.

## Run

Needs Node 24.

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

`GET /api/clients` returns the months and the tree, photos come from
`GET /api/avatars/:file`. The client renders whatever periods it is given
rather than owning a month list. Both ends validate against one Zod schema
(`src/domain/schema.ts`): the server refuses to boot on bad data, the client
rejects a response that does not match, and every node's `values` has to line
up with `months`. The client forwards three query params from its own URL so
the states can be checked by hand: `/?delay=6000` for loading, `/?fail=1` for
the error, `/?bad=1` for a malformed payload. Running without the API
(`npm run dev:web`) also errors.

## Assumptions

- **The chart stacks the level directly beneath the focused node.** Company
  splits into its branches, a branch into its advisers, an adviser into their
  channels. Every segment is a real node, so nothing is invented at levels the
  data does not describe.
- **The chart follows the table's expansion, not a selection.** Rows have no
  selected state in the design, so scope is derived: walk down while exactly one
  child is open, and stop. Opening two branches at once falls back to their
  common parent.
- **Every parent figure is recomputed from its children.** The numbers in the
  payload do not add up (see below), so the client rolls them up from the leaves
  instead of trusting each node's own total. Chart and table therefore always
  agree.
- **Rows are nodes and columns are months.** Expanding a row reveals its
  children, not a breakdown of a single month.
- **Adviser photos live in the payload.** The design shows pictures per adviser
  but the data has none, so I've added an `image` path to `company.json`. The
  images are exported from the design file.
- **The name column has a visible "Name" header.** In the design that cell reads
  "Placeholder" in white on white.
- **Expand controls appear only where they do something.** The design puts a
  chevron on every adviser, but four of the five have no channels.
- **The table is a full treegrid, which is more than the brief asks for.** The
  brief needs expand and collapse from the keyboard and the hierarchy exposed to
  assistive tech. On top of that, every month is its own grid cell you can walk
  into with Left and Right, so a keyboard user can reach the later months without
  a mouse. React Aria's `Tree` covers the hierarchy but puts a whole row inside
  one cell, so the months would not be reachable one by one. That is why the
  keyboard handling is written by hand instead.

## What I think you got wrong

**The numbers do not add up.** Children do not sum to their parent anywhere in
the tree: Company May 2024 says 301 where its branches sum to 279, Branch 1
Aug 2024 says 214 where its advisers sum to 216, and Anna Blackwood is off by
one or two in five of the twelve months. Since the errors compound up the tree,
the displayed figures are rolled up from the leaves and the totals in the
payload are ignored. Company May then reads 278, not 301 or 279. The leaf
numbers are the only ones taken as given, so if those are wrong too the whole
thing is. In practice a parent should either carry a total that agrees with its
children, or carry none at all and let the client sum them, which is cheap and
cannot drift.

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
