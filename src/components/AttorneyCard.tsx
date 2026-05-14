import Link from "next/link";
import type { AttorneyFrontmatter } from "@/lib/content";
import styles from "./AttorneyCard.module.css";

interface Props {
  attorney: AttorneyFrontmatter;
}

export function AttorneyCard({ attorney }: Props) {
  return (
    <Link href={`/attorneys/${attorney.slug}`} className={styles.card}>
      <div className={styles.photoWrap}>
        {/* Photo is a plain img to avoid next/image config requirements for the scaffold. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attorney.photo}
          alt={attorney.name}
          className={styles.photo}
          loading="lazy"
        />
      </div>
      <h3 className={styles.name}>{attorney.name}</h3>
      <p className={styles.title}>{attorney.title}</p>
    </Link>
  );
}
