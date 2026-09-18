import type { Metadata } from 'next';

import RegisterComponent from '@/components/register/Register';

export const metadata: Metadata = {
  title: 'Create Account | TaskFlow - AI Kanban & Project Workspace',
  description:
    'Join TaskFlow to organize projects, automate workflow tasks with AI, and collaborate with your team in real time. Built by Bhumik Jain (trynafindbhumik).',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz/register',
  },
  openGraph: {
    title: 'Create Account | TaskFlow Real-Time Project Workspace',
    description:
      'Start organizing tasks with real-time Kanban boards and AI workflow automation on TaskFlow.',
    url: 'https://taskflow.trynafindbhumik.xyz/register',
  },
};

export default function Register() {
  return <RegisterComponent />;
}
