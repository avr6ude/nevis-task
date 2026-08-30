import { useCallback } from "react";
import useSWR from "swr";
import type { ClientNode } from "@/types";
import { fetchClients } from "./client";

export const CLIENTS_KEY = "/api/clients";

export type ClientsState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ok"; data: ClientNode; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

export function useClients(): ClientsState & { refetch: () => void } {
  const { data, error, mutate } = useSWR<ClientNode, Error>(
    CLIENTS_KEY,
    fetchClients,
    { shouldRetryOnError: false },
  );

  const refetch = useCallback(() => {
    void mutate();
  }, [mutate]);

  if (data !== undefined) return { status: "ok", data, refetch };
  if (error) return { status: "error", error, refetch };
  return { status: "loading", refetch };
}
