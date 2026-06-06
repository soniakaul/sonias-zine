import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ============================================================
// CONTENT LOADER
// Each department has a folder of MDX files in /content.
// Frontmatter defines structured metadata; the MDX body is
// the long-form article (used by the [slug] feature pages).
//
// Index pages read frontmatter only; feature pages render
// the full MDX body.
// ============================================================

export type Stat = { label: string; value: string; valueAccent?: string };

export type Entry = {
  slug: string;
  number: string;
  title: string; // raw title, "AI Merge {Conflict} Resolver" — {…} becomes italic
  blurb: string;
  tags: string[];
  featured: boolean;
  stats?: Stat[];
  liveUrl?: string;
  sourceUrl?: string;
  image?: string; // path to a screenshot in /public, e.g. "/projects/prism.png"
  body: string; // MDX body
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Only return the image path if the file actually exists in /public.
// Lets us pre-fill frontmatter with the intended path — the UI shows a
// "Screenshot coming" placeholder until the file is dropped in.
function resolveImage(img?: string): string | undefined {
  if (!img) return undefined;
  const rel = img.startsWith("/") ? img.slice(1) : img;
  return fs.existsSync(path.join(PUBLIC_DIR, rel)) ? img : undefined;
}

function readDir(dept: string): Entry[] {
  const dir = path.join(CONTENT_DIR, dept);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const entries = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      number: data.number ?? "00",
      title: data.title ?? "Untitled",
      blurb: data.blurb ?? "",
      tags: data.tags ?? [],
      featured: data.featured ?? false,
      stats: data.stats,
      liveUrl: data.liveUrl,
      sourceUrl: data.sourceUrl,
      image: resolveImage(data.image),
      body: content,
    } as Entry;
  });

  // Sort by number ascending
  return entries.sort((a, b) => a.number.localeCompare(b.number));
}

export function getProjects(): Entry[] {
  return readDir("projects");
}

export function getProducts(): Entry[] {
  return readDir("products");
}

export function getEntry(dept: string, slug: string): Entry | null {
  const dir = path.join(CONTENT_DIR, dept);
  const file = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    number: data.number ?? "00",
    title: data.title ?? "Untitled",
    blurb: data.blurb ?? "",
    tags: data.tags ?? [],
    featured: data.featured ?? false,
    stats: data.stats,
    liveUrl: data.liveUrl,
    sourceUrl: data.sourceUrl,
    image: data.image,
    body: content,
  };
}

// Photography is structured differently — no MDX body, just metadata
export type Photo = {
  frame: string;
  place: string;
  caption: string;
  imageSrc?: string;
};

export function getPhotos(): Photo[] {
  const file = path.join(CONTENT_DIR, "photography", "photos.json");
  if (!fs.existsSync(file)) return [];
  const photos = JSON.parse(fs.readFileSync(file, "utf-8")) as Photo[];
  // Only keep imageSrc if the file exists in /public — otherwise the card
  // shows its placeholder until you drop the image in.
  return photos.map((p) => ({ ...p, imageSrc: resolveImage(p.imageSrc) }));
}

// Parse a title like "AI Merge {Conflict} Resolver" — anything in
// curly braces becomes italic-accent. Returns an array of segments
// the renderer can map over.
export function parseTitle(
  title: string
): Array<{ text: string; accent: boolean }> {
  const parts = title.split(/(\{[^}]+\})/g).filter(Boolean);
  return parts.map((p) =>
    p.startsWith("{") && p.endsWith("}")
      ? { text: p.slice(1, -1), accent: true }
      : { text: p, accent: false }
  );
}
