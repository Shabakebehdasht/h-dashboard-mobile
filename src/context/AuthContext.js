import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, getApiBaseUrl } from '../api/client';

const AuthContext = createContext(null);

const API_URL_KEY = 'api_base_url';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiConfigured, setApiConfigured] = useState(false);

  // بررسی وضعیت اولیه
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // اول چک کن API تنظیم شده یا نه
      const apiUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (!apiUrl) {
        // API پیش‌فرض ست نشده — ولی از اونجایی که client.js از DEFAULT_API_URL استفاده می‌کنه
        // می‌ذاریم بگذره تا username/password وارد کنه
        setApiConfigured(true);
        setLoading(false);
        return;
      }

      setApiConfigured(true);

      // بعد چک کن توکن ذخیره شده
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.log('خطا در بارگذاری:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (n_code, password) => {
    try {
      const response = await authAPI.login(n_code, password);
      const newToken = response.data.token;

      // دریافت اطلاعات کاربر
            const userResponse = await authAPI.getUser();

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
    <AuthContext.Provider
      value={{
        user, token, loading, login, logout,
        apiConfigured, setApiConfigured, initializeApp,
      }}
    >
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