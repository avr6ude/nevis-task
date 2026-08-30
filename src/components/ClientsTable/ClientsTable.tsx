import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Avatar } from "@/components/Avatar/Avatar";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { getChildren } from "@/domain/clients";
import type { ClientNode } from "@/domain/schema";
import styles from "./ClientsTable.module.css";

export interface ClientsTableProps {
  root: ClientNode;
  months: string[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

function MonthHeader({ months }: { months: string[] }) {
  return (
    <thead>
      <tr role="row">
        <th role="columnheader" scope="col" className={styles.nameCol}>
          Name
        </th>
        {months.map((month) => (
          <th role="columnheader" scope="col" key={month}>
            {month}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function ClientsTableShell({ children }: { children: ReactNode }) {
  return <div className={styles.slot}>{children}</div>;
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

  if (!expanded) return [row];

  return [
    row,
    ...children.flatMap((child) => flattenNodes(child, expandedIds, level + 1)),
  ];
}

function findParentIndex(rows: FlatRow[], index: number): number | null {
  const current = rows[index];
  if (!current || current.level === 1) return null;

  for (let i = index - 1; i >= 0; i--) {
    if (rows[i].level === current.level - 1) return i;
  }
  return null;
}

/** `column` is null when the row itself holds focus, per the treegrid pattern. */
interface Active {
  rowId: string;
  column: number | null;
}

const cellKey = (rowId: string, column: number | null) =>
  column === null ? rowId : `${rowId}:${column}`;

/** Read the focused column off the event target so it never lags a render. */
function columnOf(target: EventTarget | null): number | null {
  const el = target as HTMLElement | null;
  if (el?.tagName !== "TD") return null;
  const parent = el.parentElement;
  return parent ? Array.prototype.indexOf.call(parent.children, el) : null;
}

export function ClientsTable({
  root,
  months,
  expandedIds,
  onToggle,
}: ClientsTableProps) {
  const cellCount = months.length + 1;
  const [active, setActive] = useState<Active>({
    rowId: root.id,
    column: null,
  });
  const cellRefs = useRef(new Map<string, HTMLElement>());

  const rows = useMemo(
    () => flattenNodes(root, expandedIds),
    [root, expandedIds],
  );

  const setCellRef = useCallback((key: string, el: HTMLElement | null) => {
    if (el) cellRefs.current.set(key, el);
    else cellRefs.current.delete(key);
  }, []);

  const moveTo = useCallback((rowId: string, column: number | null) => {
    setActive({ rowId, column });
    cellRefs.current.get(cellKey(rowId, column))?.focus();
  }, []);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    row: FlatRow,
    index: number,
  ) => {
    const { node, hasChildren, expanded } = row;
    const column = columnOf(event.target);
    const onCell = column !== null;

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        if (!onCell) {
          if (hasChildren && !expanded) onToggle(node.id);
          else moveTo(node.id, 0);
        } else if (column < cellCount - 1) {
          moveTo(node.id, column + 1);
        }
        break;
      }

      case "ArrowLeft": {
        event.preventDefault();
        if (onCell) {
          moveTo(node.id, column === 0 ? null : column - 1);
        } else if (hasChildren && expanded) {
          onToggle(node.id);
        } else {
          const parent = findParentIndex(rows, index);
          if (parent !== null) moveTo(rows[parent].node.id, null);
        }
        break;
      }

      case "ArrowDown": {
        event.preventDefault();
        const next = rows[index + 1];
        if (next) moveTo(next.node.id, column);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const previous = rows[index - 1];
        if (previous) moveTo(previous.node.id, column);
        break;
      }

      case "Home": {
        event.preventDefault();
        if (onCell && !event.ctrlKey) moveTo(node.id, 0);
        else if (rows[0]) moveTo(rows[0].node.id, column);
        break;
      }

      case "End": {
        event.preventDefault();
        if (onCell && !event.ctrlKey) moveTo(node.id, cellCount - 1);
        else {
          const last = rows[rows.length - 1];
          if (last) moveTo(last.node.id, column);
        }
        break;
      }

      case "Enter":
      case " ": {
        if (hasChildren) {
          event.preventDefault();
          onToggle(node.id);
        }
        break;
      }

      default:
        break;
    }
  };

  useEffect(() => {
    if (!rows.some((row) => row.node.id === active.rowId)) {
      setActive({ rowId: rows[0]?.node.id ?? root.id, column: null });
    }
  }, [rows, active.rowId, root.id]);

  return (
    <div className={styles.container}>
      <table
        role="treegrid"
        aria-label="Clients per month by company, branch, adviser and acquisition channel"
        className={styles.table}
      >
        <MonthHeader months={months} />

        <tbody>
          {rows.map((row, index) => {
            const { node, level, hasChildren, expanded } = row;
            const isActiveRow = active.rowId === node.id;
            const rowFocusable = isActiveRow && active.column === null;

            return (
              <tr
                key={node.id}
                ref={(el) => setCellRef(cellKey(node.id, null), el)}
                role="row"
                tabIndex={rowFocusable ? 0 : -1}
                aria-level={level}
                aria-expanded={hasChildren ? expanded : undefined}
                onFocus={(event) => {
                  if (event.target === event.currentTarget) {
                    setActive({ rowId: node.id, column: null });
                  }
                }}
                onClick={(event) => {
                  if (!hasChildren) return;
                  if ((event.target as HTMLElement).closest("button")) return;
                  onToggle(node.id);
                  moveTo(node.id, null);
                }}
                onKeyDown={(event) => handleKeyDown(event, row, index)}
                className={
                  hasChildren
                    ? `${styles.row} ${styles.interactive}`
                    : styles.row
                }
              >
                <td
                  ref={(el) => setCellRef(cellKey(node.id, 0), el)}
                  role="gridcell"
                  tabIndex={isActiveRow && active.column === 0 ? 0 : -1}
                  onFocus={() => setActive({ rowId: node.id, column: 0 })}
                  className={styles.nameCol}
                >
                  <div
                    className={styles.cell}
                    style={{ paddingLeft: `${(level - 1) * 28}px` }}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={expanded ? "Collapse" : "Expand"}
                        className={styles.expandBtn}
                        onClick={() => {
                          onToggle(node.id);
                          moveTo(node.id, null);
                        }}
                      >
                        <ChevronRight
                          className={
                            expanded
                              ? `${styles.chevron} ${styles.chevronOpen}`
                              : styles.chevron
                          }
                        />
                      </button>
                    ) : (
                      <span
                        className={styles.expandPlaceholder}
                        aria-hidden="true"
                      />
                    )}
                    {node.image && <Avatar name={node.name} src={node.image} />}
                    <span className={styles.name}>{node.name}</span>
                  </div>
                </td>

                {months.map((month, monthIndex) => {
                  const column = monthIndex + 1;
                  return (
                    <td
                      key={month}
                      ref={(el) => setCellRef(cellKey(node.id, column), el)}
                      role="gridcell"
                      tabIndex={
                        isActiveRow && active.column === column ? 0 : -1
                      }
                      onFocus={() => setActive({ rowId: node.id, column })}
                      className={styles.value}
                    >
                      {node.values[monthIndex]?.toLocaleString() ?? "—"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const SKELETON_ROWS = [0, 1, 2, 3];
const SKELETON_CELLS = [0, 1, 2, 3, 4, 5];

export function TableSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden="true">
      {SKELETON_ROWS.map((row) => (
        <div key={row} className={styles.skeletonRow}>
          <span
            className={`${styles.skeletonLine} ${styles.skeletonName}`}
            style={{ marginLeft: row === 0 ? 0 : 28 }}
          />
          {SKELETON_CELLS.map((cell) => (
            <span
              key={cell}
              className={`${styles.skeletonLine} ${styles.skeletonValue}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
