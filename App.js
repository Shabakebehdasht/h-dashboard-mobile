import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import ApiConfigScreen from './src/screens/ApiConfigScreen';
import { ActivityIndicator, View } from 'react-native';

function AppContent() {
  const { user, loading, apiConfigured, setApiConfigured } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // اول بار: اگه API تنظیم نشده، صفحه تنظیمات سرور رو نشون بده
  if (!apiConfigured) {
    return <ApiConfigScreen onConfigured={() => setApiConfigured(true)} />;
  }

  // بعد: اگه کاربر لاگین نکرده، صفحه ورود
  return user ? <AppNavigator /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <AppContent />
    </AuthProvider>
  );
}