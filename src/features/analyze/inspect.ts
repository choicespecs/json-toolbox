import type { JSONValue, JSONObject, JSONArray } from "@/types";
import type { InspectNode } from "@/features/analyze";
import { kindOf, previewValue } from "@/lib/json";

export function buildInspectTree(v: JSONValue, path = ""): InspectNode {
  const k = kindOf(v);

  if (k === "object") {
    const obj = (v ?? {}) as JSONObject;
    const keys = Object.keys(obj).sort();
    const children = keys.map(key => buildInspectTree(obj[key], path ? `${path}.${key}` : key));
    return {
      key: path.split(".").pop() ?? "",
      path,
      kind: "object",
      count: keys.length,
      preview: previewValue(v),
      children,
    };
  }

  if (k === "array") {
    const arr = (v ?? []) as JSONArray;
    const children = arr.map((item, idx) => buildInspectTree(item, path ? `${path}[${idx}]` : `[${idx}]`));
    return {
      key: path.split(".").pop() ?? "",
      path,
      kind: "array",
      count: arr.length,
      preview: previewValue(v),
      children,
    };
  }

  return {
    key: path.split(".").pop() ?? "",
    path,
    kind: k,
    preview: previewValue(v),
  };
}