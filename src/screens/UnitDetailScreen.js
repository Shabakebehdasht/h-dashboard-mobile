import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { unitsAPI } from '../api/client';

export default function UnitDetailScreen({ route }) {
  const { unitId } = route.params;
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    try {
      const res = await unitsAPI.get(unitId);
      setUnit(res.data.data);
    } catch (e) {
      Alert.alert('خطا', 'واحد یافت نشد');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, backgroundColor: '#0f172a' }} />;
  if (!unit) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>🏢</Text>
        <Text style={styles.name}>{unit.name}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="نوع واحد" value={unit.unit_type?.name || '-'} />
        <InfoRow label="منطقه" value={unit.region?.name || '-'} />
        <InfoRow label="واحد والد" value={unit.parent?.name || '-'} />
        <InfoRow label="عرض جغرافیایی" value={unit.lat || '-'} />
        <InfoRow label="طول جغرافیایی" value={unit.lng || '-'} />
        <InfoRow label="وضعیت" value={unit.is_active ? '✅ فعال' : '❌ غیرفعال'} />
        <InfoRow label="دریافت تیکت" value={unit.can_receive_tickets ? '✅ بله' : '❌ خیر'} />
      </View>

      {unit.children?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📁 زیرمجموعه‌ها</Text>
          {unit.children.map(child => (
            <View key={child.id} style={styles.childItem}>
              <Text style={styles.childName}>{child.name}</Text>
            </View>
          ))}
        </View>
      )}

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
  header: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 48, marginBottom: 8 },
  name: { color: '#f1f5f9', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  label: { color: '#94a3b8', fontSize: 14 },
  value: { color: '#f1f5f9', fontSize: 14, fontWeight: '500' },
  sectionTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  childItem: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  childName: { color: '#cbd5e1', fontSize: 14, textAlign: 'right' },
});
