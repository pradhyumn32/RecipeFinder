// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('https://recipefinder-af8u.onrender.com/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://recipefinder-af8u.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await fetch('https://recipefinder-af8u.onrender.com/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        navigate('/');
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('https://recipefinder-af8u.onrender.com/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleOAuthCallback = async (token) => {
  try {
    const response = await fetch('https://recipefinder-af8u.onrender.com/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    const errorData = await response.json();
    return { success: false, message: errorData.message || 'Authentication failed' };
  } catch (error) {
    console.error('OAuth callback failed:', error);
    return { success: false, message: 'Network error' };
  }
};

  return (
  <AuthContext.Provider 
    value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout,
      handleOAuthCallback // Add this line
    }}
  >
    {!loading && children}
  </AuthContext.Provider>
);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
