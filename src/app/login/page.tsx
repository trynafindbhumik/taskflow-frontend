import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginComponent from '@/components/login/Login';

export const metadata: Metadata = {
  title: 'Sign In | TaskFlow - AI Project Management Platform',
  description:
    'Sign in to your TaskFlow account to manage agile projects, track Kanban tasks in real-time, and collaborate with your team. Built by Bhumik Jain.',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz/login',
  },
  openGraph: {
    title: 'Sign In to TaskFlow | AI Project Management & Real-Time Kanban',
    description:
      'Access your TaskFlow workspace. Real-time Socket.IO board updates, AI task assistant, and agile workflow management.',
    url: 'https://taskflow.trynafindbhumik.xyz/login',
  },
};

export default function Login() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
