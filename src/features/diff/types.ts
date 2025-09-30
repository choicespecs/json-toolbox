import type { JSONValue } from "@/types/json";

export type DiffNodeType = "object" | "array" | "value";

export interface FlatDiff {
  key: string;
  same: boolean;
  left: JSONValue | undefined;
  right: JSONValue | undefined;
  leftPresent: boolean;
  rightPresent: boolean;
}

export interface DiffNode {
  key: string;
  path: string;
  type: DiffNodeType;
  same: boolean;
  leftPresent: boolean;
  rightPresent: boolean;
  left?: JSONValue;
  right?: JSONValue;
  children?: DiffNode[];
  diffCount: number;
}