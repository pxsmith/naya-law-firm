import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { siteSettings } from "@content/settings";
import { Container } from "@/components/Container";
import {
  StructuredData,
  attorneySchema,
} from "@/components/StructuredData";
import { getAttorney, getAttorneySlugs } from "@/lib/content";
import styles from "./attorney.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAttorneySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getAttorney(slug);
    return {
      title: `${frontmatter.name}, ${frontmatter.title}`,
      description: `${frontmatter.name} — ${frontmatter.title} at ${siteSettings.firmName}.`,
    };
  } catch {
    return {};
  }
}

export default async function AttorneyPage({ params }: Props) {
  const { slug } = await params;
  let data;
  try {
    data = await getAttorney(slug);
  } catch {
    notFound();
  }
  const { frontmatter, Content } = data;
  const url = `${siteSettings.siteUrl}/attorneys/${frontmatter.slug}`;

  return (
    <>
      <StructuredData
        data={attorneySchema({
          name: frontmatter.name,
          title: frontmatter.title,
          url,
          image: frontmatter.photo
            ? `${siteSettings.siteUrl}${frontmatter.photo}`
            : undefined,
          email: frontmatter.email,
          telephone: frontmatter.phone,
        })}
      />
      <Container>
        <div className={styles.layout}>
          <aside className={styles.aside}>
            <div className={styles.photoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frontmatter.photo}
                alt={frontmatter.name}
                className={styles.photo}
              />
            </div>
            <dl className={styles.meta}>
              <div>
                <dt>Contact</dt>
                <dd>
                  <a href={`mailto:${frontmatter.email}`}>{frontmatter.email}</a>
                  <br />
                  <a href={`tel:${frontmatter.phone}`}>{frontmatter.phone}</a>
                </dd>
              </div>
              {frontmatter.barAdmissions.length > 0 && (
                <div>
                  <dt>Bar admissions</dt>
                  <dd>
                    <ul>
                      {frontmatter.barAdmissions.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {frontmatter.education.length > 0 && (
                <div>
                  <dt>Education</dt>
                  <dd>
                    <ul>
                      {frontmatter.education.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {frontmatter.practiceAreas.length > 0 && (
                <div>
                  <dt>Practice areas</dt>
                  <dd>
                    <ul>
                      {frontmatter.practiceAreas.map((slug) => (
                        <li key={slug}>
                          <Link href={`/practice-areas/${slug}`}>
                            {slug
                              .split("-")
                              .map((s) => s[0].toUpperCase() + s.slice(1))
                              .join(" ")}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
          <article className={styles.body}>
            <p className={styles.title}>{frontmatter.title}</p>
            <h1 className={styles.name}>{frontmatter.name}</h1>
            <div className="prose">
              <Content />
            </div>
          </article>
        </div>
      </Container>
    </>
  );
}
