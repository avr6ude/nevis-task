export interface TreeNode {
  id: string;
  name: string;
  values: number[];
  image?: string;
  branches?: TreeNode[];
  employees?: TreeNode[];
  channels?: TreeNode[];
}
