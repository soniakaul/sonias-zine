import IndexItem from "@/components/IndexItem";
import TitleText from "@/components/TitleText";
import { getProjects } from "@/lib/content";
import { DEPARTMENTS } from "@/lib/site";

export const metadata = {
  title: "Projects — Sonia's",
};

export default function ProjectsPage() {
  const entries = getProjects();
  const dept = DEPARTMENTS.projects;

  return (
    <section className="spread">
      <div className="spread-meta">
        <span className="dept">
          № {dept.number} — {dept.title}
        </span>
        <span className="dot"></span>
        <span>The technical builds</span>
        <span className="dot"></span>
        <span>
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <h2 className="spread-headline">
        Things I built
        <br />
        and <em>actually</em> shipped.
      </h2>

      <p className="spread-deck">
        A mix of work at Cisco and personal builds. Featured ones get the
        stats; the rest get a paragraph and a link to the source.
      </p>

      <div className="index-list">
        {entries.map((e) => (
          <IndexItem
            key={e.slug}
            number={e.number}
            title={<TitleText title={e.title} />}
            blurb={e.blurb}
            tags={e.tags}
            href={`/projects/${e.slug}`}
            featured={e.featured}
            stats={e.stats}
            readMoreLabel={
              !e.featured && (e.liveUrl || e.sourceUrl)
                ? `${e.liveUrl ? "View live ↗" : ""}${
                    e.liveUrl && e.sourceUrl ? " · " : ""
                  }${e.sourceUrl ? "Source ↗" : ""}`
                : undefined
            }
          />
        ))}
      </div>

      <div className="folio">
        <span>Sonia&rsquo;s · {dept.title}</span>
        <span>04</span>
      </div>
    </section>
  );
}
