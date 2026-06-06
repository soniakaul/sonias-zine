import Link from "next/link";
import { getMasthead } from "@/lib/site";

export default function Masthead() {
  const { name, location, volume, tagline } = getMasthead();

  return (
    <header className="masthead">
      <div className="masthead-left">
        <Link href="/" className="masthead-home" aria-label="Return to cover">
          <span className="masthead-home-icon" aria-hidden="true">⌂</span>
          {name}
        </Link>
      </div>
      <div className="masthead-center">
        Vol. {volume.major} · No. {String(volume.minor).padStart(3, "0")} ·{" "}
        {tagline}
      </div>
      <div className="masthead-right">{location}</div>
    </header>
  );
}
