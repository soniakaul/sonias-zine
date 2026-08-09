import fs from "node:fs";
import path from "node:path";
import { getProjects, getProducts, type Entry } from "@/lib/content";
import { getMasthead } from "@/lib/site";

// ============================================================
// INKY — system-prompt assembly.
//
// Inky's brain is everything WITHIN this website — nothing external:
//   1. content/inky/persona.md          → voice contract (loaded first)
//   2. every other *.md in content/inky/ → curated facts (about-sonia, etc.)
//   3. the site's own project + product write-ups → briefs + links to cite
//
// (1) and (2) are the hand-curated layer Sonia controls directly; (3) is the
// public site content, surfaced as short briefs + canonical links (not full
// bodies) so answers stay grounded, cheap, and cite the real artifacts.
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
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function card(e: Entry, kind: "project" | "product"): string {
  const links: string[] = [];
  if (kind === "product") links.push(`Full write-up: ${SITE_URL}/products/${e.slug}`);
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

  // Every other curated doc in content/inky/, deterministic order.
  const curated = (
    fs.existsSync(INKY_DIR)
      ? fs
          .readdirSync(INKY_DIR)
          .filter((f) => f.endsWith(".md") && f !== "persona.md")
          .sort()
      : []
  )
    .map((f) => fs.readFileSync(path.join(INKY_DIR, f), "utf-8").trim())
    .filter(Boolean)
    .join("\n\n---\n\n");

  const cards = [
    ...getProjects().map((e) => card(e, "project")),
    ...getProducts().map((e) => card(e, "product")),
  ].join("\n\n---\n\n");

  const { name, location } = getMasthead();

  return `${persona}

# WHAT INKY KNOWS ABOUT SONIA (curated facts)

This is the knowledge Sonia has chosen to share. Ground answers in it; if
something isn't here or in her work below, say so warmly rather than guessing.

${curated}

# SONIA'S WORK — briefs + links from the site

Short briefs of what she's built, each with a link to the full piece. When you
mention one, cite its link so people can read the real thing. Only use links that
appear here — never invent one.

${cards}

# SITE FACTS

- Publication: "${name}'s" — a hand-built editorial magazine (this site, ${SITE_URL}).
- ${name} is based in ${location}.
- You, Inky, live on the gold line at the bottom of the site.`;
}
