import type { ClientNode } from "@/types";
import { getChildren } from "./clients";
import { MONTHS } from "./schema";

export interface StackSeries {
  key: string;
  label: string;
}

export interface StackDatum {
  month: string;
  total: number;
  reported: number;
  [seriesKey: string]: number | string;
}

export interface ChildStack {
  series: StackSeries[];
  data: StackDatum[];
}

export function toChildStack(focus: ClientNode): ChildStack {
  const children = getChildren(focus) ?? [];

  if (children.length === 0) {
    return {
      series: [{ key: focus.id, label: focus.name }],
      data: MONTHS.map((month, i) => {
        const value = focus.values[i] ?? 0;
        return { month, total: value, reported: value, [focus.id]: value };
      }),
    };
  }

  return {
    series: children.map((child) => ({ key: child.id, label: child.name })),
    data: MONTHS.map((month, i) => {
      const datum: StackDatum = {
        month,
        total: 0,
        reported: focus.values[i] ?? 0,
      };
      let total = 0;
      for (const child of children) {
        const value = child.values[i] ?? 0;
        datum[child.id] = value;
        total += value;
      }
      datum.total = total;
      return datum;
    }),
  };
}
