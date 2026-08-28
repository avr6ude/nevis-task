export interface ClientNode {
  id: string;
  name: string;
  values: number[];
  image?: string;
  branches?: ClientNode[];
  employees?: ClientNode[];
  channels?: ClientNode[];
}
