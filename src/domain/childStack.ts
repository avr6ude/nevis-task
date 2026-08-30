import type { ClientNode } from "@/domain/schema";
import { getChildren } from "./clients";

export interface StackSeries {
  key: string;
  label: string;
}

export interface StackDatum {
  month: string;
  total: number;
  [seriesKey: string]: number | string;
}

export interface ChildStack {
  series: StackSeries[];
  data: StackDatum[];
}

export function toChildStack(focus: ClientNode, months: string[]): ChildStack {
  const children = getChildren(focus) ?? [];

  if (children.length === 0) {
    return {
      series: [{ key: focus.id, label: focus.name }],
      data: months.map((month, i) => {
        const value = focus.values[i] ?? 0;
        return { month, total: value, [focus.id]: value };
      }),
    };
  }

  return {
    series: children.map((child) => ({ key: child.id, label: child.name })),
    data: months.map((month, i) => {
      const datum: StackDatum = { month, total: 0 };
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
