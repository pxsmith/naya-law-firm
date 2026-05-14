import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { siteSettings } from "@content/settings";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  StructuredData,
  legalServiceSchema,
} from "@/components/StructuredData";
import "@/styles/globals.css";
import "@/styles/typography.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: {
    default: siteSettings.firmName,
    template: `%s — ${siteSettings.firmName}`,
  },
  description: siteSettings.tagline,
  openGraph: {
    type: "website",
    siteName: siteSettings.firmName,
    title: siteSettings.firmName,
    description: siteSettings.tagline,
    url: siteSettings.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteSettings.firmName,
    description: siteSettings.tagline,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        <StructuredData data={legalServiceSchema()} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
