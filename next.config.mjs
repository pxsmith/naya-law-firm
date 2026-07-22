import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,

  // Files in /public are served with no-cache by default, so every repeat
  // visitor re-downloads the background videos.
  //
  // These filenames are stable (re-encoding produces hero.mp4 again), so a long
  // plain max-age would pin a stale video in browsers with no way to bust it —
  // which bit during development, when a re-encode kept serving the old file.
  // `stale-while-revalidate` avoids that: repeat visits paint instantly from
  // cache for up to a month, while the browser refreshes the file in the
  // background, so a replaced video propagates on the next visit after a day.
  async headers() {
    return [
      {
        source: "/:dir(videos|posters)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
