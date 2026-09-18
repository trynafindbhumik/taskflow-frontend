import React from 'react';

export function JsonLd() {
  const websiteUrl = 'https://taskflow.trynafindbhumik.xyz';
  const developerPortfolio = 'https://www.trynafindbhumik.xyz/';
  const developerName = 'Bhumik Jain';
  const developerUsername = 'trynafindbhumik';

  const jsonLdData = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TaskFlow',
      alternateName: ['TaskFlow Dashboard', 'TaskFlow AI', 'TaskFlow Project Manager'],
      url: websiteUrl,
      image: `${websiteUrl}/TaskFlow-White.png`,
      description:
        'TaskFlow is an enterprise-grade project management and real-time Kanban platform equipped with AI assistant capabilities, live Socket.IO task synchronization, role-based access control, and agile workflow tracking.',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'ProjectManagementApplication',
      operatingSystem: 'All (Web Browser, Responsive Mobile, PWA)',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Person',
        name: developerName,
        alternateName: [developerUsername, 'trynafindbhumikk'],
        url: developerPortfolio,
        jobTitle: 'Full Stack & GenAI Developer',
        sameAs: [
          'https://github.com/trynafindbhumik',
          'https://www.linkedin.com/in/bhumik390',
          'https://www.instagram.com/trynafindbhumikk/',
          developerPortfolio,
        ],
      },
      publisher: {
        '@type': 'Organization',
        name: 'Bhumik Studio',
        url: developerPortfolio,
        logo: {
          '@type': 'ImageObject',
          url: `${websiteUrl}/LogoWhite.png`,
        },
      },
      featureList: [
        'Real-time Socket.IO Kanban board updates',
        'AI-assisted project goal decomposition and task proposal generation',
        'Role-based access control (RBAC)',
        'Subtask creation & priority matrix management',
        'JWT Auth with Refresh Token Rotation & Google OAuth 2.0',
        'Dark and Light high-contrast modern UI themes',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: developerName,
      alternateName: developerUsername,
      url: developerPortfolio,
      jobTitle: 'Full Stack Developer',
      knowsAbout: [
        'Next.js',
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'Prisma',
        'PostgreSQL',
        'Socket.IO',
        'Tailwind CSS',
        'AI Engineering',
      ],
      sameAs: [
        'https://github.com/trynafindbhumik',
        'https://www.linkedin.com/in/bhumik390',
        'https://www.instagram.com/trynafindbhumikk/',
        developerPortfolio,
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: websiteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Sign In',
          item: `${websiteUrl}/login`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Register',
          item: `${websiteUrl}/register`,
        },
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLdData).replace(/</g, '\\u003c'),
      }}
    />
  );
}
