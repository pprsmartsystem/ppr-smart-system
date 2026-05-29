'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import BroadcastBar from '@/components/BroadcastBar';
import MaintenancePopup from '@/components/MaintenancePopup';

export default function MasterDistributorLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.role === 'masterdistributor') {
          setUser(data);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => router.replace('/login'))
      .finally(() => setChecked(true));
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userRole="masterdistributor" userName={user.name} userEmail={user.email} />
      <div className="flex-1 lg:pl-0 min-w-0">
        <BroadcastBar />
        <MaintenancePopup />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
