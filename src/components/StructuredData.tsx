import { siteSettings } from "@content/settings";

type JsonLd = Record<string, unknown>;

interface StructuredDataProps {
  data: JsonLd | JsonLd[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

export function legalServiceSchema(): JsonLd {
  const office = siteSettings.offices[0];
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: siteSettings.firmName,
    url: siteSettings.siteUrl,
    telephone: siteSettings.contact.phone,
    email: siteSettings.contact.email,
    address: office
      ? {
          "@type": "PostalAddress",
          streetAddress: office.street,
          addressLocality: office.city,
          addressRegion: office.region,
          postalCode: office.postalCode,
          addressCountry: office.country,
        }
      : undefined,
  };
}

interface AttorneySchemaInput {
  name: string;
  title: string;
  url: string;
  image?: string;
  email?: string;
  telephone?: string;
}

export function attorneySchema(a: AttorneySchemaInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Attorney",
    name: a.name,
    jobTitle: a.title,
    url: a.url,
    image: a.image,
    email: a.email,
    telephone: a.telephone,
    worksFor: {
      "@type": "LegalService",
      name: siteSettings.firmName,
      url: siteSettings.siteUrl,
    },
  };
}

interface ArticleSchemaInput {
  headline: string;
  url: string;
  datePublished: string;
  authorName?: string;
}

export function articleSchema(a: ArticleSchemaInput): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.headline,
    url: a.url,
    datePublished: a.datePublished,
    author: a.authorName
      ? { "@type": "Person", name: a.authorName }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: siteSettings.firmName,
      url: siteSettings.siteUrl,
    },
  };
}
