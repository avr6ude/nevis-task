import { Avatar } from "@components/Avatar/Avatar";
import { ChevronRight } from "@components/icons/ChevronRight";
import { getChildren, MONTHS } from "@domain/clients";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import type { ClientNode } from "@/types";
import "./ClientsTable.css";

export interface ClientsTableProps {
  root: ClientNode;
  defaultExpandedIds?: string[];
}

const ADVISER_LEVEL = 3;

function MonthHeader() {
  return (
    <thead>
      <tr role="row">
        <th role="columnheader" scope="col" className="clients-table__name-col">
          Name
        </th>
        {MONTHS.map((month) => (
          <th role="columnheader" scope="col" key={month}>
            {month}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * The table shell with its month columns but no rows. Keeps the page from
 * collapsing while the data is loading or after it failed.
 */
export function ClientsTableShell({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="clients-table-container"
        tabIndex={0}
        role="group"
        aria-label="Month columns"
      >
        <table className="clients-table">
          <MonthHeader />
        </table>
      </div>
      <div className="clients-table__slot">{children}</div>
    </>
  );
}

interface FlatRow {
  node: ClientNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}

function flattenNodes(
  node: ClientNode,
  expandedIds: Set<string>,
  level = 1,
): FlatRow[] {
  const children = getChildren(node) ?? [];
  const expanded = expandedIds.has(node.id);

  const row: FlatRow = {
    node,
    level,
    hasChildren: children.length > 0,
    expanded,
  };

  if (!expanded) {
    return [row];
  }

  return [
    row,
    ...children.flatMap((child) => flattenNodes(child, expandedIds, level + 1)),
  ];
}

function findParentIndex(rows: FlatRow[], index: number): number | null {
  const current = rows[index];

  if (!current || current.level === 1) {
    return null;
  }

  for (let i = index - 1; i >= 0; i--) {
    if (rows[i].level === current.level - 1) {
      return i;
    }
  }

  return null;
}

export function ClientsTable({ root, defaultExpandedIds }: ClientsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? [root.id]),
  );
  const [focusedId, setFocusedId] = useState(root.id);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  const rows = useMemo(
    () => flattenNodes(root, expandedIds),
    [root, expandedIds],
  );

  const setRowRef = useCallback(
    (id: string, element: HTMLTableRowElement | null) => {
      if (element) {
        rowRefs.current.set(id, element);
      } else {
        rowRefs.current.delete(id);
      }
    },
    [],
  );

  const focusRow = useCallback((id: string) => {
    setFocusedId(id);
    requestAnimationFrame(() => {
      rowRefs.current.get(id)?.focus();
    });
  }, []);

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

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: FlatRow,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = rows[index + 1];
        if (next) focusRow(next.node.id);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const previous = rows[index - 1];
        if (previous) focusRow(previous.node.id);
        break;
      }

      case "ArrowRight": {
        event.preventDefault();
        if (row.hasChildren && !row.expanded) {
          toggle(row.node.id);
        } else if (row.hasChildren && row.expanded) {
          const child = rows[index + 1];
          if (child?.level === row.level + 1) focusRow(child.node.id);
        }
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();
        if (row.hasChildren && row.expanded) {
          toggle(row.node.id);
        } else {
          const parentIndex = findParentIndex(rows, index);
          if (parentIndex !== null) focusRow(rows[parentIndex].node.id);
        }
        break;
      }

      case "Enter":
      case " ": {
        if (row.hasChildren) {
          event.preventDefault();
          toggle(row.node.id);
        }
        break;
      }

      case "Home": {
        event.preventDefault();
        if (rows[0]) focusRow(rows[0].node.id);
        break;
      }

      case "End": {
        event.preventDefault();
        const last = rows[rows.length - 1];
        if (last) focusRow(last.node.id);
        break;
      }

      default:
        break;
    }
  };

  useEffect(() => {
    if (!rows.some((row) => row.node.id === focusedId)) {
      setFocusedId(rows[0]?.node.id ?? root.id);
    }
  }, [rows, focusedId, root.id]);

  return (
    <div
      className="clients-table-container"
      tabIndex={0}
      role="group"
      aria-label="Client table, scrolls horizontally"
    >
      <table
        role="treegrid"
        aria-label="Clients by company, branch, adviser and acquisition channel"
        className="clients-table"
      >
        <MonthHeader />

        <tbody>
          {rows.map((row, index) => {
            const { node, level, hasChildren, expanded } = row;
            const isFocused = focusedId === node.id;

            return (
              <tr
                key={node.id}
                ref={(element) => setRowRef(node.id, element)}
                role="row"
                tabIndex={isFocused ? 0 : -1}
                aria-level={level}
                aria-expanded={hasChildren ? expanded : undefined}
                onFocus={() => setFocusedId(node.id)}
                onClick={() => {
                  if (!hasChildren) return;
                  toggle(node.id);
                  focusRow(node.id);
                }}
                onKeyDown={(event) => handleKeyDown(event, row, index)}
                className={[
                  "clients-table__row",
                  hasChildren && "clients-table__row--interactive",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <td role="gridcell" className="clients-table__name-col">
                  <div
                    className="clients-table__cell"
                    style={{ paddingLeft: `${(level - 1) * 28}px` }}
                  >
                    {hasChildren ? (
                      <Button
                        slot={null}
                        excludeFromTabOrder
                        aria-label={
                          expanded
                            ? `Collapse ${node.name}`
                            : `Expand ${node.name}`
                        }
                        className="clients-table__expand-btn"
                        onPress={() => {
                          toggle(node.id);
                          focusRow(node.id);
                        }}
                      >
                        <ChevronRight
                          className={
                            expanded
                              ? "clients-table__chevron clients-table__chevron--open"
                              : "clients-table__chevron"
                          }
                        />
                      </Button>
                    ) : (
                      <span
                        className="clients-table__expand-placeholder"
                        aria-hidden="true"
                      />
                    )}
                    {level === ADVISER_LEVEL && (
                      <Avatar name={node.name} src={node.image} />
                    )}
                    <span className="clients-table__name">{node.name}</span>
                  </div>
                </td>

                {MONTHS.map((month, monthIndex) => (
                  <td
                    role="gridcell"
                    key={month}
                    className="clients-table__value"
                  >
                    {node.values[monthIndex]?.toLocaleString() ?? "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
