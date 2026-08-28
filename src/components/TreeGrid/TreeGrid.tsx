import { Avatar } from "@components/Avatar/Avatar";
import { getChildren, MONTHS } from "@domain/tree";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import type { TreeNode } from "@/types";
import "./TreeGrid.css";

export interface TreeGridProps {
  root: TreeNode;
  defaultExpandedIds?: string[];
}

const ADVISER_LEVEL = 3;

interface FlatRow {
  node: TreeNode;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
}

function flattenTree(
  node: TreeNode,
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
    ...children.flatMap((child) => flattenTree(child, expandedIds, level + 1)),
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

export function TreeGrid({ root, defaultExpandedIds }: TreeGridProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? [root.id]),
  );
  const [focusedId, setFocusedId] = useState(root.id);
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());

  const rows = useMemo(
    () => flattenTree(root, expandedIds),
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
    <div className="tree-grid-container">
      <table
        role="treegrid"
        aria-label="Clients by company, branch, adviser and acquisition channel"
        className="tree-grid"
      >
        <thead>
          <tr role="row">
            <th role="columnheader" scope="col" className="tree-grid__name-col">
              <span className="visually-hidden">Name</span>
            </th>
            {MONTHS.map((month) => (
              <th role="columnheader" scope="col" key={month}>
                {month}
              </th>
            ))}
          </tr>
        </thead>

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
                aria-label={node.name}
                aria-level={level}
                aria-expanded={hasChildren ? expanded : undefined}
                onFocus={() => setFocusedId(node.id)}
                onClick={(event) => {
                  if (!hasChildren) return;
                  if (
                    (event.target as HTMLElement).closest(
                      ".tree-grid__expand-btn",
                    )
                  ) {
                    return;
                  }
                  toggle(node.id);
                  focusRow(node.id);
                }}
                onKeyDown={(event) => handleKeyDown(event, row, index)}
                className={[
                  "tree-grid__row",
                  hasChildren && "tree-grid__row--interactive",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <td role="gridcell" className="tree-grid__name-col">
                  <div
                    className="tree-grid__cell"
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
                        aria-expanded={expanded}
                        className="tree-grid__expand-btn"
                        onPress={() => {
                          toggle(node.id);
                          focusRow(node.id);
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className={
                            expanded
                              ? "tree-grid__chevron tree-grid__chevron--open"
                              : "tree-grid__chevron"
                          }
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path
                              d="M3.5 1.5 L7 5 L3.5 8.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </Button>
                    ) : (
                      <span
                        className="tree-grid__expand-placeholder"
                        aria-hidden="true"
                      />
                    )}
                    {level === ADVISER_LEVEL && (
                      <Avatar name={node.name} src={node.image} />
                    )}
                    <span className="tree-grid__name">{node.name}</span>
                  </div>
                </td>

                {node.values.map((value, valueIndex) => (
                  <td
                    role="gridcell"
                    key={MONTHS[valueIndex]}
                    className="tree-grid__value"
                  >
                    {value.toLocaleString()}
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
