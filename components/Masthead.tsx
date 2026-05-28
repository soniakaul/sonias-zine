import { getMasthead } from "@/lib/site";

export default function Masthead() {
  const { name, location, volume, lastRevised, tagline } = getMasthead();

  return (
    <header className="masthead">
      <div className="masthead-left">
        {name} · {location}
      </div>
      <div className="masthead-center">
        Vol. {volume.major} · No. {String(volume.minor).padStart(3, "0")} ·{" "}
        {tagline}
      </div>
      <div className="masthead-right">Last revised {lastRevised}</div>
    </header>
  );
}
