import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = 'api_base_url';
const DEFAULT_API_URL = 'https://tester-hermes.boxd.sh';

export default function ApiConfigScreen({ onConfigured }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSavedUrl();
  }, []);

  const loadSavedUrl = async () => {
    try {
      const saved = await AsyncStorage.getItem(API_URL_KEY);
      if (saved) { setUrl(saved); }
      else { setUrl(DEFAULT_API_URL); }
    } catch (e) {
      console.log('Error loading API URL:', e);
    }
  };

  const testConnection = async () => {
    if (!url.trim()) {
      Alert.alert('خطا', 'لطفاً آدرس API را وارد کنید');
      return;
    }

    setTesting(true);
    try {
      // تست اتصال با endpoint ساده
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${url.replace(/\/$/, '')}/sanctum/csrf-cookie`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 419 || response.status === 404) {
        // 419 = CSRF token mismatch (یعنی سرور زنده هست)
        // 404 = endpoint پیدا نشد (اما سرور پاسخ داده)
        Alert.alert('موفق', 'اتصال به سرور برقرار شد ✓');
      } else {
        Alert.alert('هشدار', `سرور پاسخ داد اما با کد: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        Alert.alert('خطا', 'زمان اتصال به سرور تمام شد (timeout)');
      } else {
        Alert.alert('خطا در اتصال', error.message);
      }
    } finally {
      setTesting(false);
    }
  };

  const saveAndContinue = async () => {
    if (!url.trim()) {
      Alert.alert('خطا', 'لطفاً آدرس API را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      // اطمینان از اینکه با /api تمام میشه
      let finalUrl = url.trim();
      if (!finalUrl.endsWith('/api')) {
        finalUrl = finalUrl.replace(/\/$/, '') + '/api';
      }

      await AsyncStorage.setItem(API_URL_KEY, finalUrl);
      Alert.alert('ذخیره شد', 'آدرس API با موفقیت تنظیم شد');
      onConfigured(finalUrl);
    } catch (e) {
      Alert.alert('خطا', 'خطا در ذخیره آدرس');
    } finally {
      setLoading(false);
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
          <Text style={styles.logoIcon}>⚙️</Text>
          <Text style={styles.title}>تنظیمات سرور</Text>
          <Text style={styles.subtitle}>آدرس API را وارد کنید</Text>
        </View>

        {/* فرم */}
        <View style={styles.form}>
          <Text style={styles.label}>آدرس سرور API</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="مثال: http://192.168.1.100:8000"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            autoFocus
          />

          <Text style={styles.helperText}>
            آدرس پایه سرور را وارد کنید (بدون /api). برنامه به طور خودکار /api را اضافه می‌کند.
          </Text>

          <TouchableOpacity
            style={[styles.secondaryButton, testing && styles.buttonDisabled]}
            onPress={testConnection}
            disabled={testing || loading}
          >
            {testing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>تست اتصال</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={saveAndContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ذخیره و ادامه</Text>
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
  helperText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#0ea5e9',
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
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});