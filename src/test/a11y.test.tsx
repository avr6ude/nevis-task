import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { ClientsChart } from "@/components/ClientsChart/ClientsChart";
import { ClientsTable } from "@/components/ClientsTable/ClientsTable";
import companyData from "@/data/company.json";
import { toChildStack } from "@/domain/childStack";
import type { ClientsData } from "@/domain/schema";
import { useExpandedRows } from "@/hooks/useExpandedRows";

const { months, root: company } = companyData as ClientsData;

async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes[0]?.html ?? ""}`);
}

function Table({ open }: { open: string[] }) {
  const { expandedIds, toggle } = useExpandedRows(open);
  return (
    <ClientsTable
      root={company}
      months={months}
      expandedIds={expandedIds}
      onToggle={toggle}
    />
  );
}

describe("accessibility", () => {
  it("has no violations with the table collapsed", async () => {
    const { container } = render(<Table open={[company.id]} />);
    expect(await violations(container)).toEqual([]);
  });

  it("has no violations with the tree drilled open", async () => {
    const branch = company.branches?.[0];
    const adviser = branch?.employees?.[0];
    const { container } = render(
      <Table open={[company.id, branch?.id ?? "", adviser?.id ?? ""]} />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("has no violations on the chart", async () => {
    const { container } = render(
      <ClientsChart
        stack={toChildStack(company, months)}
        scopeLabel="Company"
      />,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("keeps the treegrid structure screen readers rely on", () => {
    const branch = company.branches?.[0];
    render(<Table open={[company.id, branch?.id ?? ""]} />);

    const grid = screen.getByRole("treegrid");
    expect(grid).toHaveAccessibleName();

    const header = within(grid).getAllByRole("row")[0];
    expect(within(header).getAllByRole("columnheader")).toHaveLength(13);

    expect(screen.getByRole("row", { name: /Company/ })).toHaveAttribute(
      "aria-level",
      "1",
    );
    expect(screen.getByRole("row", { name: /Branch 1/ })).toHaveAttribute(
      "aria-level",
      "2",
    );
    expect(screen.getByRole("row", { name: /Anna Blackwood/ })).toHaveAttribute(
      "aria-level",
      "3",
    );

    for (const row of within(grid).getAllByRole("row").slice(1)) {
      expect(within(row).getAllByRole("gridcell")).toHaveLength(13);
    }
  });

  it("exposes the chart's numbers as text", () => {
    render(
      <ClientsChart
        stack={toChildStack(company, months)}
        scopeLabel="Company"
      />,
    );

    const table = screen.getByRole("table", { name: /Chart data for Company/ });
    expect(within(table).getAllByRole("row")).toHaveLength(13);
    expect(
      within(table).getByRole("rowheader", { name: "Feb 2024" }),
    ).toBeInTheDocument();
  });
});
