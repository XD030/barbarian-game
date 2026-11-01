const isProd = process.env.NODE_ENV === 'production';
const repoBase = '/barbarian-game';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProd ? repoBase : '',
  assetPrefix: isProd ? repoBase + '/' : '',
};

export default nextConfig;
