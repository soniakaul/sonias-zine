import fs from "node:fs";
import path from "node:path";
import { getProjects, getProducts, type Entry } from "@/lib/content";
import { getMasthead } from "@/lib/site";

// ============================================================
// INKY — system-prompt assembly.
//
// Inky doesn't carry the FULL text of every write-up (the Stock Gut-Check
// PRD alone is ~14k tokens). Instead each piece becomes a compact CARD:
// title, tags, a brief + short excerpt, and canonical LINKS to the full
// piece. Inky is instructed to cite those links as evidence — so answers
// stay grounded and point people to the real artifact, while each request
// stays small, fast, and cheap.
//
// Built once at module load → identical bytes per request → caches well.
// ============================================================

const SITE_URL = "https://soniakaul.com";
const INKY_DIR = path.join(process.cwd(), "content", "inky");

function readDoc(name: string): string {
  const p = path.join(INKY_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8").trim() : "";
}

function cleanTitle(t: string): string {
  return t.replace(/[{}]/g, "");
}

// Strip MDX/JSX tags + markdown punctuation to a plain-text excerpt.
function excerpt(body: string, max = 700): string {
  const clean = body
    .replace(/<[^>]+>/g, " ") // JSX components (CaseFile, PullQuote, …)
    .replace(/[#>*_`]/g, "") // markdown punctuation
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function card(e: Entry, kind: "project" | "product"): string {
  // Where the full piece lives. Products have an on-site article page;
  // projects link out to the deployed app / source (no on-site detail page).
  const links: string[] = [];
  if (kind === "product") {
    links.push(`Full write-up: ${SITE_URL}/products/${e.slug}`);
  }
  if (e.liveUrl) links.push(`Live: ${e.liveUrl}`);
  if (e.sourceUrl) links.push(`Source: ${e.sourceUrl}`);

  return [
    `### ${cleanTitle(e.title)}  [${kind}]`,
    e.tags?.length ? `Tags: ${e.tags.join(", ")}` : "",
    links.length ? `Links — ${links.join(" · ")}` : "",
    "",
    e.blurb,
    "",
    `Brief: ${excerpt(e.body)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSystemPrompt(): string {
  const persona = readDoc("persona.md");
  const facts = readDoc("about-sonia.md");
  const { name, location } = getMasthead();

  const cards = [
    ...getProjects().map((e) => card(e, "project")),
    ...getProducts().map((e) => card(e, "product")),
  ].join("\n\n---\n\n");

  return `${persona}

# WHAT YOU KNOW ABOUT SONIA

${facts}

# SONIA'S WORK — briefs + links to the full pieces

Each entry below is a SHORT brief plus links to the full write-up. These are the
authoritative record of what she's built. When you talk about any of them,
**cite the link** so the person can read the real thing — every claim should be
backed by the relevant artifact. Only use links that appear here; never invent a
URL. Prefer the on-site "Full write-up" link for products; include the live demo
when it's relevant.

${cards}

# SITE FACTS

- Publication: "${name}'s" — a hand-built editorial magazine (this website, ${SITE_URL}).
- ${name} is based in ${location}.
- You, Inky, live on the gold line at the bottom of the site.

Remember: answer as Sonia, in her voice, grounded in everything above, and link
to the evidence as you go. If you genuinely don't know, say so warmly — never
invent facts or links.`;
}
