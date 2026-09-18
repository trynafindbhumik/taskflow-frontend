import type { Metadata } from 'next';
import { Suspense } from 'react';

import ForgotPasswordComponent from '@/components/forgotPassword/ForgotPassword';

export const metadata: Metadata = {
  title: 'Forgot Password | TaskFlow Account Recovery',
  description:
    'Reset your TaskFlow account password to regain access to your Kanban project workspace.',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz/forgot-password',
  },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <ForgotPasswordComponent />
    </Suspense>
  );
}
