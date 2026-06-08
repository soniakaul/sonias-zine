// ============================================================
// SITE CONFIG
// This file is the simplest place to edit the running state
// of the publication. The masthead reads from here, the wire
// reads from here, and the cover subtitle reads from here.
//
// To "publish a new issue," bump volume.minor.
// To update what's on the wire, edit wireItems.
// ============================================================

export function getMasthead() {
  return {
    name: "Sonia Kaul",
    location: "San Francisco, CA",
    volume: { major: 1, minor: 25 },
    lastRevised: formatDate(new Date()),
    tagline: "A Living Publication",
  };
}

export function getCover() {
  return {
    eyebrow:
      "A magazine of projects, products, and photographs.",
    subtitle:
      "An ongoing record of the engineering I'm shipping, the products I'm taking apart and spec'ing out, and the photographs I'm taking.",
  };
}

export function getWireItems(): string[] {
  // Edit this list anytime — what's the wire showing today?
  return [
    "Last shipped · Tally: household payments tracker",
    "Currently reading · Project Hail Mary, Andy Weir",
    "Open obsession · dates (the fruit)",
    "Now playing · IT'S BEEN AWFUL, Isaiah Rashad",
  ];
}

export const DEPARTMENTS = {
  projects: {
    number: "01",
    title: "Projects",
    description:
      "The technical builds — what I made it do, how it works under the hood.",
    pageRange: "pp. 04—22",
    href: "/projects",
  },
  products: {
    number: "02",
    title: "Product",
    description:
      "Product teardowns, PRDs, and product thinking.",
    pageRange: "pp. 24—36",
    href: "/products",
  },
  photography: {
    number: "03",
    title: "Photography",
    description:
      "Field notes from everywhere I go.",
    pageRange: "pp. 38—54",
    href: "/photography",
  },
} as const;

function formatDate(d: Date): string {
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}
