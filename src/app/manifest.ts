import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskFlow | Real-Time AI Project Management & Kanban Platform',
    short_name: 'TaskFlow',
    description:
      'Enterprise-grade real-time Kanban project management platform with AI goal decomposition, Socket.IO task sync, and team collaboration. Built by Bhumik Jain (trynafindbhumik).',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/faviconWhite.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
      {
        src: '/LogoWhite.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/LogoWhite.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
