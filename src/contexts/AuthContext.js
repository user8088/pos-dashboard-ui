import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getProfile(token);
          // Handle both possible response formats
          if (userData.success && userData.data && userData.data.user) {
            setUser(userData.data.user);
            setIsAuthenticated(true);
          } else if (userData && userData.user && userData.user.id) {
            // Response format: {user: {...}}
            setUser(userData.user);
            setIsAuthenticated(true);
          } else if (userData && userData.id) {
            // Direct user object response: {...user data}
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Token is invalid, clear it
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      // Check if response has success flag (old format) or direct fields (new format)
      if (response.success && response.data) {
        const { user: userData, token: authToken } = response.data;
        setUser(userData);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', authToken);
        return { success: true, message: response.message };
      } else if (response.user && response.access_token) {
        // New format: {message, user, access_token, token_type}
        setUser(response.user);
        setToken(response.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.access_token);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.message.includes('Invalid credentials')) {
        return { success: false, message: 'Invalid email or password. Please try again.' };
      } else if (error.message.includes('Validation failed')) {
        return { success: false, message: error.message, errors: error.errors };
      } else if (error.message.includes('Server error')) {
        return { success: false, message: 'Server error. Please try again later.' };
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, message: 'Network error. Please check your connection and try again.' };
      } else {
        return { success: false, message: error.message || 'Login failed. Please try again.' };
      }
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success && response.data) {
        const { user: newUser, token: authToken } = response.data;
        setUser(newUser);
        setToken(authToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', authToken);
        return { success: true, message: response.message };
      } else if (response.user && response.access_token) {
        // New format
        setUser(response.user);
        setToken(response.access_token);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.access_token);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.message.includes('email has already been taken')) {
        return { success: false, message: 'This email is already registered. Please use a different email or try logging in.' };
      } else if (error.message.includes('Validation failed')) {
        return { success: false, message: error.message, errors: error.errors };
      } else if (error.message.includes('Server error')) {
        return { success: false, message: 'Server error. Please try again later.' };
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return { success: false, message: 'Network error. Please check your connection and try again.' };
      } else {
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
      }
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData, token);
      if (response.success) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Profile update failed. Please try again.' };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
