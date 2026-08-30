import useSWR from "swr";
import type { ClientsData } from "@/domain/schema";
import { fetchClients } from "./client";

const CLIENTS_KEY = "/api/clients";

export type ClientsState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ok"; data: ClientsData; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

export function useClients(): ClientsState & { refetch: () => void } {
  const { data, error, mutate } = useSWR<ClientsData, Error>(
    CLIENTS_KEY,
    fetchClients,
    { shouldRetryOnError: false },
  );

  const refetch = () => {
    void mutate();
  };

  if (data !== undefined) return { status: "ok", data, refetch };
  if (error) return { status: "error", error, refetch };
  return { status: "loading", refetch };
}
