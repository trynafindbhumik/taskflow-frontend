import { Suspense } from 'react';

import ResetPasswordComponent from '@/components/resetPassword/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordComponent />
    </Suspense>
  );
}
