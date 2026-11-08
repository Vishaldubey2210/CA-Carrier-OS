/** @type {import('next').NextConfig} */

function resolveApiOrigin() {
  const rawOrigin = process.env.API_ORIGIN?.trim();

  // If API_ORIGIN is explicitly provided (and not an empty or invalid placeholder), use it
  if (rawOrigin && !rawOrigin.includes('placeholder')) {
    return rawOrigin.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
  }

  // When deployed on Vercel without an external backend, return null so Next.js built-in
  // serverless route handlers at /api/v1/[...slug] serve requests with zero configuration errors.
  return null;
}

const apiOrigin = resolveApiOrigin();

const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ['@ca-career-os/shared'],
  async rewrites() {
    if (!apiOrigin) {
      return [];
    }
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
