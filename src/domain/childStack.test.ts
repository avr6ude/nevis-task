import { describe, expect, it } from "vitest";
import companyData from "@/data/company.json";
import type { ClientNode } from "@/types";
import { toChildStack } from "./childStack";
import { deepestExpanded, findNode } from "./clients";
import { MONTHS } from "./schema";

const company = companyData as ClientNode;

function node(id: string): ClientNode {
  const found = findNode(company, id);
  if (!found) throw new Error(`fixture node ${id} not found`);
  return found;
}

const BRANCH_1 = "d6b668e1-89a4-4467-bdf6-c9ebaf2cea5f";
const BRANCH_2 = "71da0b06-5785-4a60-9273-4df2be619ee4";
const ANNA = "e3c4637b-2f21-4b7e-883e-b13ae1a6df6a";

function forMonth(stack: ReturnType<typeof toChildStack>, month: string) {
  const found = stack.data.find((d) => d.month === month);
  if (!found) throw new Error(`no row for ${month}`);
  return found;
}

describe("toChildStack", () => {
  it("stacks the level directly beneath the focused node", () => {
    expect(toChildStack(company).series.map((s) => s.label)).toEqual([
      "Branch 1",
      "Branch 2",
      "Branch 3",
    ]);

    expect(toChildStack(node(BRANCH_1)).series.map((s) => s.label)).toEqual([
      "Anna Blackwood",
      "James Walker",
      "Maria Gutierrez",
      "Robert Chen",
      "Sarah Smith",
    ]);
  });

  it("reproduces the design's channel legend when scoped to an adviser", () => {
    expect(toChildStack(node(ANNA)).series.map((s) => s.label)).toEqual([
      "Existing clients",
      "New organic",
      "New paid",
    ]);
  });

  it("shows a leaf as a single band of its own value", () => {
    const branch2 = node(BRANCH_2);
    const stack = toChildStack(branch2);

    expect(stack.series).toEqual([{ key: branch2.id, label: "Branch 2" }]);
    stack.data.forEach((datum, i) => {
      expect(datum[branch2.id]).toBe(branch2.values[i]);
      expect(datum.total).toBe(branch2.values[i]);
    });
  });

  it("returns one datum per month, in order", () => {
    expect(toChildStack(company).data.map((d) => d.month)).toEqual([...MONTHS]);
  });

  it("totals every segment it draws", () => {
    const stack = toChildStack(company);
    for (const datum of stack.data) {
      const summed = stack.series.reduce(
        (t, s) => t + (datum[s.key] as number),
        0,
      );
      expect(datum.total).toBe(summed);
    }
  });

  it("keeps the node's own figure alongside the summed children", () => {
    const may = forMonth(toChildStack(company), "May 2024");
    expect(may.total).toBe(279);
    expect(may.reported).toBe(301);

    const aug = forMonth(toChildStack(node(BRANCH_1)), "Aug 2024");
    expect(aug.total).toBe(216);
    expect(aug.reported).toBe(214);
  });

  it("agrees with the node's own figure where the data reconciles", () => {
    const feb = forMonth(toChildStack(company), "Feb 2024");
    expect(feb.total).toBe(feb.reported);
  });
});

describe("deepestExpanded", () => {
  const ids = (...v: string[]) => new Set(v);

  it("stays on the root when nothing below it is open", () => {
    expect(deepestExpanded(company, ids(company.id)).name).toBe("Company");
    expect(deepestExpanded(company, ids()).name).toBe("Company");
  });

  it("descends while exactly one child is open", () => {
    expect(deepestExpanded(company, ids(company.id, BRANCH_1)).name).toBe(
      "Branch 1",
    );
    expect(deepestExpanded(company, ids(company.id, BRANCH_1, ANNA)).name).toBe(
      "Anna Blackwood",
    );
  });

  it("stops at the common parent when siblings are open", () => {
    expect(
      deepestExpanded(company, ids(company.id, BRANCH_1, BRANCH_2)).name,
    ).toBe("Company");
  });
});
