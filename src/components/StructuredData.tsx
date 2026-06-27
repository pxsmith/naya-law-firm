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

function postalAddress(): JsonLd | undefined {
  const office = siteSettings.offices[0];
  if (!office) return undefined;
  return {
    "@type": "PostalAddress",
    streetAddress: office.street,
    addressLocality: office.city,
    addressRegion: office.region,
    postalCode: office.postalCode,
    addressCountry: office.country,
  };
}

// Drop empty/placeholder fields so we never publish blank or fake data.
function pruned(obj: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  );
}

export function legalServiceSchema(): JsonLd {
  return pruned({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": `${siteSettings.siteUrl}/#legalservice`,
    name: siteSettings.firmName,
    url: siteSettings.siteUrl,
    logo: `${siteSettings.siteUrl}/brand/naya-logo.png`,
    image: `${siteSettings.siteUrl}/opengraph-image`,
    description: siteSettings.tagline,
    telephone: siteSettings.contact.phone,
    email: siteSettings.contact.email,
    areaServed: "US",
    priceRange: "$$",
    address: postalAddress(),
  });
}

export function organizationSchema(): JsonLd {
  const sameAs = [siteSettings.social.linkedin, siteSettings.social.x].filter(
    Boolean,
  );
  return pruned({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteSettings.siteUrl}/#organization`,
    name: siteSettings.legalEntity,
    alternateName: siteSettings.firmName,
    url: siteSettings.siteUrl,
    logo: `${siteSettings.siteUrl}/brand/naya-logo.png`,
    email: siteSettings.contact.email,
    address: postalAddress(),
    ...(sameAs.length ? { sameAs } : {}),
  });
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
