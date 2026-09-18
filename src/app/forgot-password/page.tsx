import { Suspense } from 'react';

import ForgotPasswordComponent from '@/components/forgotPassword/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <ForgotPasswordComponent />
    </Suspense>
  );
}
