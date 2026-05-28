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
    location: "Fremont, CA",
    volume: { major: 1, minor: 37 },
    lastRevised: formatDate(new Date()),
    tagline: "A Living Publication",
  };
}

export function getCover() {
  return {
    eyebrow:
      "A magazine of software, photographs, and other obsessions",
    subtitle:
      "An ongoing record of the engineering I'm shipping, the photographs I keep taking, and the products I'm still figuring out.",
  };
}

export function getWireItems(): string[] {
  // Edit this list anytime — what's the wire showing today?
  return [
    "Last shipped · AI Conflict Resolver V1",
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
    title: "Products",
    description:
      "PRDs, product thinking, and the long arc from engineer to product person.",
    pageRange: "pp. 24—36",
    href: "/products",
  },
  photography: {
    number: "03",
    title: "Photography",
    description:
      "Field notes from five countries. Mostly above water, increasingly below.",
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
