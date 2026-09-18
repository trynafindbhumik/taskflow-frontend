import type { Metadata } from 'next';
import { Suspense } from 'react';

import ResetPasswordComponent from '@/components/resetPassword/ResetPassword';

export const metadata: Metadata = {
  title: 'Set New Password | TaskFlow Security',
  description:
    'Securely choose a new password for your TaskFlow account to manage your team projects.',
  alternates: {
    canonical: 'https://taskflow.trynafindbhumik.xyz/reset-password',
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
