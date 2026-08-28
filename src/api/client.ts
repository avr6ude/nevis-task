import type { ClientNode } from "@/types";

/**
 * Only two outcomes change what someone can do about it: they are offline, or
 * the request failed for a reason on our side. `status` is kept for logging.
 */
export type ApiErrorKind = "offline" | "failed";

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
    throw new ApiError("offline");
  }

  if (!res.ok) {
    throw new ApiError("failed", res.status);
  }

  try {
    return (await res.json()) as ClientNode;
  } catch {
    throw new ApiError("failed");
  }
}
