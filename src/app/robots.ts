import type { MetadataRoute } from "next";
import { siteSettings } from "@content/settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /pricing is a lead-gen survey marked noindex — keep it out of crawls.
      disallow: "/pricing",
    },
    sitemap: `${siteSettings.siteUrl}/sitemap.xml`,
  };
}
