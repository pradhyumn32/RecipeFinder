import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './../AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      
      if (error) {
        setError(error);
        navigate('/login', { state: { error: `OAuth failed: ${error}` } });
        return;
      }

      if (!token) {
        setError('No token provided');
        navigate('/login', { state: { error: 'Authentication failed: No token provided' } });
        return;
      }

      try {
        const result = await handleOAuthCallback(token);
        if (result?.success) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { 
            state: { error: result?.message || 'Authentication failed' } 
          });
        }
      } catch (err) {
        console.error('OAuth processing error:', err);
        navigate('/login', { 
          state: { error: 'Failed to process authentication' } 
        });
      }
    };

    processOAuth();
  }, [searchParams, handleOAuthCallback, navigate]);

  if (error) {
    return <div>Error: {error}. Redirecting to login...</div>;
  }

  return <div>Processing login...</div>;
};

export default OAuthCallback;