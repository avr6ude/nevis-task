import { CHANNEL_KEYS, CHANNEL_LABELS } from "@domain/channelStack";
import "./Legend.css";

const SWATCH: Record<(typeof CHANNEL_KEYS)[number], string> = {
  existing: "var(--color-existing)",
  organic: "var(--color-organic)",
  paid: "var(--color-paid)",
};

export function Legend() {
  return (
    <ul className="chart-legend">
      {CHANNEL_KEYS.map((key) => (
        <li key={key} className="chart-legend__item">
          <span
            className="chart-legend__swatch"
            style={{ background: SWATCH[key] }}
            aria-hidden="true"
          />
          {CHANNEL_LABELS[key]}
        </li>
      ))}
    </ul>
  );
}
