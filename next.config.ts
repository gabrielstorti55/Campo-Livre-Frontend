import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env['NEXT_DIST_DIR'] ?? '.next',
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    cpus: 2,
    workerThreads: true,
  },
};

export default nextConfig;
