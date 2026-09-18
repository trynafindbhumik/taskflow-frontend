import { Suspense } from 'react';

import VerifyEmailComponent from '@/components/verifyEmail/VerifyEmail';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  );
}
