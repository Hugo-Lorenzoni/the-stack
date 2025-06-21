/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '172.17.0.22',
        port: '9000',
        pathname: '/cpv/**',
      },
    ],
  },
};

module.exports = nextConfig;
