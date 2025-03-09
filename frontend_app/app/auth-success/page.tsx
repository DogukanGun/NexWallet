'use client';

import { useEffect } from 'react';

const AuthSuccess = () => {
  useEffect(() => {
    window.opener.postMessage({ type: 'AUTH_SUCCESS' }, process.env.NEXT_PUBLIC_BACKEND_URL);

    // Event listener for messages from the backend
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_BACKEND_URL) return;
      // Handle the callback from the backend
      console.log('Received message from backend:', event.data);
    };

    window.addEventListener('message', handleMessage);

    // Close the popup
    window.close();

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div>
      <h1>Authentication Successful</h1>
      <p>You can close this window.</p>
    </div>
  );
};

export default AuthSuccess; 