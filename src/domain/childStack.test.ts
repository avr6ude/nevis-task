import { describe, expect, it } from "vitest";
import companyData from "@/data/company.json";
import type { ClientNode, ClientsData } from "@/domain/schema";
import { toChildStack } from "./childStack";
import { deepestExpanded, getChildren, rollUp } from "./clients";

const { months: MONTHS, root: company } = companyData as ClientsData;

function findNode(root: ClientNode, id: string): ClientNode | undefined {
  if (root.id === id) return root;
  for (const child of getChildren(root) ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return undefined;
}

function node(id: string): ClientNode {
  const found = findNode(company, id);
  if (!found) throw new Error(`fixture node ${id} not found`);
  return found;
}

const BRANCH_1 = "d6b668e1-89a4-4467-bdf6-c9ebaf2cea5f";
const BRANCH_2 = "71da0b06-5785-4a60-9273-4df2be619ee4";
const ANNA = "e3c4637b-2f21-4b7e-883e-b13ae1a6df6a";

describe("toChildStack", () => {
  it("stacks the level directly beneath the focused node", () => {
    expect(toChildStack(company, MONTHS).series.map((s) => s.label)).toEqual([
      "Branch 1",
      "Branch 2",
      "Branch 3",
    ]);

    expect(
      toChildStack(node(BRANCH_1), MONTHS).series.map((s) => s.label),
    ).toEqual([
      "Anna Blackwood",
      "James Walker",
      "Maria Gutierrez",
      "Robert Chen",
      "Sarah Smith",
    ]);
  });

  it("reproduces the design's channel legend when scoped to an adviser", () => {
    expect(toChildStack(node(ANNA), MONTHS).series.map((s) => s.label)).toEqual(
      ["Existing clients", "New organic", "New paid"],
    );
  });

  it("shows a leaf as a single band of its own value", () => {
    const branch2 = node(BRANCH_2);
    const stack = toChildStack(branch2, MONTHS);

    expect(stack.series).toEqual([{ key: branch2.id, label: "Branch 2" }]);
    stack.data.forEach((datum, i) => {
      expect(datum[branch2.id]).toBe(branch2.values[i]);
      expect(datum.total).toBe(branch2.values[i]);
    });
  });

  it("returns one datum per month, in order", () => {
    expect(toChildStack(company, MONTHS).data.map((d) => d.month)).toEqual([
      ...MONTHS,
    ]);
  });

  it("totals every segment it draws", () => {
    const stack = toChildStack(company, MONTHS);
    for (const datum of stack.data) {
      const summed = stack.series.reduce(
        (t, s) => t + (datum[s.key] as number),
        0,
      );
      expect(datum.total).toBe(summed);
    }
  });
});

describe("rollUp", () => {
  const rolled = rollUp(company);
  const at = (n: ClientNode, month: string) => n.values[MONTHS.indexOf(month)];

  it("replaces a parent's figure with the sum of its children", () => {
    expect(at(company, "May 2024")).toBe(301);
    expect(at(rolled, "May 2024")).toBe(278);
  });

  it("rolls up from the deepest level first", () => {
    const branch1 = findNode(rolled, BRANCH_1);
    expect(at(node(BRANCH_1), "Aug 2024")).toBe(214);
    expect(at(branch1!, "Aug 2024")).toBe(214);
  });

  it("leaves nodes without children untouched", () => {
    const anna = findNode(company, ANNA);
    const rolledAnna = findNode(rolled, ANNA);
    const channels = getChildren(rolledAnna!) ?? [];
    expect(channels.map((c) => c.values)).toEqual(
      (getChildren(anna!) ?? []).map((c) => c.values),
    );
  });

  it("makes every parent equal the sum of its children", () => {
    const check = (n: ClientNode) => {
      const kids = getChildren(n);
      if (!kids?.length) return;
      for (const [i] of MONTHS.entries()) {
        expect(n.values[i]).toBe(
          kids.reduce((sum, k) => sum + (k.values[i] ?? 0), 0),
        );
      }
      for (const k of kids) check(k);
    };
    check(rolled);
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
