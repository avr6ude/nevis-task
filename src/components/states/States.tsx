import { ApiError, type ApiErrorKind } from "@api/client";
import { MONTHS } from "@domain/clients";
import { Button } from "react-aria-components";
import styles from "./States.module.css";

const BAR_HEIGHTS = [62, 68, 74, 80, 86, 92, 100, 66, 66, 66, 66, 94];

export function ChartSkeleton() {
  return (
    <div className={styles.skeletonBars} aria-hidden="true">
      {MONTHS.map((month, i) => (
        <span
          key={month}
          className={styles.skeletonBar}
          style={{
            height: `${BAR_HEIGHTS[i]}%`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden="true">
      {[0, 1, 2, 3].map((row) => (
        <div key={row} className={styles.skeletonRow}>
          <span
            className={`${styles.skeletonLine} ${styles.skeletonLineName}`}
            style={{ marginLeft: row === 0 ? 0 : 28 }}
          />
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <span
              key={cell}
              className={`${styles.skeletonLine} ${styles.skeletonLineValue}`}
            />
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

/** Shown in place of the table rows when the request fails. */
export function DataError({ error, onRetry }: DataErrorProps) {
  const copy =
    error instanceof ApiError ? MESSAGES[error.kind] : MESSAGES.failed;

  return (
    <div className={styles.error} role="alert">
      <p className={styles.errorTitle}>{copy.title}</p>
      <p className={styles.errorDetail}>{copy.detail}</p>
      <Button className={styles.errorRetry} onPress={onRetry}>
        Try again
      </Button>
    </div>
  );
}

/** Quiet placeholder for the chart, which has no numbers to draw. */
export function ChartUnavailable({ message }: { message: string }) {
  return <p className={styles.chartUnavailable}>{message}</p>;
}
