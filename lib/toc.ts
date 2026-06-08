// Shared slug + table-of-contents helpers.
// slugify is used in BOTH the heading components (to set ids) and the TOC
// builder (to link to them), so they must stay in sync.

export type TocItem = { level: number; title: string; id: string };

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Decode the HTML entities we use in MDX so the TOC shows real glyphs
// (and slugs match the rendered headings, which see decoded text).
function decodeEntities(s: string): string {
  return s
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// Pull ## and ### headings out of raw MDX (skipping fenced code, #### and deeper).
export function extractToc(body: string): TocItem[] {
  const items: TocItem[] = [];
  let inCode = false;
  for (const line of body.split("\n")) {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!m) continue;
    const title = decodeEntities(
      m[2].replace(/\*\*/g, "").replace(/`/g, "").trim()
    );
    items.push({ level: m[1].length, title, id: slugify(title) });
  }
  return items;
}

// Extract plain text from React children, for slugifying heading ids.
export function nodeText(node: unknown): string {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (typeof node === "object" && "props" in (node as Record<string, unknown>)) {
    const props = (node as { props?: { children?: unknown } }).props;
    return nodeText(props?.children);
  }
  return "";
}
