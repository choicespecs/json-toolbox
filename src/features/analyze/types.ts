export type InspectKind = "object" | "array" | "string" | "number" | "boolean" | "null";

export interface InspectNode {
  key: string;
  path: string;
  kind: InspectKind;
  count?: number;
  preview?: string;
  children?: InspectNode[];
}