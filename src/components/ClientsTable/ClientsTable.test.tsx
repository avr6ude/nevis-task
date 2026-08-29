import { useExpandedRows } from "@hooks/useExpandedRows";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import companyData from "@/data/company.json";
import type { ClientNode } from "@/types";
import { ClientsTable } from "./ClientsTable";

const company = companyData as ClientNode;

function Harness() {
  const { expandedIds, toggle } = useExpandedRows([company.id]);
  return (
    <ClientsTable root={company} expandedIds={expandedIds} onToggle={toggle} />
  );
}

const row = (name: string | RegExp) => screen.getByRole("row", { name });
const queryRow = (name: string | RegExp) => screen.queryByRole("row", { name });

describe("ClientsTable expand and collapse", () => {
  beforeEach(() => {
    render(<Harness />);
  });

  it("starts with the company open and the branches collapsed", () => {
    expect(row(/Company/)).toHaveAttribute("aria-expanded", "true");
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "false");
    expect(queryRow(/Anna Blackwood/)).not.toBeInTheDocument();
  });

  it("reveals and hides the level beneath when the control is clicked", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Expand Branch 1" }));

    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "true");
    expect(row(/Anna Blackwood/)).toBeInTheDocument();
    expect(row(/Sarah Smith/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Collapse Branch 1" }));

    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "false");
    expect(queryRow(/Anna Blackwood/)).not.toBeInTheDocument();
  });

  it("opens and closes from a click anywhere on the row", async () => {
    const user = userEvent.setup();

    await user.click(screen.getByText("Branch 1"));
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "true");
    expect(row(/Anna Blackwood/)).toBeInTheDocument();

    await user.click(screen.getByText("Branch 1"));
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "false");
    expect(queryRow(/Anna Blackwood/)).not.toBeInTheDocument();
  });

  it("expands and collapses from the keyboard", async () => {
    const user = userEvent.setup();
    row(/Branch 1/).focus();

    await user.keyboard("{ArrowRight}");
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "true");
    expect(row(/Anna Blackwood/)).toBeInTheDocument();

    row(/Branch 1/).focus();
    await user.keyboard("{ArrowLeft}");
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "false");
    expect(queryRow(/Anna Blackwood/)).not.toBeInTheDocument();
  });

  it("toggles on Enter and Space", async () => {
    const user = userEvent.setup();
    row(/Branch 1/).focus();

    await user.keyboard("{Enter}");
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "true");

    row(/Branch 1/).focus();
    await user.keyboard(" ");
    expect(row(/Branch 1/)).toHaveAttribute("aria-expanded", "false");
  });

  it("moves between visible rows with the arrow keys", async () => {
    const user = userEvent.setup();
    row(/Company/).focus();

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(row(/Branch 1/)).toHaveFocus());

    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(row(/Company/)).toHaveFocus());
  });

  it("keeps exactly one row in the tab order", async () => {
    const user = userEvent.setup();
    const tabbable = () =>
      screen.getAllByRole("row").filter((r) => r.tabIndex === 0);

    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(row(/Company/));

    row(/Company/).focus();
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(tabbable()).toHaveLength(1);
      expect(tabbable()[0]).toBe(row(/Branch 1/));
    });
  });

  it("gives no expand control to a node without children", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Expand Branch 1" }));

    expect(row(/James Walker/)).not.toHaveAttribute("aria-expanded");
    expect(
      within(row(/James Walker/)).queryByRole("button"),
    ).not.toBeInTheDocument();
    expect(
      within(row(/Branch 2/)).queryByRole("button"),
    ).not.toBeInTheDocument();
  });

  it("nests each level one step deeper", async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Expand Branch 1" }));
    await user.click(
      screen.getByRole("button", { name: "Expand Anna Blackwood" }),
    );

    expect(row(/Company/)).toHaveAttribute("aria-level", "1");
    expect(row(/Branch 1/)).toHaveAttribute("aria-level", "2");
    expect(row(/Anna Blackwood/)).toHaveAttribute("aria-level", "3");
    expect(row(/New organic/)).toHaveAttribute("aria-level", "4");
  });
});
