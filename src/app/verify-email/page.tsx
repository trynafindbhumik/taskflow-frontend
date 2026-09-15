import { Suspense } from 'react';

import VerifyEmailComponent from '@/components/verifyEmail/VerifyEmail';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailComponent />
    </Suspense>
  );
}
