import Link from "next/link";
import { getCover, DEPARTMENTS } from "@/lib/site";

export default function HomePage() {
  const cover = getCover();

  return (
    <section className="cover">
      <div className="cover-eyebrow">{cover.eyebrow}</div>
      <h1 className="cover-title">
        Sonia<span className="apos">&rsquo;s</span>
      </h1>
      <p className="cover-sub">{cover.subtitle}</p>

      <nav className="cover-toc">
        {Object.entries(DEPARTMENTS).map(([_, dept]) => (
          <Link href={dept.href} key={dept.title} className="toc-item">
            <span className="toc-num">№ {dept.number} — Department</span>
            <h3 className="toc-title">{dept.title}</h3>
            <p className="toc-desc">{dept.description}</p>
            <span className="toc-folio">{dept.pageRange}</span>
            <span className="toc-arrow">↗</span>
          </Link>
        ))}
      </nav>

      <div className="scroll-hint">↓ Open a department</div>
    </section>
  );
}
