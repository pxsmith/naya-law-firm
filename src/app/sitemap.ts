import type { MetadataRoute } from "next";
import { siteSettings } from "@content/settings";
import {
  getPracticeAreaSlugs,
  getAttorneySlugs,
  getPostSlugs,
  getCaseStudySlugs,
} from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteSettings.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/for-lawyers",
    "/practice-areas",
    "/attorneys",
    "/insights",
    "/case-studies",
    "/contact",
    "/disclaimer",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
  }));

  const areas = getPracticeAreaSlugs().map((slug) => ({
    url: `${base}/practice-areas/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
  }));

  const attorneys = getAttorneySlugs().map((slug) => ({
    url: `${base}/attorneys/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
  }));

  const posts = getPostSlugs().map((slug) => ({
    url: `${base}/insights/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
  }));

  const cases = getCaseStudySlugs().map((slug) => ({
    url: `${base}/case-studies/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
  }));

  return [...staticRoutes, ...areas, ...attorneys, ...posts, ...cases];
}
