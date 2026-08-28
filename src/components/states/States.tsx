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

export interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__message">Couldn’t load the client data.</p>
      <Button className="state__retry" onPress={onRetry}>
        Try again
      </Button>
    </div>
  );
}
