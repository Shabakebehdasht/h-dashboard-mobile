import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { todosAPI, unitsAPI } from '../api/client';

export default function CreateTodoScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [unitId, setUnitId] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    unitsAPI.list(1).then(res => setUnits(res.data.data || [])).catch(console.log);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('خطا', 'عنوان را پر کنید');
      return;
    }
    setLoading(true);
    try {
      await todosAPI.create({ title, unit_id: unitId });
      Alert.alert('✅', 'تسک ایجاد شد');
      navigation.goBack();
    } catch (e) {
      Alert.alert('خطا', e.response?.data?.message || 'ایجاد ناموفق');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✅ تسک جدید</Text>

      <Text style={styles.label}>عنوان</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="عنوان تسک" placeholderTextColor="#64748b" />

      <Text style={styles.label}>واحد (اختیاری)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {units.map(u => (
          <TouchableOpacity key={u.id} style={[styles.unitBtn, unitId === u.id && styles.unitActive]} onPress={() => setUnitId(unitId === u.id ? null : u.id)}>
            <Text style={[styles.unitText, unitId === u.id && styles.unitTextActive]}>{u.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>ایجاد تسک</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 20 },
  label: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', textAlign: 'right', marginBottom: 16, fontSize: 15 },
  unitBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8 },
  unitActive: { backgroundColor: '#7c3aed' },
  unitText: { color: '#94a3b8', fontSize: 13 },
  unitTextActive: { color: '#fff', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#10b981', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
