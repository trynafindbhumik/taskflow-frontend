import { Suspense } from 'react';

import LoginComponent from '@/components/login/Login';

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginComponent />
    </Suspense>
  );
}
