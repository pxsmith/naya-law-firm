import { readdirSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";

const contentRoot = join(process.cwd(), "content");

function listSlugs(folder: string): string[] {
  return readdirSync(join(contentRoot, folder))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export interface PracticeAreaFrontmatter {
  title: string;
  slug: string;
  summary: string;
  order: number;
  featured?: boolean;
}

export interface AttorneyFrontmatter {
  name: string;
  slug: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
  practiceAreas: string[];
  barAdmissions: string[];
  education: string[];
  order: number;
}

export interface PostFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

export interface CaseStudyFrontmatter {
  title: string;
  slug: string;
  summary: string;
  client?: string;
  outcome?: string;
  practiceArea?: string;
}

interface MdxModule<T> {
  frontmatter: T;
  default: ComponentType;
}

export function getPracticeAreaSlugs() {
  return listSlugs("practice-areas");
}

export async function getPracticeArea(slug: string) {
  const mod: MdxModule<PracticeAreaFrontmatter> = await import(
    `../../content/practice-areas/${slug}.mdx`
  );
  return { frontmatter: mod.frontmatter, Content: mod.default };
}

export async function getAllPracticeAreas() {
  const slugs = getPracticeAreaSlugs();
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const mod: MdxModule<PracticeAreaFrontmatter> = await import(
        `../../content/practice-areas/${slug}.mdx`
      );
      return mod.frontmatter;
    }),
  );
  return items.sort((a, b) => a.order - b.order);
}

export function getAttorneySlugs() {
  return listSlugs("attorneys");
}

export async function getAttorney(slug: string) {
  const mod: MdxModule<AttorneyFrontmatter> = await import(
    `../../content/attorneys/${slug}.mdx`
  );
  return { frontmatter: mod.frontmatter, Content: mod.default };
}

export async function getAllAttorneys() {
  const slugs = getAttorneySlugs();
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const mod: MdxModule<AttorneyFrontmatter> = await import(
        `../../content/attorneys/${slug}.mdx`
      );
      return mod.frontmatter;
    }),
  );
  return items.sort((a, b) => a.order - b.order);
}

export function getPostSlugs() {
  return listSlugs("insights");
}

export async function getPost(slug: string) {
  const mod: MdxModule<PostFrontmatter> = await import(
    `../../content/insights/${slug}.mdx`
  );
  return { frontmatter: mod.frontmatter, Content: mod.default };
}

export async function getAllPosts() {
  const slugs = getPostSlugs();
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const mod: MdxModule<PostFrontmatter> = await import(
        `../../content/insights/${slug}.mdx`
      );
      return mod.frontmatter;
    }),
  );
  return items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getCaseStudySlugs() {
  try {
    return listSlugs("case-studies");
  } catch {
    return [];
  }
}

export async function getCaseStudy(slug: string) {
  const mod: MdxModule<CaseStudyFrontmatter> = await import(
    `../../content/case-studies/${slug}.mdx`
  );
  return { frontmatter: mod.frontmatter, Content: mod.default };
}

export async function getAllCaseStudies() {
  const slugs = getCaseStudySlugs();
  const items = await Promise.all(
    slugs.map(async (slug) => {
      const mod: MdxModule<CaseStudyFrontmatter> = await import(
        `../../content/case-studies/${slug}.mdx`
      );
      return mod.frontmatter;
    }),
  );
  return items;
}
