import type { ClientNode } from "@/types";

export type ApiErrorKind = "network" | "server" | "request" | "parse";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;

  constructor(kind: ApiErrorKind, status?: number) {
    super(
      `Request to /api/clients failed (${kind}${status ? ` ${status}` : ""})`,
    );
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function debugQuery(): string {
  const current = new URLSearchParams(window.location.search);
  const forwarded = new URLSearchParams();
  for (const key of ["fail", "delay"]) {
    const value = current.get(key);
    if (value !== null) forwarded.set(key, value);
  }
  const query = forwarded.toString();
  return query ? `?${query}` : "";
}

export async function fetchClients(signal?: AbortSignal): Promise<ClientNode> {
  let res: Response;

  try {
    res = await fetch(`/api/clients${debugQuery()}`, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("network");
  }

  if (!res.ok) {
    throw new ApiError(res.status >= 500 ? "server" : "request", res.status);
  }

  try {
    return (await res.json()) as ClientNode;
  } catch {
    throw new ApiError("parse");
  }
}
