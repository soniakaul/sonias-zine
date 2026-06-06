import { getWireItems } from "@/lib/site";
import styles from "@/styles/inky.module.css";

export default function Wire() {
  const items = getWireItems();
  // Duplicate the list so the marquee loops seamlessly
  const doubled = [...items, ...items];

  return (
    <div className={styles.wire}>
      <div className={styles.wireLabel}>Latest ✦</div>
      <div className={styles.wireTrack}>
        <div className={styles.wireContent}>
          {doubled.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              {item}
              <span className={styles.sep}>✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
