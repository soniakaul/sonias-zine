# Sonia&rsquo;s

A personal publication. Engineering, products, photographs.

Built as a Next.js app with TypeScript, MDX-driven content, and a hand-rolled
editorial type system. The site has the structural commitments of a magazine —
masthead, departments, folios, marginalia — but updates continuously rather
than being released as discrete issues.

Live at: [_soniakaul.com_](https://soniakaul.com/)

---

## Design philosophy

Most engineer portfolios show projects; this one publishes them. The
distinction matters because it forces a different kind of writing — feature
articles instead of project tiles, deck instead of tagline, an editorial voice
instead of resume bullets. The site doubles as both a portfolio (for
prospective employers) and a public writing practice (the muscle that takes
an engineer toward product).

The character &mdash; **Inky** &mdash; is the ink-blob mascot who lives on the
gold divider line above the wire ticker. His clickable belly opens the
&ldquo;Ask the editor&rdquo; interface, a semantic-search-as-editorial feature
that lets readers query across the whole publication in natural language.
He has a small state machine: walks across the screen at randomized
speeds, sometimes sits and stares (squashing only the body, not his
features), and sometimes turns around.

## Stack

- **Next.js 15** with App Router and React Server Components
- **TypeScript** throughout
- **MDX** for content (one `.mdx` file per entry, frontmatter-driven metadata)
- **Hand-written CSS** with custom-property design tokens, no Tailwind — the
  typography is opinionated enough that utility classes would fight it
- **Fraunces** (variable serif, free) as the display face; **Source Serif 4**
  for body; **JetBrains Mono** for the masthead, folios, and stats
- **Vercel** for hosting

The eventual AI layer (Sprint 3) will use Gemini Flash for runtime composition
and Voyage AI embeddings for the vector store, stored in Supabase pgvector.

## Project structure

```
.
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout — fonts, masthead, Inky, Wire
│   ├── page.tsx               # Cover (home)
│   ├── projects/
│   │   ├── page.tsx           # Projects index
│   │   └── [slug]/page.tsx    # Long-form feature article
│   ├── products/
│   └── photography/
├── components/                # React components
│   ├── Masthead.tsx
│   ├── Inky.tsx               # Two-pose mascot + chaos behavior
│   ├── Wire.tsx               # Bottom ticker
│   ├── IndexItem.tsx          # Row in a department index
│   ├── PhotoCard.tsx
│   └── TitleText.tsx          # Renders {italics} in entry titles
├── content/                   # MDX files — the actual writing
│   ├── projects/*.mdx
│   ├── products/*.mdx
│   └── photography/photos.json
├── lib/
│   ├── site.ts                # Masthead, wire, department config
│   └── content.ts             # MDX loader, frontmatter parser
└── styles/
    ├── globals.css            # Whole typography system in one file
    └── inky.module.css        # Inky + Wire styles
```

## Adding content

### A new project or product

Create a file at `content/projects/your-slug.mdx`:

```mdx
---
number: "05"
title: "Project {Name}"   # text in {curlies} renders italic gold
blurb: "One-paragraph description."
tags:
  - React
  - Live
featured: false           # set to true to show the stats column
liveUrl: "https://..."
sourceUrl: "https://..."
---

Long-form body in MDX. Use `<p className="lede">...</p>` for the
drop-cap opening paragraph.
```

### A featured entry (with stats)

```yaml
featured: true
stats:
  - label: Users
    value: "1,200"
    valueAccent: "+"
  - label: Status
    value: ""
    valueAccent: "Live"
```

### A new photograph

Edit `content/photography/photos.json` &mdash; add a frame number, place,
caption, and (when ready) `imageSrc`.

## Editing the masthead, wire, or cover

All of these live in `lib/site.ts`. The masthead&rsquo;s issue number
(`Vol. 1 · No. 037`) is in `getMasthead().volume`. The wire items are in
`getWireItems()`. The cover eyebrow and subtitle are in `getCover()`.

## Local development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

```bash
# from the repo root, after pushing to GitHub:
# 1. New project on vercel.com → import the GitHub repo
# 2. Framework preset: Next.js (auto-detected)
# 3. No environment variables required for v1
# 4. Deploy
```

The first build takes ~60 seconds. Pushes to `main` auto-deploy.

## What ships in v1 vs later

**Shipped now (v1):**

- Typography system, three departments, full routing
- Inky with two-pose animation and chaos behavior
- Wire ticker
- &ldquo;Ask the editor&rdquo; UI (input opens, query is captured; no
  backend yet)
- MDX content pipeline
- Mobile-responsive

**Coming in v2 (Sprint 3):**

- &ldquo;Ask the editor&rdquo; RAG backend (Gemini Flash + pgvector)
- Wire items pulled from live data sources (GitHub commits, now-file)

**Coming in v3:**

- Real photography uploads
- A subscription / RSS layer

## License

Site code: MIT. Editorial content, photographs, and the Inky character:
all rights reserved.
