import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { hardwareAPI } from '../api/client';
import { HARDWARE_TYPE_LABELS, NET_TYPE_LABELS, formatJalali } from '../utils/helpers';

export default function HardwareDetailScreen({ route, navigation }) {
  const { hardwareId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [hardwareId]);

  const load = async () => {
    try {
      const res = await hardwareAPI.get(hardwareId);
      setItem(res.data.data);
    } catch (e) { Alert.alert('خطا', 'بارگذاری نشد'); navigation.goBack(); }
    finally { setLoading(false); }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator size="large" color="#7c3aed" /></View>;
  if (!item) return null;

  const Row = ({ label, value }) => (
    <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '-'}</Text></View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.pc_name}</Text>
        <Text style={styles.badge}>{HARDWARE_TYPE_LABELS[item.type] || item.type}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🖥️ مشخصات سیستم</Text>
        <Row label="سیستم عامل" value={item.os} />
        <Row label="CPU" value={item.cpu} />
        <Row label="RAM" value={item.ram} />
        <Row label="HDD" value={item.hdd} />
        <Row label="مادربورد" value={item.motherboard} />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌐 شبکه</Text>
        <Row label="IP معتبر" value={item.ip_valid} />
        <Row label="IP محلی" value={item.ip_local} />
        <Row label="MAC" value={item.mac} />
        <Row label="نوع شبکه" value={NET_TYPE_LABELS[item.net_type]} />
        <Row label="سوئیچ" value={item.switch} />
        <Row label="پورت" value={item.port} />
        <Row label="VLAN" value={item.vlan} />
      </View>
      {item.person && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>👤 پرسنل</Text>
          <Row label="نام" value={`${item.person.f_name} ${item.person.l_name}`} />
          <Row label="کد ملی" value={item.person.n_code} />
        </View>
      )}
      {item.clean_at && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🧹 پاک‌سازی</Text>
          <Row label="تاریخ" value={formatJalali(item.clean_at)} />
        </View>
      )}
      {item.comments && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 توضیحات</Text>
          <Text style={styles.comments}>{item.comments}</Text>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  name: { color: '#f1f5f9', fontSize: 24, fontWeight: 'bold' },
  badge: { color: '#7c3aed', fontSize: 14, fontWeight: '600', marginTop: 4, backgroundColor: '#7c3aed22', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
  card: { backgroundColor: '#1e293b', margin: 12, marginBottom: 0, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#334155' },
  sectionTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: '#f1f5f9', fontSize: 14, fontWeight: '500', textAlign: 'right', maxWidth: '60%' },
  comments: { color: '#cbd5e1', fontSize: 14, lineHeight: 22 },
});
