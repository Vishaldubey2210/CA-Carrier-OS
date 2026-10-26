/** @type {import('next').NextConfig} */

function resolveApiOrigin() {
  const rawOrigin = process.env.API_ORIGIN?.trim();
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (!rawOrigin) {
    if (isVercel) {
      console.warn(
        '⚠️ WARNING: API_ORIGIN environment variable is not yet set in Vercel. ' +
        'Remember to set API_ORIGIN in Vercel Project Settings to your deployed backend API URL ' +
        '(e.g., "https://ca-career-os-api.vercel.app") to proxy /api/v1 requests.'
      );
      return 'https://api-placeholder.vercel.app';
    }
    // Safe localhost fallback for local development and offline CI tests
    return 'http://127.0.0.1:4000';
  }

  // Normalize: strip trailing slashes and ensure no duplicate /api/v1 is appended
  return rawOrigin.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
}

const apiOrigin = resolveApiOrigin();

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ca-career-os/shared'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

