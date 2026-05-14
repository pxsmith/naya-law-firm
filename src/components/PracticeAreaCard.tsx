import Link from "next/link";
import type { PracticeAreaFrontmatter } from "@/lib/content";
import styles from "./PracticeAreaCard.module.css";

interface Props {
  area: PracticeAreaFrontmatter;
}

export function PracticeAreaCard({ area }: Props) {
  return (
    <Link href={`/practice-areas/${area.slug}`} className={styles.card}>
      <h3 className={styles.title}>{area.title}</h3>
      <p className={styles.summary}>{area.summary}</p>
      <span className={styles.cta}>Learn more &rarr;</span>
    </Link>
  );
}
