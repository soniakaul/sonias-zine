import Link from "next/link";

export type Stat = {
  label: string;
  value: string;
  valueAccent?: string; // optional italic suffix shown in gold
};

export type IndexItemProps = {
  number: string; // e.g. "01"
  title: React.ReactNode; // can contain <em> for italic accent
  blurb: string;
  tags: string[];
  href: string;
  featured?: boolean;
  stats?: Stat[];
  readMoreLabel?: string; // for non-featured items that just link out
};

export default function IndexItem({
  number,
  title,
  blurb,
  tags,
  href,
  featured = false,
  stats,
  readMoreLabel,
}: IndexItemProps) {
  return (
    <Link href={href} className={`index-item ${featured ? "featured" : ""}`}>
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
        {readMoreLabel && (
          <span className="read-more">{readMoreLabel}</span>
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

      <span className="index-arrow">→</span>
    </Link>
  );
}
