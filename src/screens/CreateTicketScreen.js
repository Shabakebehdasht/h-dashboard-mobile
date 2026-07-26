import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { ticketsAPI, unitsAPI } from '../api/client';

export default function CreateTicketScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [unitId, setUnitId] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const res = await unitsAPI.list(1);
      setUnits(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      Alert.alert('خطا', 'موضوع و محتوا را پر کنید');
      return;
    }
    if (!unitId) {
      Alert.alert('خطا', 'واحد را انتخاب کنید');
      return;
    }

    setLoading(true);
    try {
      await ticketsAPI.create({ subject, content, priority, unit_id: unitId });
      Alert.alert('✅', 'تیکت با موفقیت ایجاد شد');
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطا', e.response?.data?.message || 'ایجاد تیکت ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'urgent', label: '🔴 فوری' },
    { value: 'normal', label: '🔵 عادی' },
    { value: 'low', label: '⚪ کم' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📝 تیکت جدید</Text>

      <Text style={styles.label}>موضوع</Text>
      <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="موضوع تیکت" placeholderTextColor="#64748b" />

      <Text style={styles.label}>محتوا</Text>
      <TextInput style={[styles.input, styles.textArea]} value={content} onChangeText={setContent} placeholder="توضیحات..." placeholderTextColor="#64748b" multiline numberOfLines={4} />

      <Text style={styles.label}>اولویت</Text>
      <View style={styles.priorityRow}>
        {priorities.map(p => (
          <TouchableOpacity key={p.value} style={[styles.priorityBtn, priority === p.value && styles.priorityActive]} onPress={() => setPriority(p.value)}>
            <Text style={[styles.priorityText, priority === p.value && styles.priorityTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>واحد</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
        {units.map(u => (
          <TouchableOpacity key={u.id} style={[styles.unitBtn, unitId === u.id && styles.unitActive]} onPress={() => setUnitId(u.id)}>
            <Text style={[styles.unitText, unitId === u.id && styles.unitTextActive]}>{u.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>ارسال تیکت</Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 20 },
  label: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', textAlign: 'right', marginBottom: 16, fontSize: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  priorityBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center' },
  priorityActive: { backgroundColor: '#7c3aed' },
  priorityText: { color: '#94a3b8', fontSize: 14 },
  priorityTextActive: { color: '#fff', fontWeight: 'bold' },
  unitScroll: { marginBottom: 16 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8 },
  unitActive: { backgroundColor: '#7c3aed' },
  unitText: { color: '#94a3b8', fontSize: 13 },
  unitTextActive: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
