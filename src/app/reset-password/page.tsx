import { Suspense } from 'react';

import ResetPasswordComponent from '@/components/resetPassword/ResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
