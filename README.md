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
&ldquo;Ask the editor&rdquo; overlay: readers ask about Sonia and her work in
plain language, and Inky answers in his own voice &mdash; third person, warm,
a little dry &mdash; linking to the write-ups on the site as he goes.
He has a small state machine: walks across the screen at randomized
speeds, sometimes sits and stares (squashing only the body, not his
features), and sometimes turns around.

## Stack

- **Next.js 14** with App Router and React Server Components
- **TypeScript** throughout
- **MDX** for content via `next-mdx-remote` + `gray-matter` (one `.mdx` file
  per entry, frontmatter-driven metadata)
- **Anthropic API** (`@anthropic-ai/sdk`, Claude Sonnet 4.6) for Inky
- **Hand-written CSS** with custom-property design tokens, no Tailwind — the
  typography is opinionated enough that utility classes would fight it
- **Fraunces** (variable serif, free) as the display face; **Source Serif 4**
  for body; **JetBrains Mono** for the masthead, folios, and stats
- **Vercel** for hosting; Node 24

## How Inky works

No vector store, no embeddings: the whole corpus is small enough to fit in one
system prompt. `lib/inky.ts` builds it once per server instance from:

1. `content/inky/persona.md` &mdash; his voice and rules
2. every other `.md` in `content/inky/` &mdash; the curated facts Sonia has
   chosen to share (`about-sonia.md`)
3. a short brief and links for every project and product on the site (the
   blurb plus the opening of the body)

`app/api/inky/route.ts` sends the reader&rsquo;s question with that prompt to
Claude and streams the answer back as plain text. The prompt is identical on
every request, so it&rsquo;s marked for prompt caching. Questions are capped
at 600 characters, and an in-memory rate limit allows 20 questions per IP per
hour and 600 a day across everyone (both reset on a cold start). Without
`ANTHROPIC_API_KEY` set, Inky replies that his brain isn&rsquo;t plugged in
yet instead of erroring.

To change what Inky knows or how he sounds, edit the Markdown in
`content/inky/`. New project and product write-ups are picked up
automatically.

## Project structure

```
.
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout — fonts, masthead, Inky, Wire
│   ├── page.tsx               # Cover (home)
│   ├── projects/
│   │   ├── page.tsx           # Projects index
│   │   └── [slug]/page.tsx    # Long-form feature article
│   ├── products/              # Same shape; articles get a table of contents
│   ├── photography/
│   └── api/inky/route.ts      # Inky's backend — streams answers from Claude
├── components/                # React components
│   ├── Masthead.tsx
│   ├── Inky.tsx               # Mascot state machine + "Ask the editor"
│   ├── Wire.tsx               # Bottom ticker
│   ├── IndexItem.tsx          # Row in a department index
│   ├── ArticleTOC.tsx         # Table of contents, tracks the current section
│   ├── mdx.tsx                # Editorial MDX components (PullQuote, Stats…)
│   ├── PhotoCard.tsx
│   └── TitleText.tsx          # Renders {italics} in entry titles
├── content/                   # The actual writing
│   ├── projects/*.mdx
│   ├── products/*.mdx
│   ├── photography/photos.json
│   └── inky/                  # persona.md + the facts Inky knows
├── lib/
│   ├── site.ts                # Masthead, wire, cover, department config
│   ├── content.ts             # MDX loader, frontmatter parser
│   ├── inky.ts                # Assembles Inky's system prompt
│   └── toc.ts                 # Heading slugs + table-of-contents builder
├── public/
│   ├── projects/              # Screenshots referenced by `image:`
│   └── photos/                # Photography frames
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
image: "/projects/your-slug.png"   # placeholder shows until the file exists
---

Long-form body in MDX.
```

Bodies can use the editorial components in `components/mdx.tsx`:
`<PullQuote>`, `<Stats>` / `<Stat>`, `<CaseFile>`, `<Timeline>` / `<Sprint>`,
`<Loop>`, and `<Margin>`. `##` and `###` headings get anchor ids, which the
product pages use for their table of contents.

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

Drop the image in `public/photos/`, then add an entry to
`content/photography/photos.json` with a `frame` number, `place`, `imageSrc`,
and (optionally) a `caption`.

## Editing the masthead, wire, or cover

All of these live in `lib/site.ts`. The masthead&rsquo;s issue number
(`Vol. 1 · No. 026`) is in `getMasthead().volume` &mdash; bump `minor` to
publish a new issue. The location is there too, and Inky reads it. The wire
items are in `getWireItems()`. The cover eyebrow and subtitle are in
`getCover()`.

## Local development

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Everything except Inky
works without the key.

## Deploying to Vercel

```bash
# from the repo root, after pushing to GitHub:
# 1. New project on vercel.com → import the GitHub repo
# 2. Framework preset: Next.js (auto-detected)
# 3. Environment variable: ANTHROPIC_API_KEY (only Inky needs it)
# 4. Deploy
```

The first build takes ~60 seconds. Pushes to `main` auto-deploy.

## What&rsquo;s shipped

- Typography system, three departments, full routing
- Long-form feature articles with editorial MDX components; product
  write-ups get a table of contents
- Inky, with his walk / sit-and-stare / turn-around behavior
- &ldquo;Ask the editor&rdquo;: live, streamed answers from Claude, grounded
  in the site&rsquo;s own content
- Wire ticker (hand-edited in `lib/site.ts`)
- Photography department with the first seven frames
- Mobile-responsive

**Still on the list:**

- More photographs
- Wire items pulled from live data sources (GitHub commits, now-file)
- A subscription / RSS layer

## License

Site code: MIT. Editorial content, photographs, and the Inky character:
all rights reserved.
