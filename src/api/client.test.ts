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
    await expect(fetchClients()).resolves.toMatchObject({ name: "Company" });
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
