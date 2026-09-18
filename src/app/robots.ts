import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register', '/forgot-password', '/verify-email', '/reset-password'],
      disallow: [
        '/api/',
        '/dashboard/',
        '/projects/',
        '/settings/',
        '/profile/',
        '/ai/',
        '/private/',
      ],
    },
    sitemap: 'https://taskflow.trynafindbhumik.xyz/sitemap.xml',
  };
}
