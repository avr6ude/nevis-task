import type { ChildStack, StackDatum } from "@domain/childStack";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { BarStack } from "@visx/shape";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./ClientsChart.module.css";
import { Legend } from "./Legend";

export interface ClientsChartProps {
  stack: ChildStack;
  scopeLabel: string;
}

const HEIGHT = 360;

const MARGIN = { top: 8, right: 8, bottom: 28, left: 36 } as const;

const FULL_LABEL_WIDTH = 68;
const SHORT_LABEL_WIDTH = 34;

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

interface TooltipDatum {
  monthIndex: number;
}

function InnerChart({
  stack,
  width,
  height,
}: {
  stack: ChildStack;
  width: number;
  height: number;
}) {
  const { series, data } = stack;
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const keys = useMemo(() => series.map((s) => s.key), [series]);
  const scopeKey = keys.join("|");
  const clipPrefix = useId();

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        domain: keys,
        range: PALETTE,
      }),
    [keys],
  );

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: data.map((d) => d.month),
        range: [0, innerWidth],
        padding: 0.28,
      }),
    [data, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(1, ...data.map((d) => d.total))],
        range: [innerHeight, 0],
        nice: true,
      }),
    [data, innerHeight],
  );

  const {
    tooltipData,
    tooltipTop,
    tooltipLeft,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipDatum>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const step = xScale.step();
    const gap = step - xScale.bandwidth();
    const firstBand = xScale(data[0]?.month ?? "") ?? 0;

    const handleMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const localX = event.clientX - rect.left - MARGIN.left;
      const index = Math.floor((localX - firstBand + gap / 2) / step);

      if (index < 0 || index >= data.length) {
        hideTooltip();
        return;
      }

      showTooltip({
        tooltipLeft: event.clientX - rect.left,
        tooltipTop: event.clientY - rect.top,
        tooltipData: { monthIndex: index },
      });
    };

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", hideTooltip);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", hideTooltip);
    };
  }, [xScale, data, showTooltip, hideTooltip]);

  const shortLabels = innerWidth < 640;
  const labelWidth = shortLabels ? SHORT_LABEL_WIDTH : FULL_LABEL_WIDTH;
  const stride = Math.max(
    1,
    Math.ceil(data.length / Math.max(1, Math.floor(innerWidth / labelWidth))),
  );
  const tickValues =
    stride > 1
      ? data.filter((_, i) => i % stride === 0).map((d) => d.month)
      : undefined;
  const formatTick = (month: string) =>
    shortLabels ? month.slice(0, 3) : month;

  return (
    <div className={styles.svgWrap} ref={wrapRef}>
      <svg
        ref={containerRef}
        width={width}
        height={height}
        aria-hidden="true"
        focusable="false"
      >
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            numTicks={4}
            stroke="var(--color-line-strong)"
            strokeDasharray="1 4"
          />
          <BarStack<StackDatum, string>
            data={data}
            keys={keys}
            x={(d) => d.month}
            xScale={xScale}
            yScale={yScale}
            color={(key) => colorScale(key)}
          >
            {(barStacks) =>
              data.map((datum, monthIndex) => {
                const segments = barStacks
                  .map((barStack) => ({
                    key: barStack.key,
                    bar: barStack.bars[monthIndex],
                  }))
                  .filter(({ bar }) => bar && bar.height > 0);

                if (segments.length === 0) return null;

                const first = segments[0].bar;
                const topY = Math.min(...segments.map((s) => s.bar.y));
                const bottomY = Math.max(
                  ...segments.map((s) => s.bar.y + s.bar.height),
                );
                const clipId = `${clipPrefix}-bar-${monthIndex}`;

                return (
                  <g
                    key={`${scopeKey}-${datum.month}`}
                    className={styles.bar}
                    style={{ animationDelay: `${monthIndex * 22}ms` }}
                  >
                    <clipPath id={clipId}>
                      <rect
                        x={first.x}
                        y={topY}
                        width={first.width}
                        height={bottomY - topY}
                        rx={6}
                        ry={6}
                      />
                    </clipPath>
                    <g clipPath={`url(#${clipId})`}>
                      {segments.map(({ key, bar }) => (
                        <rect
                          key={key}
                          x={bar.x}
                          y={bar.y}
                          width={bar.width}
                          height={bar.height}
                          fill={bar.color}
                        />
                      ))}
                    </g>
                  </g>
                );
              })
            }
          </BarStack>
          <AxisLeft
            scale={yScale}
            numTicks={4}
            hideAxisLine
            hideTicks
            tickLabelProps={() => ({
              fill: "var(--color-ink-secondary)",
              fontSize: 12,
              textAnchor: "end",
              dx: -4,
              dy: 4,
            })}
          />
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            hideAxisLine
            hideTicks
            tickValues={tickValues}
            tickFormat={formatTick}
            tickLabelProps={() => ({
              fill: "var(--color-ink-secondary)",
              fontSize: 12,
              textAnchor: "middle",
              dy: 4,
            })}
          />
        </Group>
      </svg>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          className={styles.tooltip}
          unstyled
        >
          {(() => {
            const datum = data[tooltipData.monthIndex];
            const drifted = datum.total !== datum.reported;
            return (
              <>
                <div className={styles.tooltipTitle}>{datum.month}</div>
                {series.map((s) => (
                  <div key={s.key} className={styles.tooltipRow}>
                    <span>
                      <span
                        className={styles.tooltipSwatch}
                        style={{ background: colorScale(s.key) }}
                      />
                      {s.label}
                    </span>
                    <strong>{(datum[s.key] as number).toLocaleString()}</strong>
                  </div>
                ))}
                <div className={styles.tooltipMeta}>
                  Total {datum.total.toLocaleString()}
                  {drifted && (
                    <span className={styles.tooltipDrift}>
                      reported {datum.reported.toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            );
          })()}
        </TooltipInPortal>
      )}
    </div>
  );
}

function useElementWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => setWidth(el.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export function ClientsChart({ stack, scopeLabel }: ClientsChartProps) {
  const [plotRef, width] = useElementWidth();
  const captionId = useId();

  return (
    <figure className={styles.chart} aria-labelledby={captionId}>
      <figcaption className="visually-hidden">
        Stacked bar chart of monthly client counts for {scopeLabel}, split by
        the level directly beneath it. The same figures are in the table below.
      </figcaption>
      <div className={styles.plot} style={{ height: HEIGHT }} ref={plotRef}>
        {width > 0 && (
          <InnerChart stack={stack} width={width} height={HEIGHT} />
        )}
      </div>
      <Legend series={stack.series} palette={PALETTE} />
      <ChartDataTable stack={stack} scopeLabel={scopeLabel} />
    </figure>
  );
}

function ChartDataTable({ stack, scopeLabel }: ClientsChartProps) {
  return (
    <table className="visually-hidden">
      <caption>Chart data for {scopeLabel}</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          {stack.series.map((s) => (
            <th scope="col" key={s.key}>
              {s.label}
            </th>
          ))}
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {stack.data.map((datum) => (
          <tr key={datum.month}>
            <th scope="row">{datum.month}</th>
            {stack.series.map((s) => (
              <td key={s.key}>{(datum[s.key] as number).toLocaleString()}</td>
            ))}
            <td>{datum.total.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const SKELETON_BARS = [62, 68, 74, 80, 86, 92, 100, 66, 66, 66, 66, 94].map(
  (height, id) => ({ id, height }),
);

export function ChartSkeleton() {
  return (
    <div className={styles.skeletonBars} aria-hidden="true">
      {SKELETON_BARS.map(({ id, height }) => (
        <span
          key={id}
          className={styles.skeletonBar}
          style={{
            height: `${height}%`,
            animationDelay: `${id * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return <p className={styles.empty}>{message}</p>;
}
