import type { Metadata } from 'next';
import { Suspense } from 'react';

import VerifyEmailComponent from '@/components/verifyEmail/VerifyEmail';

export const metadata: Metadata = {
  title: 'Verify Email Address | TaskFlow Account Activation',
  description:
    'Confirm your email address to complete your TaskFlow account registration and activate your workspace.',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz/verify-email',
  },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  );
}
