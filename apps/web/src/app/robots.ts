import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cacareeros.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/career',
          '/resumes',
          '/interviews',
          '/practice',
          '/growth',
          '/billing',
          '/settings',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
