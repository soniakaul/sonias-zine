export type PhotoCardProps = {
  frame: string; // "01"
  place: string; // "Monterey, CA · May 2026"
  caption: string;
  imageSrc?: string;
};

export default function PhotoCard({
  frame,
  place,
  caption,
  imageSrc,
}: PhotoCardProps) {
  return (
    <div className="photo-card">
      <span className="frame-label">Frame {frame}</span>
      {imageSrc && <img src={imageSrc} alt={caption} />}
      <div className="photo-caption">
        <span className="place">{place}</span>
        {caption}
      </div>
    </div>
  );
}
