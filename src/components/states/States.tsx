import { ApiError, type ApiErrorKind } from "@api/client";
import { Button } from "react-aria-components";
import "./States.css";

export function LoadingState() {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="visually-hidden">Loading client data…</span>

      <div className="card state__panel" aria-hidden="true">
        <div className="state__bars">
          {[62, 68, 74, 80, 86, 92, 100, 66, 66, 66, 66, 94].map(
            (height, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder bars
                key={i}
                className="state__bar"
                style={{ height: `${height}%`, animationDelay: `${i * 60}ms` }}
              />
            ),
          )}
        </div>
      </div>

      <div className="card state__panel state__panel--rows" aria-hidden="true">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="state__row">
            <span
              className="state__line state__line--name"
              style={{ marginLeft: `${row === 0 ? 0 : 28}px` }}
            />
            <span className="state__line state__line--value" />
            <span className="state__line state__line--value" />
            <span className="state__line state__line--value" />
            <span className="state__line state__line--value" />
            <span className="state__line state__line--value" />
            <span className="state__line state__line--value" />
          </div>
        ))}
      </div>
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
    detail:
      "The client data service isn’t responding. Check your connection, then try again.",
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
  detail: "Something went wrong on the way. Try again in a moment.",
};

export interface ErrorStateProps {
  error?: Error;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const copy = error instanceof ApiError ? MESSAGES[error.kind] : FALLBACK;
  const status = error instanceof ApiError ? error.status : undefined;

  return (
    <div className="card state__error" role="alert">
      <span className="state__glyph" aria-hidden="true">
        {copy.offline ? <OfflineIcon /> : <AlertIcon />}
      </span>

      <h2 className="state__title">{copy.title}</h2>
      <p className="state__detail">{copy.detail}</p>

      <Button className="state__retry" onPress={onRetry}>
        Try again
      </Button>

      {status !== undefined && <p className="state__code">Error {status}</p>}
    </div>
  );
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
