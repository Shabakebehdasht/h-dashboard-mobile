import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { hardwareAPI } from '../api/client';
import { HARDWARE_TYPE_LABELS, NET_TYPE_LABELS, formatJalali } from '../utils/helpers';

const TYPE_BADGE_STYLE = {
  pc: { bg: '#1e3a5f', color: '#3b82f6' },
  laptop: { bg: '#5f4b1e', color: '#f59e0b' },
  server: { bg: '#5f1e1e', color: '#ef4444' },
};

export default function HardwareDetailScreen({ route, navigation }) {
  const { hardwareId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHardware(); }, [hardwareId]);

  const loadHardware = async () => {
    try {
      const res = await hardwareAPI.get(hardwareId);
      setItem(res.data.data);
    } catch (e) {
      Alert.alert('خطا', 'سخت‌افزار یافت نشد');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('حذف', 'آیا از حذف این سخت‌افزار مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await hardwareAPI.remove(hardwareId);
          navigation.goBack();
        } catch (e) {
          Alert.alert('خطا', 'حذف نشد');
        }
      }},
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('HardwareForm', { hardwareId });
  };

  if (loading) return (
    <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, backgroundColor: '#0f172a' }} />
  );
  if (!item) return null;

  const typeStyle = TYPE_BADGE_STYLE[item.type] || TYPE_BADGE_STYLE.pc;

  return (
    <ScrollView style={styles.container}>
      {/* Header with type badge */}
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{item.pc_name}</Text>
          <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
            <Text style={[styles.badgeText, { color: typeStyle.color }]}>
              {HARDWARE_TYPE_LABELS[item.type] || item.type}
            </Text>
          </View>
        </View>
      </View>

      {/* Network Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 اطلاعات شبکه</Text>
        <View style={styles.infoCard}>
          <InfoRow label="IP معتبر" value={item.ip_valid || '-'} />
          <InfoRow label="IP محلی" value={item.ip_local || '-'} />
          <InfoRow label="MAC Address" value={item.mac || '-'} />
          <InfoRow label="نوع شبکه" value={NET_TYPE_LABELS[item.net_type] || item.net_type || '-'} />
          {item.switch && <InfoRow label="سوئیچ" value={item.switch} />}
          {item.port && <InfoRow label="پورت" value={item.port} />}
          {item.vlan && <InfoRow label="VLAN" value={item.vlan} />}
        </View>
      </View>

      {/* System Specs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💻 مشخصات سیستم</Text>
        <View style={styles.infoCard}>
          <InfoRow label="سیستم عامل" value={item.os || '-'} />
          <InfoRow label="مادربورد" value={item.motherboard || '-'} />
          <InfoRow label="پردازنده" value={item.cpu || '-'} />
          <InfoRow label="RAM" value={item.ram || '-'} />
          <InfoRow label="هارد/SSD" value={item.hdd || '-'} />
        </View>
      </View>

      {/* Personnel & Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 پرسنل و وضعیت</Text>
        <View style={styles.infoCard}>
          {item.person && (
            <InfoRow label="پرسنل" value={`${item.person.f_name} ${item.person.l_name}`} />
          )}
          {item.person && item.person.n_code && (
            <InfoRow label="کد پرسنلی" value={item.person.n_code} />
          )}
          {item.unit && (
            <InfoRow label="واحد" value={item.unit.name} />
          )}
          <InfoRow label="علامت‌دار" value={item.mark ? '✅ بله' : '❌ خیر'} />
          {item.clean_at && (
            <InfoRow label="آخرین پاک‌سازی" value={formatJalali(item.clean_at)} />
          )}
          <InfoRow label="تاریخ ثبت" value={formatJalali(item.created_at)} />
          {item.updated_at && item.updated_at !== item.created_at && (
            <InfoRow label="آخرین بروزرسانی" value={formatJalali(item.updated_at)} />
          )}
        </View>
      </View>

      {/* Comments */}
      {item.comments && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 توضیحات</Text>
          <View style={styles.infoCard}>
            <Text style={styles.commentsText}>{item.comments}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0ea5e9' }]} onPress={handleEdit}>
          <Text style={styles.actionText}>✏️ ویرایش</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={handleDelete}>
          <Text style={styles.actionText}>🗑️ حذف</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { marginBottom: 20 },
  name: { color: '#f1f5f9', fontSize: 24, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  infoCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  infoLabel: { color: '#94a3b8', fontSize: 14 },
  infoValue: { color: '#f1f5f9', fontSize: 14, fontWeight: '500', textAlign: 'right', maxWidth: '65%' },
  commentsText: { color: '#cbd5e1', fontSize: 14, textAlign: 'right', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  actionBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});