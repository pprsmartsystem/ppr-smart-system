'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function ImpersonateContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId) { window.location.href = '/admin/masterdistributors'; return; }

    fetch(`/api/admin/users/impersonate?userId=${userId}`)
      .then(r => r.json())
      .then(async data => {
        if (!data.success) { alert('Failed: ' + (data.error || 'Unknown error')); window.close(); return; }

        await fetch('/api/admin/users/impersonate/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token }),
        });

        window.location.href = data.redirectUrl;
      })
      .catch(() => { alert('Impersonation failed'); window.close(); });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-gray-700">Loading panel...</p>
        <p className="text-xs text-gray-400">Please wait</p>
      </div>
    </div>
  );
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ImpersonateContent />
    </Suspense>
  );
}
