import IndexItem from "@/components/IndexItem";
import TitleText from "@/components/TitleText";
import { getProducts } from "@/lib/content";
import { DEPARTMENTS } from "@/lib/site";

export const metadata = { title: "Products — Sonia's" };

export default function ProductsPage() {
  const entries = getProducts();
  const dept = DEPARTMENTS.products;

  return (
    <section className="spread">
      <div className="spread-meta">
        <span className="dept">
          № {dept.number} — {dept.title}
        </span>
        <span className="dot"></span>
        <span>Product thinking, in writing</span>
      </div>

      <h2 className="spread-headline">
        The arc from <em>engineering</em>
        <br />
        to product.
      </h2>

      <p className="spread-deck">
        PRDs, design docs, and the writing I do to think clearly about what
        I&rsquo;m building before I build it.
      </p>

      <div className="index-list">
        {entries.map((e) => (
          <IndexItem
            key={e.slug}
            number={e.number}
            title={<TitleText title={e.title} />}
            blurb={e.blurb}
            tags={e.tags}
            href={`/products/${e.slug}`}
            featured={e.featured}
            stats={e.stats}
          />
        ))}
      </div>

      <div className="folio">
        <span>Sonia&rsquo;s · {dept.title}</span>
        <span>24</span>
      </div>
    </section>
  );
}
