import { afterEach, describe, expect, it, vi } from "vitest";
import companyData from "@/data/company.json";
import { ApiError, fetchClients } from "./client";

function stubFetch(impl: (url: string) => Promise<Response> | never) {
  const spy = vi.fn(impl);
  vi.stubGlobal("fetch", spy);
  return spy;
}

const ok = () =>
  new Response(JSON.stringify(companyData), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("fetchClients", () => {
  it("returns the parsed tree", async () => {
    stubFetch(async () => ok());
    await expect(fetchClients()).resolves.toMatchObject({
      root: { name: "Company" },
    });
  });

  it("reports an unreachable server as offline", async () => {
    stubFetch(() => {
      throw new TypeError("Failed to fetch");
    });

    await expect(fetchClients()).rejects.toMatchObject({
      name: "ApiError",
      kind: "offline",
    });
  });

  it("reports a bad status as failed and keeps the code", async () => {
    stubFetch(async () => new Response("nope", { status: 500 }));

    const error = await fetchClients().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: "failed", status: 500 });
  });

  it("reports an unreadable body as failed", async () => {
    stubFetch(
      async () => new Response("<html>not json</html>", { status: 200 }),
    );

    await expect(fetchClients()).rejects.toMatchObject({ kind: "failed" });
  });

  it("rejects a well-formed response that does not match the schema", async () => {
    stubFetch(
      async () =>
        new Response(
          JSON.stringify({ id: "x", name: "Company", values: [1] }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
    );

    await expect(fetchClients()).rejects.toMatchObject({ kind: "invalid" });
  });

  it("rejects a node nested deep in the tree that is malformed", async () => {
    const broken = structuredClone(companyData) as Record<string, unknown>;
    const root = broken.root as Record<string, unknown>;
    const branches = root.branches as Record<string, unknown>[];
    const employees = branches[0].employees as Record<string, unknown>[];
    employees[0].values = [1, 2, 3];

    stubFetch(
      async () =>
        new Response(JSON.stringify(broken), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    await expect(fetchClients()).rejects.toMatchObject({ kind: "invalid" });
  });

  it("rejects a tree whose values do not line up with the months", async () => {
    const broken = structuredClone(companyData) as Record<string, unknown>;
    broken.months = ["Jan 2024", "Feb 2024"];

    stubFetch(
      async () =>
        new Response(JSON.stringify(broken), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    await expect(fetchClients()).rejects.toMatchObject({ kind: "invalid" });
  });

  it("forwards the fail and delay params from the page url", async () => {
    const spy = stubFetch(async () => ok());
    window.history.replaceState({}, "", "/?fail=1&delay=200&other=x");

    await fetchClients();

    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain("fail=1");
    expect(url).toContain("delay=200");
    expect(url).not.toContain("other");
  });
});
