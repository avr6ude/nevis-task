# Clients dashboard

Stacked bar chart of client counts by acquisition channel over 12 months, plus
an expandable table of the same figures by hierarchy (company, branch, adviser,
channel).

## Run

```bash
npm install
npm run dev
```

Client on http://localhost:5173, API on http://localhost:8787, Vite proxies
`/api`.

- `npm run build` type-checks and builds
- `npm run lint` runs Biome (lint, format, a11y)

## API

`GET /api/clients` returns the full client dataset after a ~500ms delay.
Adviser photos are served from `GET /api/avatars/:file`.

Two query params exist for exercising the UI states, and the client forwards
them from its own URL:

| URL | State |
| --- | --- |
| http://localhost:5173/?delay=4000 | loading skeleton |
| http://localhost:5173/?fail=1 | server error (500) |
| http://localhost:5173/?fail=404 | request error (404) |

Stopping the API (`npm run dev:web` alone) gives the network error state.
`FAIL_RATE=0.3 npm run dev` fails a share of requests at random.

## Changes to the brief

**Avatars in the payload.** The design shows a photo per adviser, so each
adviser node in `company.json` carries an `image` path alongside its numbers,
and the server serves those files from `server/avatars/`. The client reads
`node.image` and falls back to an initials monogram.

**A visible header on the name column.** In the design that cell reads
"Placeholder" in white on a white background, so the column has no visible
header. I labelled it "Name" instead. An unlabelled column is worse for
scanning and for assistive tech, and the mock reads like a leftover.

## What I think the brief got wrong

**The numbers do not reconcile.** Children do not always sum to their parent:

| Node | Month | Parent | Children |
| --- | --- | --- | --- |
| Company | May 2024 | 301 | 279 |
| Branch 1 | Aug 2024 | 214 | 216 |
| Anna Blackwood | 5 of 12 months | | off by 1 to 2 |

A stacked chart has to pick a side. This one honours each node's own `values`
as the bar total and derives the channel split inside it, so every bar matches
the row above it in the table. Summing a column by hand will not always match.

**A channel breakdown is not derivable above adviser level.** Only Anna
Blackwood has a `channels` array, but the design shows the channel legend on
the company chart. So `organic` and `paid` are summed over whatever channel
nodes exist in the subtree, and `existing` is the remainder. That makes
"Existing clients" a bucket holding the real channel plus everyone with no
channel data at all, which is why the company chart is almost entirely one
band.

**The design shows expand controls on rows that cannot expand.** Every adviser
in the mock has a chevron, but four of the five have no channels. Controls are
only rendered where there is something to reveal.

**The design covers one state.** There is no loading, error, empty, focus or
narrow-viewport treatment in the file, but the brief asks for loading and error
handling, keyboard operation, and nothing broken down to 375px. All of that is
invented.

## Assumptions

- The chart stacks the three acquisition channels, not the tree's child level.
- Rows are not selectable and the design only shows the company view, so the
  chart is always company scoped. The table does the drilling.
- Expandable rows reveal child nodes, months are columns.
- The whole dataset is served in one request.
- Light theme only.

## Next

- Confirm chart semantics: channel breakdown vs child level.
- Decide whether expanding a row should re-scope the chart.
- Persist expanded rows in the URL.
- Virtualise the table for larger datasets.
