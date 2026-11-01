const isProd = process.env.NODE_ENV === 'production';
const repoBase = '/barbarian-game';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isProd ? repoBase : '',
  assetPrefix: isProd ? repoBase + '/' : '',
  // 手機用同一個 Wi-Fi 連 `npm run dev` 時,Next.js 預設會擋跨來源的開發資源(HMR 等),
  // 要把區網 IP 加進白名單才能從手機正常打開。
  allowedDevOrigins: ['192.168.1.104', '192.168.1.*'],
  devIndicators: false,
};

export default nextConfig;
