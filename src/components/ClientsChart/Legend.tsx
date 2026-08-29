import type { StackSeries } from "@domain/childStack";
import "./Legend.css";

export interface LegendProps {
  series: StackSeries[];
  palette: string[];
}

export function Legend({ series, palette }: LegendProps) {
  return (
    <ul className="chart-legend">
      {series.map((entry, i) => (
        <li key={entry.key} className="chart-legend__item">
          <span
            className="chart-legend__swatch"
            style={{ background: palette[i % palette.length] }}
            aria-hidden="true"
          />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}
