import type { JSONValue, JSONObject, JSONArray } from "@/types";
import type { InspectKind } from "@/features/analyze";

export function parseJsonSafe(src: string) {
  try {
    const toParse = src.trim().length ? src : "{}";
    return { ok: true as const, value: JSON.parse(toParse) as JSONValue };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? String(e) };
  }
}

export const isPlainObj = (x: JSONValue): x is JSONObject =>
  typeof x === "object" && x !== null && !Array.isArray(x);

export function sortKeysDeep(v: JSONValue): JSONValue {
  if (Array.isArray(v)) return v.map(sortKeysDeep) as JSONArray;
  if (isPlainObj(v)) {
    const out: JSONObject = {};
    for (const k of Object.keys(v).sort()) out[k] = sortKeysDeep(v[k]);
    return out;
  }
  return v;
}

export function formatJsonText(
  src: string,
  {
    indent = 2,
    sortKeys = true,
    minify = false,
  }: { indent?: number; sortKeys?: boolean; minify?: boolean } = {}
): { ok: true; text: string } | { ok: false; error: string } {
  const parsed = parseJsonSafe(src);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const val = sortKeys ? sortKeysDeep(parsed.value) : parsed.value;
  try {
    const text = JSON.stringify(val, null, minify ? 0 : indent);
    return { ok: true, text };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export const renderVal = (v: JSONValue | undefined) => {
  if (typeof v === "undefined") return "(missing)";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
};

export const kindOf = (v: JSONValue): InspectKind => {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (isPlainObj(v)) return "object";
  const t = typeof v;
  return t === "string" || t === "number" || t === "boolean" ? (t as InspectKind) : "null";
};

export function previewValue(v: JSONValue): string {
  try {
    if (typeof v === "string") return v.length > 60 ? v.slice(0, 57) + "..." : v;
    if (typeof v === "number" || typeof v === "boolean" || v === null) return String(v);
    if (Array.isArray(v)) {
      const shown = v.slice(0, 5).map(x => JSON.stringify(x)).join(", ");
      return v.length > 5 ? `[${shown}, …]` : `[${shown}]`;
    }
    if (isPlainObj(v)) {
      const keys = Object.keys(v);
      const shown = keys.slice(0, 5).join(", ");
      return keys.length > 5 ? `{${shown}, …}` : `{${shown}}`;
    }
  } catch {}
  return "";
}