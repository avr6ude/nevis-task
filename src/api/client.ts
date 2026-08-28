import type { TreeNode } from "@/types";

export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`Request to /api/clients failed with ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetchTree(signal?: AbortSignal): Promise<TreeNode> {
  const res = await fetch("/api/clients", { signal });
  if (!res.ok) {
    throw new ApiError(res.status);
  }
  return (await res.json()) as TreeNode;
}
