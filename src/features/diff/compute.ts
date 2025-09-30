import type { JSONValue } from "@/types";
import type { FlatDiff, DiffNode, DiffNodeType } from "@/features/diff";
import { isPlainObj } from "@/lib/json";

export function computeDifferences(a: JSONValue, b: JSONValue) {
  const diffs: FlatDiff[] = [];

  const flatten = (prefix: string, node: JSONValue, out: Record<string, JSONValue>) => {
    if (isPlainObj(node)) {
      for (const [k, v] of Object.entries(node)) {
        flatten(prefix ? `${prefix}.${k}` : k, v, out);
      }
    } else if (Array.isArray(node)) {
      out[prefix] = node;
    } else {
      out[prefix] = node;
    }
  };

  const A: Record<string, JSONValue> = {};
  const B: Record<string, JSONValue> = {};
  flatten("", a, A);
  flatten("", b, B);

  const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
  for (const k of keys) {
    const leftPresent = k in A;
    const rightPresent = k in B;
    const va = leftPresent ? A[k] : undefined;
    const vb = rightPresent ? B[k] : undefined;
    const same = leftPresent && rightPresent && JSON.stringify(va) === JSON.stringify(vb);
    diffs.push({ key: k, same, left: va, right: vb, leftPresent, rightPresent });
  }

  diffs.sort((x, y) => (Number(x.same) - Number(y.same)) || x.key.localeCompare(y.key));
  return diffs;
}

export function computeDiffTree(a: JSONValue, b: JSONValue, path = ""): DiffNode {
  const leftPresent = typeof a !== "undefined";
  const rightPresent = typeof b !== "undefined";

  const nodeType: DiffNodeType =
    Array.isArray(a) || Array.isArray(b)
      ? "array"
      : (isPlainObj(a) || isPlainObj(b))
        ? "object"
        : "value";

  if (nodeType === "object") {
    const aObj = isPlainObj(a) ? a : {};
    const bObj = isPlainObj(b) ? b : {};
    const keys = Array.from(new Set([...Object.keys(aObj), ...Object.keys(bObj)])).sort();
    const children = keys.map((k) => computeDiffTree(aObj[k], bObj[k], path ? `${path}.${k}` : k));

    const same = leftPresent && rightPresent && children.every((c) => c.same);
    const diffCount = children.reduce((acc, c) => acc + c.diffCount, 0);

    return {
      key: path.split(".").pop() ?? "",
      path,
      type: "object",
      same,
      leftPresent,
      rightPresent,
      children,
      diffCount,
    };
  }

  const same = leftPresent && rightPresent && JSON.stringify(a) === JSON.stringify(b);

  return {
    key: path.split(".").pop() ?? "",
    path,
    type: nodeType,
    same,
    leftPresent,
    rightPresent,
    left: a,
    right: b,
    diffCount: same ? 0 : 1,
  };
}