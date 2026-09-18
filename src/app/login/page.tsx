import { Suspense } from 'react';

import LoginComponent from '@/components/login/Login';

export default function Login() {
  return (
    <Suspense fallback={<div className="page-loading-fallback">Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
