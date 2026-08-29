import { useCallback, useState } from "react";

export function useExpandedRows(initial: string[] = []) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(initial),
  );

  const toggle = useCallback((id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return { expandedIds, toggle };
}
