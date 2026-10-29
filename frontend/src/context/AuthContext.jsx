import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on initial page load / refresh
  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      // If we have a token or an active HttpOnly cookie, verify with backend
      const userData = await api.getMe();
      if (userData && userData.id) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 or network error on restore -> user remains logged out
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (usernameOrEmail, password, rememberMe = false) => {
    setAuthError(null);
    try {
      const response = await api.login({
        username_or_email: usernameOrEmail,
        password,
        remember_me: rememberMe
      });
      if (response && response.user) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Invalid login response format.');
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await api.register(userData);
      return response;
    } catch (err) {
      let message = 'Registration failed.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          message = err.response.data.detail.map(d => d.msg).join(', ');
        } else {
          message = err.response.data.detail;
        }
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('access_token');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await api.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to update profile.';
      throw new Error(message);
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword
      });
      return res;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to change password.';
      throw new Error(message);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.forgotPassword(email);
      return res;
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to request password reset.';
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      if (userData && userData.id) {
        setUser(userData);
      }
    } catch (err) {
      console.warn('User refresh failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
