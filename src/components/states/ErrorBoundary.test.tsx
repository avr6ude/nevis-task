import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("render exploded");
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  it("keeps siblings alive when one section crashes", () => {
    render(
      <div>
        <ErrorBoundary label="chart">
          <Boom />
        </ErrorBoundary>
        <ErrorBoundary label="table">
          <p>table still here</p>
        </ErrorBoundary>
      </div>,
    );

    expect(screen.getByText("table still here")).toBeInTheDocument();
    expect(screen.getByText(/chart stopped working/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/table stopped working/i),
    ).not.toBeInTheDocument();
  });

  it("offers a reload that reloads the page", async () => {
    const reload = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      reload,
    } as unknown as Location);

    render(
      <ErrorBoundary label="chart">
        <Boom />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
