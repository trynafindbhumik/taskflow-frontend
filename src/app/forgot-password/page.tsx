import { Suspense } from 'react';

import ForgotPasswordComponent from '@/components/forgotPassword/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ForgotPasswordComponent />
    </Suspense>
  );
}
