import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cacareeros.com';
  const currentDate = new Date().toISOString();

  const publicRoutes = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/security',
    '/cookies',
    '/help',
    '/how-it-works',
    '/careers',
  ];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route === '/pricing' || route === '/features' ? 0.8 : 0.6,
  }));
}
