import type { ChildStack, StackDatum } from "@domain/childStack";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { BarStack } from "@visx/shape";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";
import { useEffect, useMemo, useRef, useState } from "react";
import { Legend } from "./Legend";
import "./ClientsChart.css";

export interface ClientsChartProps {
  stack: ChildStack;
  scopeLabel: string;
  height?: number;
}

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

function niceCeiling(max: number): number {
  if (max <= 0) return 10;
  const step = max <= 50 ? 10 : max <= 200 ? 50 : 100;
  return Math.ceil(max / step) * step;
}

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
        domain: [0, niceCeiling(Math.max(1, ...data.map((d) => d.total)))],
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
    <div className="chart__svg-wrap" ref={wrapRef}>
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
                const clipId = `bar-clip-${monthIndex}`;

                return (
                  <g
                    key={`${scopeKey}-${datum.month}`}
                    className="chart__bar"
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
          className="chart__tooltip"
          unstyled
        >
          {(() => {
            const datum = data[tooltipData.monthIndex];
            const drifted = datum.total !== datum.reported;
            return (
              <>
                <div className="chart__tooltip-title">{datum.month}</div>
                {series.map((s) => (
                  <div key={s.key} className="chart__tooltip-row">
                    <span>
                      <span
                        className="chart__tooltip-swatch"
                        style={{ background: colorScale(s.key) }}
                      />
                      {s.label}
                    </span>
                    <strong>{(datum[s.key] as number).toLocaleString()}</strong>
                  </div>
                ))}
                <div className="chart__tooltip-meta">
                  Total {datum.total.toLocaleString()}
                  {drifted && (
                    <span className="chart__tooltip-drift">
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

export function ClientsChart({
  stack,
  scopeLabel,
  height = 360,
}: ClientsChartProps) {
  const [plotRef, width] = useElementWidth();

  return (
    <figure className="chart">
      <figcaption className="visually-hidden">
        Stacked bar chart of monthly client counts for {scopeLabel}, split by
        the level directly beneath it. The same figures are in the table below.
      </figcaption>
      <div className="chart__plot" style={{ height }} ref={plotRef}>
        {width > 0 && (
          <InnerChart stack={stack} width={width} height={height} />
        )}
      </div>
      <Legend series={stack.series} palette={PALETTE} />
    </figure>
  );
}
