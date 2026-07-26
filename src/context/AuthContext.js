import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // بررسی توکن ذخیره شده هنگام شروع
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('خطا در بارگذاری اطلاعات ورود:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (n_code, password) => {
    try {
      const response = await authAPI.login(n_code, password);
      const newToken = response.data.token;

      // دریافت اطلاعات کاربر
      const userResponse = await authAPI.getUser({
        headers: { Authorization: `Bearer ${newToken}` },
      });

      await AsyncStorage.setItem('auth_token', newToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userResponse.data));

      setToken(newToken);
      setUser(userResponse.data);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در ورود';
      return { success: false, message };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth باید داخل AuthProvider استفاده شود');
  }
  return context;
}
