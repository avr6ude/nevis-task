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
  offline?: boolean;
}

const MESSAGES: Record<ApiErrorKind, ErrorCopy> = {
  network: {
    title: "Can’t reach the server",
    detail: "Check your connection, then try again.",
    offline: true,
  },
  server: {
    title: "The server couldn’t return the client data",
    detail: "Something failed on their side. This is usually temporary.",
  },
  request: {
    title: "Client data not found",
    detail: "The server rejected the request for this dataset.",
  },
  parse: {
    title: "The client data was unreadable",
    detail: "The server replied, but not with data we could parse.",
  },
};

const FALLBACK: ErrorCopy = {
  title: "Couldn’t load the client data",
  detail: "Something went wrong on the way.",
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
      <span className="data-error__glyph" aria-hidden="true">
        {copy.offline ? <OfflineIcon /> : <AlertIcon />}
      </span>

      <div className="data-error__text">
        <p className="data-error__title">{copy.title}</p>
        <p className="data-error__detail">
          {copy.detail}
          {status !== undefined && (
            <span className="data-error__code"> (error {status})</span>
          )}
        </p>
      </div>

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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7.5v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6.5 18h10a4 4 0 0 0 .6-7.96 6 6 0 0 0-10.9-2.2A4.25 4.25 0 0 0 6.5 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m4 4 16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
