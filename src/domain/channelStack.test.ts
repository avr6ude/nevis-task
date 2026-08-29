import { describe, expect, it } from "vitest";
import companyData from "@/data/company.json";
import type { ClientNode } from "@/types";
import { toChannelStack } from "./channelStack";
import { findNode, MONTHS } from "./clients";

const company = companyData as ClientNode;

function node(id: string): ClientNode {
  const found = findNode(company, id);
  if (!found) throw new Error(`fixture node ${id} not found`);
  return found;
}

const JUL = "Jul 2024";

function forMonth(rows: ReturnType<typeof toChannelStack>, month: string) {
  const found = rows.find((d) => d.month === month);
  if (!found) throw new Error(`no row for ${month}`);
  return found;
}

function months(value: number): number[] {
  return new Array(MONTHS.length).fill(value);
}

const ANNA = "e3c4637b-2f21-4b7e-883e-b13ae1a6df6a";
const JAMES = "afe9ebc0-6c35-4690-80b0-20e9bc0d8c7d";
const BRANCH_2 = "71da0b06-5785-4a60-9273-4df2be619ee4";

describe("toChannelStack", () => {
  it("returns the twelve months in order", () => {
    expect(toChannelStack(company).map((d) => d.month)).toEqual([...MONTHS]);
  });

  it("makes each bar add up to the node's own total", () => {
    for (const focus of [company, ...(company.branches ?? []), node(ANNA)]) {
      toChannelStack(focus).forEach((datum, i) => {
        expect(datum.existing + datum.organic + datum.paid).toBe(
          focus.values[i],
        );
      });
    }
  });

  it("reads the channel split off an adviser that has one", () => {
    const anna = node(ANNA);
    const jul = forMonth(toChannelStack(anna), JUL);

    expect(jul.organic).toBe(2);
    expect(jul.paid).toBe(1);
    expect(jul.existing).toBe(anna.values[MONTHS.indexOf(JUL)] - 2 - 1);
  });

  it("adds up channels from every adviser beneath the focused node", () => {
    const twoAdvisers: ClientNode = {
      id: "co",
      name: "Company",
      values: months(100),
      branches: [
        {
          id: "br",
          name: "Branch",
          values: months(100),
          employees: [
            {
              id: "a1",
              name: "Adviser One",
              values: months(50),
              channels: [
                { id: "a1e", name: "Existing clients", values: months(40) },
                { id: "a1o", name: "New organic", values: months(7) },
                { id: "a1p", name: "New paid", values: months(3) },
              ],
            },
            {
              id: "a2",
              name: "Adviser Two",
              values: months(50),
              channels: [
                { id: "a2e", name: "Existing clients", values: months(45) },
                { id: "a2o", name: "New organic", values: months(4) },
                { id: "a2p", name: "New paid", values: months(1) },
              ],
            },
          ],
        },
      ],
    };

    for (const datum of toChannelStack(twoAdvisers)) {
      expect(datum.organic).toBe(11);
      expect(datum.paid).toBe(4);
      expect(datum.existing).toBe(85);
    }
  });

  it("shows a node with no channel data as one existing band", () => {
    for (const id of [BRANCH_2, JAMES]) {
      const focus = node(id);
      toChannelStack(focus).forEach((datum, i) => {
        expect(datum.organic).toBe(0);
        expect(datum.paid).toBe(0);
        expect(datum.existing).toBe(focus.values[i]);
      });
    }
  });

  it("never returns a negative band when a total is short", () => {
    const short: ClientNode = {
      id: "short",
      name: "Short total",
      values: new Array(MONTHS.length).fill(1),
      channels: [
        {
          id: "short-organic",
          name: "New organic",
          values: new Array(MONTHS.length).fill(5),
        },
      ],
    };

    for (const datum of toChannelStack(short)) {
      expect(datum.existing).toBe(0);
    }
  });
});
