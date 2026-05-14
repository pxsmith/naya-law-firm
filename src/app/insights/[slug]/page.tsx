import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import {
  StructuredData,
  articleSchema,
} from "@/components/StructuredData";
import { getPost, getPostSlugs, getAllAttorneys } from "@/lib/content";
import styles from "./post.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getPost(slug);
    return {
      title: frontmatter.title,
      description: frontmatter.excerpt,
      openGraph: {
        title: frontmatter.title,
        description: frontmatter.excerpt,
        type: "article",
        publishedTime: frontmatter.publishedAt,
      },
    };
  } catch {
    return {};
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let data;
  try {
    data = await getPost(slug);
  } catch {
    notFound();
  }
  const { frontmatter, Content } = data;
  const url = `${siteSettings.siteUrl}/insights/${frontmatter.slug}`;

  const attorneys = await getAllAttorneys();
  const author = attorneys.find((a) => a.slug === frontmatter.author);

  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: frontmatter.title,
          url,
          datePublished: frontmatter.publishedAt,
          authorName: author?.name,
        })}
      />
      <Container narrow>
        <article className={styles.article}>
          <header className={styles.header}>
            <time
              dateTime={frontmatter.publishedAt}
              className={styles.date}
            >
              {formatDate(frontmatter.publishedAt)}
            </time>
            <h1 className={styles.title}>{frontmatter.title}</h1>
            {author && (
              <p className={styles.author}>
                By{" "}
                <Link href={`/attorneys/${author.slug}`}>{author.name}</Link>
              </p>
            )}
          </header>
          <div className="prose">
            <Content />
          </div>
          <footer className={styles.footer}>
            <Link href="/insights">&larr; All insights</Link>
          </footer>
        </article>
      </Container>
    </>
  );
}
