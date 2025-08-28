import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "standalone",
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

interface PhaseConfig extends NextConfig {
  env: Record<string, string | undefined>;
}

export default module.exports = (phase: string): PhaseConfig => {
  console.log("config", phase);
  return {
    ...nextConfig,
    env: {
      PHASE: phase,
    },
  };
};
