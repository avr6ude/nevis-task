import type { ClientNode } from "@/types";

export function getChildren(node: ClientNode): ClientNode[] | undefined {
  return node.branches ?? node.employees ?? node.channels;
}

export function deepestExpanded(
  root: ClientNode,
  expandedIds: Set<string>,
): ClientNode {
  let node = root;

  while (expandedIds.has(node.id)) {
    const open = (getChildren(node) ?? []).filter((child) =>
      expandedIds.has(child.id),
    );
    if (open.length !== 1) break;
    node = open[0];
  }

  return node;
}

export function pathTo(root: ClientNode, id: string): ClientNode[] {
  const trail: ClientNode[] = [];

  const walk = (node: ClientNode): boolean => {
    trail.push(node);
    if (node.id === id) return true;
    for (const child of getChildren(node) ?? []) {
      if (walk(child)) return true;
    }
    trail.pop();
    return false;
  };

  return walk(root) ? trail : [];
}

export function rollUp(node: ClientNode): ClientNode {
  const children = getChildren(node);
  if (!children?.length) return node;

  const rolled = children.map(rollUp);
  const values = node.values.map((_, i) =>
    rolled.reduce((sum, child) => sum + (child.values[i] ?? 0), 0),
  );
  const key = node.branches
    ? "branches"
    : node.employees
      ? "employees"
      : "channels";

  return { ...node, values, [key]: rolled };
}
