'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import toast from 'react-hot-toast';

export default function DistributorLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== 'distributor') {
            toast.error('Access denied');
            router.push('/login');
            return;
          }
          setUser(userData);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        userRole={user.role}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 lg:ml-0 ml-16">
          {children}
        </div>
      </main>
    </div>
  );
}
