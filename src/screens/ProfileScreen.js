import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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
});
