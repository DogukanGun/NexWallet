import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    // Notify the parent window about the successful authentication
    window.opener.postMessage({ type: 'AUTH_SUCCESS' }, '*');
    // Close the popup
    window.close();
  }, []);

  return (
    <div>
      <h1>Authentication Successful</h1>
      <p>You can close this window.</p>
    </div>
  );
};

export default AuthSuccess; 