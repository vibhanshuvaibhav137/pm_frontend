import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add authentication state

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login for:', email);
      const response = await AuthService.login(email, password);
      
      if (response.success) {
        console.log('Login successful');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        console.log('Login failed:', response.message);
        setError(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error in context:', error);
      const errorMessage = error.response?.data?.message || 'Server error. Please try again later.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state even if API call fails
      setCurrentUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  const updateUser = (userData) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: currentUser?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};