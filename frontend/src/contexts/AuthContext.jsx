import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Get user data with token
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Make a request to get the current user's data
      const response = await axios.get('http://localhost:5000/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentUser(response.data.data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error, we'll just use the token
      setCurrentUser({ token });
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/v1/users/signup', userData);
      const { token, data } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(data.user);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to sign up');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/v1/users/login', {
        email,
        password
      });
      const { token, data } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(data.user);
      
      // If there's a pending join redirect, remember that the user just logged in
      const savedRedirect = localStorage.getItem('joinRedirect');
      if (savedRedirect && savedRedirect.includes('/projects/join/')) {
        localStorage.setItem('justLoggedIn', 'true');
      }
      
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to log in');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setLoading(false);
  };
  
  const forgotPassword = async (email) => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/v1/users/forgotPassword', {
        email
      });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token, password, passwordConfirm) => {
    try {
      setError('');
      const response = await axios.patch(
        `http://localhost:5000/api/v1/users/resetPassword/${token}`,
        { password, passwordConfirm }
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    forgotPassword,
    resetPassword,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};