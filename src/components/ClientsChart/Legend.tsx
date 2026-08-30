import type { StackSeries } from "@domain/childStack";
import styles from "./Legend.module.css";

export interface LegendProps {
  series: StackSeries[];
  palette: string[];
}

export function Legend({ series, palette }: LegendProps) {
  return (
    <ul className={styles.legend}>
      {series.map((entry, i) => (
        <li key={entry.key} className={styles.item}>
          <span
            className={styles.swatch}
            style={{ background: palette[i % palette.length] }}
            aria-hidden="true"
          />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}
