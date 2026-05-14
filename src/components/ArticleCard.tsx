import Link from "next/link";
import type { PostFrontmatter } from "@/lib/content";
import styles from "./ArticleCard.module.css";

interface Props {
  post: PostFrontmatter;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleCard({ post }: Props) {
  return (
    <article className={styles.card}>
      <time dateTime={post.publishedAt} className={styles.date}>
        {formatDate(post.publishedAt)}
      </time>
      <h3 className={styles.title}>
        <Link href={`/insights/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className={styles.excerpt}>{post.excerpt}</p>
      <Link href={`/insights/${post.slug}`} className={styles.cta}>
        Read more &rarr;
      </Link>
    </article>
  );
}
