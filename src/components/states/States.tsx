import { ApiError, type ApiErrorKind } from "@api/client";
import { Button } from "react-aria-components";
import "./States.css";

export function LoadingState() {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="visually-hidden">Loading client data…</span>
      <div
        className="state__skeleton state__skeleton--chart"
        aria-hidden="true"
      />
      <div
        className="state__skeleton state__skeleton--table"
        aria-hidden="true"
      />
    </div>
  );
}

const MESSAGES: Record<ApiErrorKind, { title: string; detail: string }> = {
  network: {
    title: "Can’t reach the server",
    detail: "Check your connection, then try again.",
  },
  server: {
    title: "The server couldn’t return the client data",
    detail: "This is usually temporary.",
  },
  request: {
    title: "Client data not found",
    detail: "The request was rejected by the server.",
  },
  parse: {
    title: "The client data was unreadable",
    detail: "The server returned a response we couldn’t parse.",
  },
};

const FALLBACK = {
  title: "Couldn’t load the client data",
  detail: "Something went wrong on the way.",
};

export interface ErrorStateProps {
  error?: Error;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { title, detail } =
    error instanceof ApiError ? MESSAGES[error.kind] : FALLBACK;

  return (
    <div className="state state--error" role="alert">
      <p className="state__message">{title}</p>
      <p className="state__detail">{detail}</p>
      <Button className="state__retry" onPress={onRetry}>
        Try again
      </Button>
    </div>
  );
}
