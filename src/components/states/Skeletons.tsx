import { MONTHS } from "@domain/clients";
import styles from "./Skeletons.module.css";

const BAR_HEIGHTS = [62, 68, 74, 80, 86, 92, 100, 66, 66, 66, 66, 94];
const PLACEHOLDER_ROWS = [0, 1, 2, 3];
const PLACEHOLDER_CELLS = [0, 1, 2, 3, 4, 5];

export function ChartSkeleton() {
  return (
    <div className={styles.bars} aria-hidden="true">
      {MONTHS.map((month, i) => (
        <span
          key={month}
          className={styles.bar}
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
    <div className={styles.rows} aria-hidden="true">
      {PLACEHOLDER_ROWS.map((row) => (
        <div key={row} className={styles.row}>
          <span
            className={`${styles.line} ${styles.name}`}
            style={{ marginLeft: row === 0 ? 0 : 28 }}
          />
          {PLACEHOLDER_CELLS.map((cell) => (
            <span key={cell} className={`${styles.line} ${styles.value}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
