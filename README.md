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
`?fail=1` returns 500 for testing the error state. Adviser photos are served
from `GET /api/avatars/:file`.

## Changes to the brief

The design shows a photo per adviser, so each adviser node in `company.json`
carries an `image` path alongside its numbers. The server serves those files
from `server/avatars/`. The client reads `node.image` and falls back to an
initials monogram.

## Assumptions

- The chart stacks the three acquisition channels, not the tree's child level.
- Only Anna Blackwood has channel data. Above adviser level the split is
  derived: `organic` and `paid` are summed over the subtree, `existing` is the
  remainder. This is approximate above adviser level.
- Rows are not selectable and the design only shows the company view, so the
  chart is always company scoped. The table does the drilling.
- Expandable rows reveal child nodes, months are columns.
- A node with no children shows no expand control (branches 2 and 3, most
  advisers).
- Table uses Inter. Founders Grotesk from the design is licensed.
- Light theme only.

## Next

- Confirm chart semantics: channel breakdown vs child level.
- Persist expanded rows in the URL.
- Virtualise the table for larger trees.
