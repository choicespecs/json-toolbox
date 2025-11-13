export type KeyRow = {
  key: string
  type: "string" | "number" | "boolean" | "null" | "unknown"
}
export type ContainerKind = "object" | "array"

export type ContainerNode = {
  id: string
  label: string
  kind: ContainerKind
  depth: number
  rows: KeyRow[]               // primitive key/type rows shown inline
  childContainers: string[]    // ids of child container nodes
  meta?: { count?: number; note?: string }
}

export type ContainerEdge = {
  id: string
  source: string
  target: string
  label?: string               // edge label e.g. "tags", "friends", "item"
}

type AnyJSON =
  | null | boolean | number | string
  | AnyJSON[]
  | { [k: string]: AnyJSON }

const ROOT_ID = "(root)"

const isPrimitive = (v: AnyJSON) =>
  v === null || ["string", "number", "boolean"].includes(typeof v as string)

const typeOfPrimitive = (v: AnyJSON): KeyRow["type"] =>
  v === null ? "null"
  : typeof v === "string" ? "string"
  : typeof v === "number" ? "number"
  : typeof v === "boolean" ? "boolean"
  : "unknown"

// parent is never empty now (root is "(root)")
function makeId(parent: string, child: string) {
  return parent === ROOT_ID ? `${child}` : `${parent}.${child}`
}

type BuildOpts = {
  pageSize?: number      // how many array elements to sample for schema
}

export function buildContainerGraph(
  value: AnyJSON,
  { pageSize = 100 }: BuildOpts = {}
): { nodes: ContainerNode[]; edges: ContainerEdge[] } {
  const nodes: ContainerNode[] = []
  const edges: ContainerEdge[] = []

  const visitObject = (
    obj: Record<string, AnyJSON>,
    path: string,
    depth: number,
    label: string
  ) => {
    const keys = Object.keys(obj)
    const node: ContainerNode = {
      id: path, label, kind: "object", depth,
      rows: [], childContainers: [], meta: { count: keys.length },
    }

    for (const k of keys) {
      const v = obj[k]
      if (isPrimitive(v)) {
        node.rows.push({ key: k, type: typeOfPrimitive(v) })
      } else if (Array.isArray(v)) {
        const childPath = makeId(path, k)         // e.g. "(root).__item__.friends"
        visitArray(v, childPath, depth + 1, `${k}[]`)
        node.childContainers.push(childPath)
        edges.push({ id: `${path}->${childPath}`, source: path, target: childPath, label: k })
      } else if (typeof v === "object" && v !== null) {
        const childPath = makeId(path, k)
        visitObject(v as Record<string, AnyJSON>, childPath, depth + 1, k)
        node.childContainers.push(childPath)
        edges.push({ id: `${path}->${childPath}`, source: path, target: childPath, label: k })
      }
    }

    nodes.push(node)
  }

  const visitArray = (arr: AnyJSON[], path: string, depth: number, label: string) => {
    const node: ContainerNode = {
      id: path, label, kind: "array", depth,
      rows: [], childContainers: [], meta: { count: arr.length },
    }

    const sample = arr.slice(0, pageSize)
    const firstNonNull = sample.find(v => v !== null)

    // Array of primitives → summarize on the array node
    if (firstNonNull === undefined || isPrimitive(firstNonNull)) {
      node.meta!.note = firstNonNull === undefined ? "empty array" : `array of ${typeOfPrimitive(firstNonNull)}`
      node.rows.push({ key: "item", type: firstNonNull === undefined ? "unknown" : typeOfPrimitive(firstNonNull) })
      nodes.push(node)
      return
    }

    // Array of arrays → show array node and a few example child arrays
    if (Array.isArray(firstNonNull)) {
      node.meta!.note = "array of arrays"
      nodes.push(node)
      const idxs = sample
        .map((v, i) => (Array.isArray(v) ? i : -1))
        .filter(i => i >= 0)
        .slice(0, 3)
      for (const i of idxs) {
        const childPath = `${path}[${i}]`
        visitArray(arr[i] as AnyJSON[], childPath, depth + 1, `[${i}]`)
        node.childContainers.push(childPath)
        edges.push({ id: `${path}->${childPath}`, source: path, target: childPath, label: `[${i}]` })
      }
      return
    }

    // Array of objects → create explicit "item" container under the array
    node.meta!.note = "array of objects"
    nodes.push(node)

    const itemId = `${path}.__item__`
    const itemNode: ContainerNode = {
      id: itemId, label: "item", kind: "object", depth: depth + 1,
      rows: [], childContainers: []
    }

    // infer primitive schema rows + nested containers from the sample
    const keyType: Record<string, KeyRow["type"]> = {}
    const nestedContainers: Array<{ key: string; value: AnyJSON }> = []

    for (const obj of sample) {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        for (const [k, v] of Object.entries(obj)) {
          if (isPrimitive(v)) {
            keyType[k] = keyType[k] ?? typeOfPrimitive(v)
          } else {
            nestedContainers.push({ key: k, value: v })
          }
        }
      }
    }

    for (const k of Object.keys(keyType).sort()) {
      itemNode.rows.push({ key: k, type: keyType[k] })
    }

    // nested container fields on item (e.g., tags[], friends[])
    const seen = new Set<string>()
    for (const { key, value } of nestedContainers) {
      const childPath = `${itemId}.${key}`
      if (seen.has(childPath)) continue
      seen.add(childPath)

      if (Array.isArray(value)) {
        visitArray(value, childPath, depth + 2, `${key}[]`)
      } else {
        visitObject(value as Record<string, AnyJSON>, childPath, depth + 2, key)
      }
      itemNode.childContainers.push(childPath)
      edges.push({ id: `${itemId}->${childPath}`, source: itemId, target: childPath, label: key })
    }

    nodes.push(itemNode)
    // connect array → item with label "item"
    edges.push({ id: `${path}->${itemId}`, source: path, target: itemId, label: "item" })
  }

  // root
  if (Array.isArray(value)) {
    visitArray(value, ROOT_ID, 0, "(root)")
  } else if (typeof value === "object" && value !== null) {
    visitObject(value as Record<string, AnyJSON>, ROOT_ID, 0, "(root)")
  } else {
    nodes.push({
      id: ROOT_ID,
      label: "(root)",
      kind: "object",
      depth: 0,
      rows: [{ key: "(value)", type: typeOfPrimitive(value) }],
      childContainers: [],
    })
  }

  return { nodes, edges }
}