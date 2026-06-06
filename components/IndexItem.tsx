import Link from "next/link";

export type Stat = {
  label: string;
  value: string;
  valueAccent?: string; // optional italic suffix shown in gold
};

export type IndexLink = { label: string; href: string };

export type IndexItemProps = {
  number: string; // e.g. "01"
  title: React.ReactNode; // can contain <em> for italic accent
  blurb: string;
  tags: string[];
  href?: string; // when set, the whole card links here (detail-page mode)
  featured?: boolean;
  stats?: Stat[];
  readMoreLabel?: string; // for non-featured items that just link out
  links?: IndexLink[]; // explicit external links (live/source) — no detail page
  withShot?: boolean; // reserve the right gutter for a floating screenshot
  image?: string; // screenshot path in /public; falls back to a placeholder
  imageAlt?: string;
};

function Shot({ image, imageAlt }: { image?: string; imageAlt?: string }) {
  return (
    <div className="index-shot">
      <div className="shot-frame">
        <div className="shot-bar" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        {image ? (
          <img src={image} alt={imageAlt ?? ""} loading="lazy" />
        ) : (
          <div className="shot-empty">Screenshot coming</div>
        )}
      </div>
    </div>
  );
}

export default function IndexItem({
  number,
  title,
  blurb,
  tags,
  href,
  featured = false,
  stats,
  readMoreLabel,
  links,
  withShot = false,
  image,
  imageAlt,
}: IndexItemProps) {
  const className = `index-item ${featured ? "featured" : ""} ${
    withShot ? "has-shot" : ""
  }`;

  const body = (
    <>
      <div className="index-num">
        № {number}
        {featured && <span className="featured-tag">★ featured</span>}
      </div>

      <div className="index-body">
        <h3 className="index-title">{title}</h3>
        <p className="index-blurb">{blurb}</p>
        <div className="index-tags">
          {tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {readMoreLabel && <span className="read-more">{readMoreLabel}</span>}
        {links && links.length > 0 && (
          <div className="index-links">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="index-link"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {featured && stats && (
        <div className="index-stats">
          {stats.map((s) => (
            <div className="stat-row" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">
                {s.value}
                {s.valueAccent && <em>{s.valueAccent}</em>}
              </span>
            </div>
          ))}
        </div>
      )}

      {withShot &&
        (links && links[0] ? (
          <a
            className="index-shot-link"
            href={links[0].href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${imageAlt ?? "project"}`}
          >
            <Shot image={image} imageAlt={imageAlt} />
          </a>
        ) : (
          <Shot image={image} imageAlt={imageAlt} />
        ))}

      {href && <span className="index-arrow">→</span>}
    </>
  );

  // Detail-page mode: the whole card is a link (used by Products).
  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  // Links mode: no detail page — explicit live/source links inside (Projects).
  return <div className={className}>{body}</div>;
}
