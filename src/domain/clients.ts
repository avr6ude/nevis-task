import type { ClientNode } from "@/types";

export function getChildren(node: ClientNode): ClientNode[] | undefined {
  return node.branches ?? node.employees ?? node.channels;
}

export function findNode(root: ClientNode, id: string): ClientNode | undefined {
  if (root.id === id) return root;
  for (const child of getChildren(root) ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return undefined;
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
