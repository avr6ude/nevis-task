import { useCallback, useEffect, useRef, useState } from "react";
import type { TreeNode } from "@/types";
import { fetchTree } from "./client";

export type TreeState =
  | { status: "loading"; data?: undefined; error?: undefined }
  | { status: "ok"; data: TreeNode; error?: undefined }
  | { status: "error"; data?: undefined; error: Error };

export function useTree(): TreeState & { refetch: () => void } {
  const [state, setState] = useState<TreeState>({ status: "loading" });
  const reload = useRef<() => void>(() => {});

  useEffect(() => {
    let controller: AbortController | undefined;

    const run = () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;

      setState({ status: "loading" });
      fetchTree(signal)
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
