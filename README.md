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

## API

`GET /api/clients` returns the whole dataset. Photos from `GET /api/avatars/:file`.

Query params to check the UI states, forwarded by the client from its own URL:

| URL | State |
| --- | --- |
| `/?delay=6000` | loading |
| `/?fail=1` | error |

## Added, not in the design

- **Loading and error states.** The shell always renders: title, both cards,
  month columns. Only the data area changes. Errors show in the table where the
  first row would be, with retry. A failed request never blanks the page.
- **Two error messages**, offline and everything else, since that is the only
  difference that changes what someone can do about it.
- **Keyboard support.** Arrows move, left and right collapse and expand, Enter
  and Space toggle, Home and End jump. `treegrid` with level and expanded state
  on each row, so the hierarchy reaches screen readers.
- **Focus styles**, since the design has none.
- **Down to 375px.** Table scrolls sideways, chart shortens labels to `Feb` and
  drops every other one.
- **Chart tooltip.** The small channel bars are 1 to 2px tall, so without it they
  cannot be read.

## Changed

- **Adviser photos.** The payload is numbers only, so each adviser in
  `company.json` carries an `image` path and the server serves the files. Falls
  back to initials.
- **Visible "Name" header.** The design has "Placeholder" in white on white.
- **Expand controls only where they do something.** The design puts a chevron on
  every adviser, four of five have no channels.
- **Fonts.** Inter from Google Fonts. Founders Grotesk only appears in the
  invisible placeholder cell, so it is not included.

## Assumed

- The chart stacks the three channels, not each node's children. The legend is a
  list of channels.
- The chart always shows the company. Rows have no selected state in the design,
  so the table drills on its own.
- Rows are nodes, columns are months. Expanding reveals children.
- Months run Feb 2024 to Jan 2025, from the brief. The payload has no dates.
- Whole dataset in one request. Light theme only.

## What I think you got wrong

**The numbers do not add up.** Children do not always sum to their parent:

| Node | Month | Parent | Children |
| --- | --- | --- | --- |
| Company | May 2024 | 301 | 279 |
| Branch 1 | Aug 2024 | 214 | 216 |
| Anna Blackwood | 5 of 12 months | | off by 1 or 2 |

Each bar uses the node's own total and splits channels inside it, so bars match
the row above them in the table. Adding a column by hand will not always agree.

**Channels only exist for one adviser.** Anna Blackwood is the only node with
`channels`, but the design shows the channel legend on the company chart. So
`organic` and `paid` are summed from below and `existing` is the remainder. That
makes "Existing clients" a bucket holding the real channel plus everyone with no
channel data, which is why the company chart is nearly one band and Branch 2 and
3 are a single full bar. They are not really all existing clients.

**The design covers one state and one width,** but the brief asks for loading,
errors, keyboard and 375px.

## Next

- Settle what the chart stacks: channels or children.
- Decide if expanding a row should re-scope the chart.
- Label the remainder band honestly where there is no channel data.
