import type { ClientNode } from "@/types";
import { getChildren, MONTHS } from "./clients";

export const CHANNEL_KEYS = ["existing", "organic", "paid"] as const;
export type ChannelKey = (typeof CHANNEL_KEYS)[number];

export const CHANNEL_LABELS: Record<ChannelKey, string> = {
  existing: "Existing clients",
  organic: "New organic",
  paid: "New paid",
};

export interface ChannelStackDatum {
  month: string;
  existing: number;
  organic: number;
  paid: number;
}

const NEW_ORGANIC = "New organic";
const NEW_PAID = "New paid";

function addInto(acc: number[], values: number[]): void {
  for (let i = 0; i < acc.length; i++) {
    acc[i] += values[i] ?? 0;
  }
}

export function toChannelStack(focus: ClientNode): ChannelStackDatum[] {
  const organic = new Array<number>(MONTHS.length).fill(0);
  const paid = new Array<number>(MONTHS.length).fill(0);

  const visit = (node: ClientNode): void => {
    if (node.name === NEW_ORGANIC) addInto(organic, node.values);
    else if (node.name === NEW_PAID) addInto(paid, node.values);
    for (const child of getChildren(node) ?? []) visit(child);
  };
  visit(focus);

  return MONTHS.map((month, i) => ({
    month,
    organic: organic[i],
    paid: paid[i],
    existing: Math.max(0, (focus.values[i] ?? 0) - organic[i] - paid[i]),
  }));
}
