import { ApiError, type ApiErrorKind } from "@api/client";
import { Button } from "react-aria-components";
import "./States.css";

const BAR_HEIGHTS = [62, 68, 74, 80, 86, 92, 100, 66, 66, 66, 66, 94];

export function ChartSkeleton() {
  return (
    <div className="skeleton__bars" aria-hidden="true">
      {BAR_HEIGHTS.map((height, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder bars
          key={i}
          className="skeleton__bar"
          style={{ height: `${height}%`, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="skeleton__rows" aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className="skeleton__row">
          <span
            className="skeleton__line skeleton__line--name"
            style={{ marginLeft: row === 0 ? 0 : 28 }}
          />
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <span key={cell} className="skeleton__line skeleton__line--value" />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ErrorCopy {
  title: string;
  detail: string;
}

const MESSAGES: Record<ApiErrorKind, ErrorCopy> = {
  network: {
    title: "No connection",
    detail:
      "We couldn't reach the server. Check your connection and try again.",
  },
  server: {
    title: "Couldn't load clients",
    detail: "The server ran into a problem. This is usually temporary.",
  },
  request: {
    title: "Nothing to show",
    detail: "The server didn't return this dataset.",
  },
  parse: {
    title: "Couldn't read the response",
    detail: "The server replied with something we didn't expect.",
  },
};

const FALLBACK: ErrorCopy = {
  title: "Couldn't load clients",
  detail: "Something went wrong along the way.",
};

export interface DataErrorProps {
  error?: Error;
  onRetry: () => void;
}

/** Shown in place of the table rows when the request fails. */
export function DataError({ error, onRetry }: DataErrorProps) {
  const copy = error instanceof ApiError ? MESSAGES[error.kind] : FALLBACK;
  const status = error instanceof ApiError ? error.status : undefined;

  return (
    <div className="data-error" role="alert">
      <p className="data-error__title">{copy.title}</p>
      <p className="data-error__detail">
        {copy.detail}
        {status !== undefined && (
          <span className="data-error__code"> (error {status})</span>
        )}
      </p>
      <Button className="data-error__retry" onPress={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/** Quiet placeholder for the chart, which has no numbers to draw. */
export function ChartUnavailable() {
  return <p className="chart-unavailable">No data to chart yet.</p>;
}
