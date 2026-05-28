import { parseTitle } from "@/lib/content";

export default function TitleText({ title }: { title: string }) {
  return (
    <>
      {parseTitle(title).map((segment, i) =>
        segment.accent ? (
          <em key={i}>{segment.text}</em>
        ) : (
          <span key={i}>{segment.text}</span>
        )
      )}
    </>
  );
}
