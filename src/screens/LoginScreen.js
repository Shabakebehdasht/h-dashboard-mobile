import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [nCode, setNCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!nCode.trim() || !password.trim()) {
      Alert.alert('خطا', 'لطفاً کد پرسنلی و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    const result = await login(nCode.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('خطا در ورود', result.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* لوگو */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏥</Text>
          <Text style={styles.title}>داشبورد سلامت</Text>
          <Text style={styles.subtitle}>ورود به سیستم</Text>
        </View>

        {/* فرم ورود */}
        <View style={styles.form}>
          <Text style={styles.label}>کد پرسنلی</Text>
          <TextInput
            style={styles.input}
            value={nCode}
            onChangeText={setNCode}
            placeholder="کد پرسنلی خود را وارد کنید"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            autoFocus
          />

          <Text style={styles.label}>رمز عبور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="رمز عبور"
            placeholderTextColor="#999"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ورود</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f0abfc',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 4,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
