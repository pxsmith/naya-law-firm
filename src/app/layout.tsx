import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteSettings } from "@content/settings";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  StructuredData,
  legalServiceSchema,
  organizationSchema,
} from "@/components/StructuredData";
import { ShaderControls } from "@/components/ShaderControls";
import "@/styles/globals.css";
import "@/styles/typography.css";

const ryman = localFont({
  src: [
    { path: "../fonts/RymanGothicPro-Thin.woff2", weight: "100", style: "normal" },
    { path: "../fonts/RymanGothicPro-ThinItalic.woff2", weight: "100", style: "italic" },
    { path: "../fonts/RymanGothicPro-UltraLight.woff2", weight: "200", style: "normal" },
    { path: "../fonts/RymanGothicPro-UltraLightItalic.woff2", weight: "200", style: "italic" },
    { path: "../fonts/RymanGothicPro-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/RymanGothicPro-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/RymanGothicPro-Book.woff2", weight: "350", style: "normal" },
    { path: "../fonts/RymanGothicPro-BookItalic.woff2", weight: "350", style: "italic" },
    { path: "../fonts/RymanGothicPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/RymanGothicPro-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/RymanGothicPro-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/RymanGothicPro-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "../fonts/RymanGothicPro-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../fonts/RymanGothicPro-ExtraBoldItalic.woff2", weight: "800", style: "italic" },
    { path: "../fonts/RymanGothicPro-Heavy.woff2", weight: "850", style: "normal" },
    { path: "../fonts/RymanGothicPro-HeavyItalic.woff2", weight: "850", style: "italic" },
    { path: "../fonts/RymanGothicPro-Black.woff2", weight: "900", style: "normal" },
    { path: "../fonts/RymanGothicPro-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-ryman",
  display: "swap",
});

const fansan = localFont({
  src: [
    { path: "../fonts/Fansan-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Fansan-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/Fansan-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Fansan-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Fansan-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Fansan-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/Fansan-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Fansan-SemiboldItalic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/Fansan-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Fansan-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-fansan",
  display: "swap",
});

const fansanDisplay = localFont({
  src: [
    { path: "../fonts/Fansan-DisplayLight.woff2", weight: "300", style: "normal" },
    { path: "../fonts/Fansan-DisplayLightItalic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/Fansan-Display.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Fansan-DisplayItalic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/Fansan-DisplayMedium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Fansan-DisplayMediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/Fansan-DisplaySemibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Fansan-DisplaySemiboldItalic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/Fansan-DisplayBold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/Fansan-DisplayBoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-fansan-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteSettings.siteUrl),
  title: {
    default: `${siteSettings.firmName} — AI-native commercial real estate law firm`,
    template: `%s — ${siteSettings.firmName}`,
  },
  description: siteSettings.tagline,
  applicationName: siteSettings.firmName,
  keywords: [
    "commercial real estate law firm",
    "fixed-fee legal",
    "AI law firm",
    "institutional lenders",
    "commercial mortgage closings",
    "Naya Law",
  ],
  authors: [{ name: siteSettings.firmName }],
  creator: siteSettings.firmName,
  publisher: siteSettings.legalEntity,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteSettings.firmName,
    title: `${siteSettings.firmName} — AI-native commercial real estate law firm`,
    description: siteSettings.tagline,
    url: siteSettings.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteSettings.firmName} — AI-native commercial real estate law firm`,
    description: siteSettings.tagline,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${ryman.variable} ${fansan.variable} ${fansanDisplay.variable}`}
    >
      <body>
        <StructuredData data={[legalServiceSchema(), organizationSchema()]} />
        <Header />
        <ShaderControls>
          <main>{children}</main>
        </ShaderControls>
        <Footer />
      </body>
    </html>
  );
}
