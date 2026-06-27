import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// A simplified take on the hero: the hero still as a dark, cinematic base with
// the brand lime accent + the headline set in the brand display face.
export const alt =
  "Naya Law — AI-native commercial real estate law firm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Assets live next to this route (src/app/_og). Read them from disk at build
// time (this image is statically generated) — more reliable than fetch().
function asset(file: string) {
  return readFileSync(join(process.cwd(), "src/app/_og", file));
}

export default async function OpenGraphImage() {
  const heroJpg = asset("hero.jpg");
  const fansanDisplay = asset("Fansan-DisplayBold.ttf");
  const ryman = asset("RymanGothicPro-Bold.ttf");

  const heroSrc = `data:image/jpeg;base64,${heroJpg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0a0b0e",
          fontFamily: "Fansan Display",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Left-heavy dark gradient for text legibility (mirrors the hero). */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(10,11,14,0.94) 0%, rgba(10,11,14,0.78) 45%, rgba(10,11,14,0.4) 100%)",
          }}
        />
        {/* Solid-feathered mask over the top-right to hide the stock-footage
            watermark. Angled linear-gradient (satori-reliable, unlike radial). */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 560,
            height: 300,
            background:
              "linear-gradient(225deg, rgba(10,11,14,1) 0%, rgba(10,11,14,1) 45%, rgba(10,11,14,0) 78%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "80px",
          }}
        >
          {/* Eyebrow: lime dot + wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: "#b1e244",
                boxShadow: "0 0 24px 4px rgba(177,226,68,0.55)",
              }}
            />
            <div
              style={{
                fontFamily: "Ryman Gothic Pro",
                fontSize: 30,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#ebecef",
              }}
            >
              Naya Law
            </div>
          </div>

          {/* Headline — the hero line, in the display face */}
          <div
            style={{
              fontSize: 92,
              lineHeight: 1.04,
              color: "#f5f5f0",
              maxWidth: 880,
              letterSpacing: "-0.01em",
            }}
          >
            AI-native commercial real estate law firm
          </div>

          {/* Lime underline accent */}
          <div
            style={{
              marginTop: 44,
              width: 140,
              height: 5,
              borderRadius: 3,
              background: "#b1e244",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fansan Display", data: fansanDisplay, weight: 700, style: "normal" },
        { name: "Ryman Gothic Pro", data: ryman, weight: 700, style: "normal" },
      ],
    },
  );
}
