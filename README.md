# Clients dashboard

A stacked bar chart of client counts by acquisition channel over 12 months, and
an expandable table of the same numbers by level: company, branch, adviser,
channel.

## Run

```bash
npm install
npm run dev
```

Client on http://localhost:5173, API on http://localhost:8787. Vite proxies
`/api` to the API.

- `npm run build` type-checks and builds
- `npm run lint` runs Biome (format, lint, accessibility rules)

## API

`GET /api/clients` returns the whole dataset after a short delay. Adviser photos
come from `GET /api/avatars/:file`.

Two query params exist so the UI states can be checked by hand. The client
forwards them from its own URL:

| URL | State |
| --- | --- |
| http://localhost:5173/?delay=6000 | loading |
| http://localhost:5173/?fail=1 | server error |
| http://localhost:5173/?fail=404 | request error |

Running the client without the API (`npm run dev:web`) also shows a server
error, because the Vite proxy answers 502. The offline message needs the browser
itself to be offline. `FAIL_RATE=0.3 npm run dev` fails a share of requests at
random.

## What I added that the design does not cover

The design is one screen at one size, so a lot of the brief has no reference to
match. These are my calls.

**Loading and error states.** The page shell always renders: the title, both
cards, and the month columns, which come from a constant rather than the
response. Only the part that would hold data changes. While loading, the chart
shows placeholder bars and the table shows placeholder rows. On failure, the
table shows the message where the first row would be, with a retry button, and
the chart says it has nothing to draw. A failed request never blanks the page.

**Four error messages, not one.** The API layer separates no connection, server
error, rejected request, and unreadable response, and each gets its own wording.
Retry re-runs the request.

**Keyboard support for the table.** Arrow keys move between rows, left and right
collapse and expand, Enter and Space toggle, Home and End jump to the ends. One
row is in the tab order at a time. The table is a `treegrid` with a level and an
expanded state on every row, so the hierarchy reaches screen readers.

**Focus styles.** Nothing in the design shows a focus state, so rows, the expand
controls and the retry button get a visible ring.

**Behaviour down to 375px.** The table scrolls sideways inside its card and the
page never overflows. The chart shortens month labels to `Feb` and drops every
other one when it runs out of room.

**A tooltip on the chart.** Hovering a month shows all three channels and the
total. The bars for the small channels are one or two pixels tall, so without
this they cannot be read at all.

**Bars are rounded as a whole.** Each month is clipped to one rounded shape, so
only the outer corners are round and the segments inside sit flush.

## What I changed

**Adviser photos.** The design shows a photo per adviser but the payload is
numbers only. Each adviser in `company.json` now carries an `image` path and the
server serves those files. The client reads `node.image` and falls back to
initials.

**A visible header on the name column.** In the design that cell reads
"Placeholder" in white on white, so the column has no visible header. I labelled
it "Name". An unlabelled column is harder to scan and gives screen readers
nothing to announce.

**Expand controls only where they do something.** The design puts a chevron on
every adviser, but four of the five have no channels. A row with no children
gets no control, and keeps the indent so the names still line up.

**Fonts.** The design uses Inter everywhere visible. Founders Grotesk appears
once, in the invisible placeholder cell, so I did not include it. Inter is
loaded from Google Fonts.

## What I assumed

- The chart stacks the three acquisition channels, not each node's children.
  The legend in the design is a list of channels.
- The chart always shows the company. Rows have no selected state in the design,
  so the table does the drilling on its own.
- Rows in the table are nodes and columns are months. Expanding a row reveals
  its children, not a breakdown of one month.
- Month labels run Feb 2024 to Jan 2025, taken from the brief. The payload has
  no dates.
- The whole dataset is served in one request. It is a few kilobytes.
- Light theme only.

## What I think the brief got wrong

**The numbers do not add up.** Children do not always sum to their parent:

| Node | Month | Parent | Children |
| --- | --- | --- | --- |
| Company | May 2024 | 301 | 279 |
| Branch 1 | Aug 2024 | 214 | 216 |
| Anna Blackwood | 5 of 12 months | | off by 1 or 2 |

A stacked chart has to pick a side. Each bar uses the node's own total and
splits the channels inside it, so every bar matches the row above it in the
table. Adding up a column by hand will not always agree.

**Channels only exist for one adviser.** Anna Blackwood is the only node with a
`channels` array, but the design shows the channel legend on the company chart.
So `organic` and `paid` are summed over whatever channel nodes exist below the
node, and `existing` is whatever is left over. That makes "Existing clients" a
bucket holding the real channel plus everyone with no channel data at all, which
is why the company chart is almost entirely one band, and why Branch 2 and
Branch 3 show as a single full bar. They are not really all existing clients, we
just have nothing else to say about them.

**The design only covers one state and one width.** No loading, error, empty,
focus or narrow layout, but the brief asks for all of them.

## Next

- Settle what the chart should stack: channels, or each node's children.
- Decide whether expanding a row should re-scope the chart to that node.
- Label the remainder band honestly for nodes with no channel data.
- Add tests for expand and collapse and for the chart mapping.
- Keep the expanded rows in the URL so a view can be shared.
