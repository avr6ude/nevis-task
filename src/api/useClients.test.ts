import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import companyData from "@/data/company.json";
import { useClients } from "./useClients";

const ok = () =>
  new Response(JSON.stringify(companyData), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const failed = () => new Response("nope", { status: 500 });

afterEach(() => vi.unstubAllGlobals());

describe("useClients", () => {
  it("starts loading and ends with the data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ok()),
    );

    const { result } = renderHook(() => useClients());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ok"));
    expect(result.current.data).toMatchObject({ name: "Company" });
    expect(result.current.error).toBeUndefined();
  });

  it("ends in an error state when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => failed()),
    );

    const { result } = renderHook(() => useClients());

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

    const { result } = renderHook(() => useClients());
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.refetch());

    await waitFor(() => expect(result.current.status).toBe("ok"));
    expect(result.current.data).toMatchObject({ name: "Company" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
