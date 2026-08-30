import { type ClientsData, clientsDataSchema } from "@/domain/schema";

export type ApiErrorKind = "offline" | "failed" | "invalid";

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
  if (!import.meta.env.DEV) return "";

  const current = new URLSearchParams(window.location.search);
  const forwarded = new URLSearchParams();
  for (const key of ["fail", "delay", "bad"]) {
    const value = current.get(key);
    if (value !== null) forwarded.set(key, value);
  }
  const query = forwarded.toString();
  return query ? `?${query}` : "";
}

export async function fetchClients(): Promise<ClientsData> {
  let res: Response;

  try {
    res = await fetch(`/api/clients${debugQuery()}`);
  } catch {
    throw new ApiError("offline");
  }

  if (!res.ok) {
    throw new ApiError("failed", res.status);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiError("failed");
  }

  const parsed = clientsDataSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("invalid");
  }

  return parsed.data;
}
