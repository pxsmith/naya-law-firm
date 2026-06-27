import type { MetadataRoute } from "next";
import { siteSettings } from "@content/settings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteSettings.firmName} — AI-native commercial real estate law firm`,
    short_name: siteSettings.firmName,
    description: siteSettings.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0e",
    theme_color: "#0a0b0e",
    icons: [
      {
        src: "/icon.png",
        sizes: "112x112",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "112x112",
        type: "image/png",
      },
    ],
  };
}
