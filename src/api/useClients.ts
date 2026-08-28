import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientNode } from "@/types";
import { fetchClients } from "./client";

export type ClientsState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ok"; data: ClientNode; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

export function useClients(): ClientsState & { refetch: () => void } {
  const [state, setState] = useState<ClientsState>({ status: "loading" });
  const reload = useRef<() => void>(() => {});

  useEffect(() => {
    let controller: AbortController | undefined;

    const run = () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;

      setState({ status: "loading" });
      fetchClients(signal)
        .then((data) => {
          if (!signal.aborted) setState({ status: "ok", data });
        })
        .catch((error: unknown) => {
          if (signal.aborted) return;
          setState({
            status: "error",
            error: error instanceof Error ? error : new Error(String(error)),
          });
        });
    };

    reload.current = run;
    run();

    return () => controller?.abort();
  }, []);

  const refetch = useCallback(() => reload.current(), []);

  return { ...state, refetch };
}
