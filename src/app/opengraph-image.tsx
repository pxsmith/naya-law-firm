import { ImageResponse } from "next/og";
import { siteSettings } from "@content/settings";

export const alt = siteSettings.firmName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#1e3a5f",
          color: "#ffffff",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: 0.7,
            marginBottom: 24,
          }}
        >
          {siteSettings.firmName}
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.1,
            fontWeight: 500,
            maxWidth: 900,
          }}
        >
          {siteSettings.tagline}
        </div>
      </div>
    ),
    size,
  );
}
