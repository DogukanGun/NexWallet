'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const AuthSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Try to get user data from query parameters
    const userParam = searchParams?.get('user');

    if (userParam) {
      try {
        // Parse the JSON user data from the URL parameter
        const user = JSON.parse(decodeURIComponent(userParam));
        setUserData(user);

        if (!user){
          return
        }
        // Store user data in localStorage and sessionStorage with a timestamp
        const authData = {
          user: user,
          timestamp: new Date().getTime(),
          authenticated: true
        };

        localStorage.setItem('authData', JSON.stringify(authData));
        sessionStorage.setItem('userData', JSON.stringify(user));
        sessionStorage.setItem('isAuthenticated', 'true');

        console.log('Saved auth data to localStorage and sessionStorage:', authData);

        // Try to send message to parent window as a backup method
        if (window.opener) {
          try {
            window.opener.postMessage({
              type: 'AUTH_SUCCESS',
              user: user
            }, '*');
            console.log('Also sent user data to parent window as backup');
          } catch (err) {
            console.error('Error sending message to parent window:', err);
          }
        }

        setLoading(false);
      } catch (err) {
        setError(`Error parsing user data: ${err instanceof Error ? err.message : String(err)}`);
        console.error('Error parsing user data:', err);
        setLoading(false);
      }
    } else {
      // Fall back to API call if no query parameters exist
      //fetchUserData();
    }

    // Close the popup after a short delay
    setTimeout(() => {
      if (window.opener) {
        console.log('Closing auth window after successful authentication');
        window.close();
      }
    }, 2000);
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Authentication Successful</h1>

        {loading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading user information...</p>
          </div>
        ) : error ? (
          <div className="py-4">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-green-500 text-xl mb-2">✅</div>
            <p className="text-gray-700 dark:text-gray-200">Welcome, <span className="font-semibold">{userData?.name || 'User'}</span>!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">You are now logged in.</p>
          </div>
        )}

        <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">This window will close automatically in a moment...</p>
      </div>
    </div>
  );
};

export default AuthSuccess; 