"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/toc";

export default function ArticleTOC({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 }
    );

    const els = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => Boolean(el));
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="article-toc" aria-label="Contents">
      <span className="toc-label">Contents</span>
      <ol>
        {items.map((it) => (
          <li
            key={it.id}
            className={`toc-row toc-l${it.level} ${
              active === it.id ? "active" : ""
            }`}
          >
            <a href={`#${it.id}`}>{it.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
