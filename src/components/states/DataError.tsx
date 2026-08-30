import { ApiError, type ApiErrorKind } from "@api/client";
import { Button } from "react-aria-components";
import styles from "./DataError.module.css";

interface ErrorCopy {
  title: string;
  detail: string;
}

const MESSAGES: Record<ApiErrorKind, ErrorCopy> = {
  offline: {
    title: "You're offline",
    detail: "Check your connection, then try again.",
  },
  failed: {
    title: "Couldn't load clients",
    detail: "Something went wrong on our end. Try again in a moment.",
  },
};

export interface DataErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function DataError({ error, onRetry }: DataErrorProps) {
  const copy =
    error instanceof ApiError ? MESSAGES[error.kind] : MESSAGES.failed;

  return (
    <div className={styles.error} role="alert">
      <p className={styles.title}>{copy.title}</p>
      <p className={styles.detail}>{copy.detail}</p>
      <Button className={styles.retry} onPress={onRetry}>
        Try again
      </Button>
    </div>
  );
}
