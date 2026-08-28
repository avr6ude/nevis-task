import type { TreeNode } from "@/types";

export const MONTHS = [
  "Feb 2024",
  "Mar 2024",
  "Apr 2024",
  "May 2024",
  "Jun 2024",
  "Jul 2024",
  "Aug 2024",
  "Sep 2024",
  "Oct 2024",
  "Nov 2024",
  "Dec 2024",
  "Jan 2025",
] as const;

export function getChildren(node: TreeNode): TreeNode[] | undefined {
  return node.branches ?? node.employees ?? node.channels;
}

export function findNode(root: TreeNode, id: string): TreeNode | undefined {
  if (root.id === id) return root;
  for (const child of getChildren(root) ?? []) {
    const hit = findNode(child, id);
    if (hit) return hit;
  }
  return undefined;
}
