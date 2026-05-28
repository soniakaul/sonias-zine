import PhotoCard from "@/components/PhotoCard";
import { getPhotos } from "@/lib/content";
import { DEPARTMENTS } from "@/lib/site";

export const metadata = { title: "Photography — Sonia's" };

export default function PhotographyPage() {
  const photos = getPhotos();
  const dept = DEPARTMENTS.photography;

  return (
    <section className="spread">
      <div className="spread-meta">
        <span className="dept">
          № {dept.number} — {dept.title}
        </span>
        <span className="dot"></span>
        <span>Field notes from five countries</span>
      </div>

      <h2 className="spread-headline">
        Mostly <em>above</em> water.
        <br />
        Increasingly below.
      </h2>

      <p className="spread-deck">
        A rolling archive. Each frame links to a fuller field note — where,
        when, what I was thinking.
      </p>

      <div className="photo-grid">
        {photos.map((p) => (
          <PhotoCard
            key={p.frame}
            frame={p.frame}
            place={p.place}
            caption={p.caption}
            imageSrc={p.imageSrc}
          />
        ))}
      </div>

      <div className="folio">
        <span>Sonia&rsquo;s · {dept.title}</span>
        <span>38</span>
      </div>
    </section>
  );
}
