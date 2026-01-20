export function jsonToStringLiteral(jsonText: string): string | null {
  try {
    const obj = JSON.parse(jsonText); // verify valid JSON
    const compact = JSON.stringify(obj); // one-line compact form
    const escaped = compact.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}"`; // usable in JS/Java source
  } catch (e) {
    return null;
  }
}