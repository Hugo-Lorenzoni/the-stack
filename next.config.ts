import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
