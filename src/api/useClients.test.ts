import { act, renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import companyData from "@/data/company.json";
import { useClients } from "./useClients";

const ok = () =>
  new Response(JSON.stringify(companyData), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const failed = () => new Response("nope", { status: 500 });

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
  );

const renderClients = () => renderHook(() => useClients(), { wrapper });

afterEach(() => vi.unstubAllGlobals());

describe("useClients", () => {
  it("starts loading and ends with the data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ok()),
    );

    const { result } = renderClients();
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ok"));
    expect(result.current.data).toMatchObject({ root: { name: "Company" } });
    expect(result.current.error).toBeUndefined();
  });

  it("ends in an error state when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => failed()),
    );

    const { result } = renderClients();

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toMatchObject({ kind: "failed" });
    expect(result.current.data).toBeUndefined();
  });

  it("recovers when refetch succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => failed())
      .mockImplementationOnce(async () => ok());
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderClients();
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.status).toBe("ok"));
    expect(result.current.data).toMatchObject({ root: { name: "Company" } });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
