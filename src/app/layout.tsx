import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { ThemeProvider } from '@/components/providers/themeProvider/ThemeProvider';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToastProvider } from '@/components/ui/toast/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://taskflow.trynafindbhumik.xyz'),
  title: {
    default: 'TaskFlow | Real-Time AI Project Management & Kanban Platform',
    template: '%s | TaskFlow',
  },
  description:
    'TaskFlow is an enterprise-grade project management and real-time Kanban platform featuring AI goal decomposition, Socket.IO live sync, role-based access control, and agile workflow analytics. Built by Full Stack Developer Bhumik Jain (trynafindbhumik).',
  applicationName: 'TaskFlow',
  category: 'productivity',
  classification: 'Project Management & Team Collaboration',
  keywords: [
    'Task Management',
    'Project Management Platform',
    'AI Task Assistant',
    'Kanban Board App',
    'Real-time Collaboration',
    'Agile Task Tracker',
    'Socket.IO Live Sync',
    'TaskFlow',
    'Task Flow App',
    'Productivity App',
    'Team Workflow',
    'Scrum & Sprint Management',
    'Bhumik Jain',
    'trynafindbhumik',
    'Bhumik Studio',
  ],
  authors: [
    { name: 'Bhumik Jain', url: 'https://www.trynafindbhumik.xyz/' },
    { name: 'trynafindbhumik', url: 'https://github.com/trynafindbhumik' },
  ],
  creator: 'Bhumik Jain (trynafindbhumik)',
  publisher: 'Bhumik Studio',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz',
  },
  manifest: '/manifest.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'TaskFlow | Real-Time AI Project Management & Kanban Platform',
    description:
      'Streamline team collaboration and supercharge productivity with TaskFlow — real-time Kanban, Socket.IO sync, and AI task assistant by Bhumik Jain.',
    url: 'https://taskflow.trynafindbhumik.xyz',
    siteName: 'TaskFlow',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/TaskFlow-White.png',
        width: 1200,
        height: 630,
        alt: 'TaskFlow Dashboard Dark Mode Workspace Preview',
      },
      {
        url: '/TaskFlow-Dark.png',
        width: 1200,
        height: 630,
        alt: 'TaskFlow Dashboard Light Mode Workspace Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskFlow | Real-Time AI Project Management Platform',
    description:
      'Streamline team collaboration with real-time Kanban boards, Socket.IO live sync, and AI workspace automation. Built by Bhumik Jain (@trynafindbhumikk).',
    creator: '@trynafindbhumikk',
    site: '@trynafindbhumikk',
    images: ['/TaskFlow-White.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/faviconDark.ico', media: '(prefers-color-scheme: light)' },
      { url: '/faviconWhite.ico', media: '(prefers-color-scheme: dark)' },
    ],
    apple: [{ url: '/LogoDark.png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
