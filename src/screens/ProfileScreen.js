import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [savingUrl, setSavingUrl] = useState(false);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    const saved = await getApiBaseUrl();
    setApiUrl(saved || '');
  };

  const handleSaveUrl = async () => {
    if (!apiUrl.trim()) {
      Alert.alert('خطا', 'لطفاً آدرس را وارد کنید');
      return;
    }

    setSavingUrl(true);
    try {
      // اطمینان از /api
      let finalUrl = apiUrl.trim();
      if (!finalUrl.endsWith('/api')) {
        // اول /api رو حذف کن بعد اضافه کن تا دوبار اضافه نشه
        finalUrl = finalUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api';
      }
      await setApiBaseUrl(finalUrl);
      setApiUrl(finalUrl);
      Alert.alert('موفق', 'آدرس سرور به‌روزرسانی شد ✓\nبرایت اعمال کامل، لطفاً از حساب خارج و دوباره وارد شوید.');
      setServerModalVisible(false);
    } catch (e) {
      Alert.alert('خطا', 'ذخیره نشد');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('خروج', 'آیا مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* پروفایل */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || '👤'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'کاربر'}</Text>
        <Text style={styles.code}>کد پرسنلی: {user?.n_code || '-'}</Text>
      </View>

      {/* اطلاعات */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 اطلاعات حساب</Text>
        <InfoRow label="ایمیل" value={user?.email || '-'} />
        <InfoRow label="نقش" value={user?.roles?.[0]?.name || '-'} />
        <InfoRow label="وضعیت" value={user?.is_active ? '✅ فعال' : '❌ غیرفعال'} />
      </View>

      {/* تنظیمات */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ تنظیمات</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setServerModalVisible(true)}
        >
          <Text style={styles.menuText}>🖥️ آدرس سرور API</Text>
          <Text style={styles.menuArrow}>{apiUrl ? '✓' : '×'} ›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔔 اعلان‌ها</Text>
          <Text style={styles.menuArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🌙 حالت تاریک</Text>
          <Text style={styles.menuArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🌐 زبان</Text>
          <Text style={styles.menuArrow}>فارسی ›</Text>
        </TouchableOpacity>
      </View>

      {/* درباره */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ درباره</Text>
        <InfoRow label="نسخه" value="1.0.0" />
        <InfoRow label="پلتفرم" value="React Native + Expo" />
      </View>

      {/* دکمه خروج */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 خروج از حساب</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Modal تغییر آدرس سرور */}
      <Modal
        visible={serverModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setServerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🖥️ آدرس سرور API</Text>
            <Text style={styles.modalSubtitle}>
              آدرس پایه سرور را وارد کنید (بدون /api)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://192.168.1.100:8000"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={styles.modalHelper}>
              آدرس فعلی: {apiUrl || 'تنظیم نشده'}
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setServerModalVisible(false)}
                disabled={savingUrl}
              >
                <Text style={styles.modalCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn, savingUrl && styles.buttonDisabled]}
                onPress={handleSaveUrl}
                disabled={savingUrl}
              >
                {savingUrl ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>ذخیره</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 24, paddingTop: 10 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  name: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold' },
  code: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: '#f1f5f9', fontSize: 14, fontWeight: '500' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  menuText: { color: '#cbd5e1', fontSize: 15 },
  menuArrow: { color: '#7c3aed', fontSize: 16 },
  logoutBtn: { backgroundColor: '#7f1d1d', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  logoutText: { color: '#fca5a5', fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    textAlign: 'right',
    marginBottom: 12,
  },
  modalHelper: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#334155',
  },
  modalCancelText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#7c3aed',
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
