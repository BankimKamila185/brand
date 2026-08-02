'use strict';
'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function ForgotPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?mode=forgot');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] font-display uppercase tracking-wider text-sm font-bold text-neutral-600">
      Redirecting to password reset...
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] font-display uppercase tracking-wider text-sm font-bold text-neutral-600">Loading...</div>}>
      <ForgotPasswordRedirect />
    </Suspense>
  );
}
