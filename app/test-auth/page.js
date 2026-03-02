'use client';

import { useEffect, useState } from 'react';

export default function TestAuth() {
  const [status, setStatus] = useState('Checking...');
  const [user, setUser] = useState(null);
  const [cookies, setCookies] = useState('');

  useEffect(() => {
    setCookies(document.cookie);
    
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setStatus('Not authenticated');
        } else {
          setStatus('Authenticated');
          setUser(data);
        }
      })
      .catch(() => setStatus('Error'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Auth Test</h1>
        
        <div className="space-y-4">
          <div><strong>Status:</strong> {status}</div>
          <div><strong>Cookies:</strong> {cookies || 'None'}</div>
          
          {user && (
            <div className="bg-green-50 p-4 rounded-lg">
              <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}
          
          <div className="pt-4 space-x-4">
            <a href="/login" className="px-4 py-2 bg-gray-200 rounded">Login</a>
            <a href="/user" className="px-4 py-2 bg-blue-600 text-white rounded">Dashboard</a>
          </div>
        </div>
      </div>
    </div>
  );
}
