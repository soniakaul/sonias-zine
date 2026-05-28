import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getEntry, getProducts } from "@/lib/content";
import TitleText from "@/components/TitleText";
import { DEPARTMENTS } from "@/lib/site";

export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("products", slug);
  if (!entry) return { title: "Not found" };
  return {
    title: `${entry.title.replace(/[{}]/g, "")} — Sonia's`,
    description: entry.blurb,
  };
}

export default async function ProductFeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("products", slug);
  if (!entry) notFound();
  const dept = DEPARTMENTS.products;

  return (
    <section className="spread">
      <div className="spread-meta">
        <span className="dept">
          № {dept.number} — {dept.title} · Feature
        </span>
        <span className="dot"></span>
        <span>Long read</span>
      </div>

      <h2 className="spread-headline">
        <TitleText title={entry.title} />
      </h2>

      <p className="spread-deck">{entry.blurb}</p>

      <div className="byline">
        <strong>By the Editor</strong>
      </div>

      <div className="article-body">
        <aside className="margin-col">
          {entry.tags.length > 0 && (
            <div className="margin-note">
              <span className="label">Tags</span>
              {entry.tags.join(" · ")}
            </div>
          )}
        </aside>

        <div className="body-col">
          <MDXRemote source={entry.body} />
        </div>
      </div>

      <div className="folio">
        <span>Sonia&rsquo;s · {dept.title} · Feature № {entry.number}</span>
        <span>{String(parseInt(entry.number) + 25).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
