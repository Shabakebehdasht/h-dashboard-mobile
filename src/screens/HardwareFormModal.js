import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  TextInput, ScrollView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { hardwareAPI } from '../api/client';
import { maskIP, maskMAC, HARDWARE_TYPE_LABELS, NET_TYPE_LABELS } from '../utils/helpers';

export default function HardwareFormModal({ visible, editId, onClose, onSaved }) {
  const [form, setForm] = useState({
    pc_name: '', type: 'pc', os: '', ip_valid: '', ip_local: '',
    mac: '', net_type: 'wired', switch_t: '', port: '', vlan: '',
    motherboard: '', cpu: '', ram: '', hdd: '', comments: '',
    mark: false, person_id: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (editId) loadHardware();
    else resetForm();
  }, [editId]);

  const resetForm = () => {
    setForm({
      pc_name: '', type: 'pc', os: '', ip_valid: '', ip_local: '',
      mac: '', net_type: 'wired', switch_t: '', port: '', vlan: '',
      motherboard: '', cpu: '', ram: '', hdd: '', comments: '',
      mark: false, person_id: null,
    });
    setError('');
  };

  const loadHardware = async () => {
    try {
      const res = await hardwareAPI.get(editId);
      const item = res.data.data;
      setForm({
        pc_name: item.pc_name || '',
        type: item.type || 'pc',
        os: item.os || '',
        ip_valid: item.ip_valid || '',
        ip_local: item.ip_local || '',
        mac: item.mac || '',
        net_type: item.net_type || 'wired',
        switch_t: item.switch || '',
        port: item.port || '',
        vlan: item.vlan || '',
        motherboard: item.motherboard || '',
        cpu: item.cpu || '',
        ram: item.ram || '',
        hdd: item.hdd || '',
        comments: item.comments || '',
        mark: item.mark || false,
        person_id: item.person_id || null,
      });
    } catch (e) {
      setError('خطا در بارگذاری');
    }
  };

  const updateField = (field, value) => {
    let processed = value;
    if (field === 'ip_valid' || field === 'ip_local') {
      processed = maskIP(value);
    } else if (field === 'mac') {
      processed = maskMAC(value);
    }
    setForm(prev => ({ ...prev, [field]: processed }));
  };

  const handleSubmit = async () => {
    if (!form.pc_name.trim()) {
      Alert.alert('خطا', 'نام سیستم الزامی است');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        switch: form.switch_t,
        person_id: form.person_id || null,
      };
      delete payload.switch_t;
      if (editId) {
        await hardwareAPI.update(editId, payload);
      } else {
        await hardwareAPI.create(payload);
      }
      onSaved();
    } catch (e) {
      setError(e.response?.data?.message || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={styles.modal} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.header}>
            <Text style={styles.title}>{editId ? 'ویرایش سخت‌افزار' : 'سخت‌افزار جدید'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          <Text style={styles.label}>نام سیستم *</Text>
          <TextInput style={styles.input} value={form.pc_name} onChangeText={v => updateField('pc_name', v)} placeholder="مثلاً PC-001" placeholderTextColor="#666" />

          <Text style={styles.label}>نوع</Text>
          <View style={styles.row}>
            {Object.entries(HARDWARE_TYPE_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, form.type === key && styles.typeBtnActive]}
                onPress={() => updateField('type', key)}
              >
                <Text style={[styles.typeBtnText, form.type === key && styles.typeBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>سیستم عامل</Text>
          <TextInput style={styles.input} value={form.os} onChangeText={v => updateField('os', v)} placeholder="مثلاً Windows 10" placeholderTextColor="#666" />

          <Text style={styles.label}>IP معتبر</Text>
          <TextInput style={styles.input} value={form.ip_valid} onChangeText={v => updateField('ip_valid', v)} placeholder="192.168.1.1" keyboardType="numbers-and-punctuation" placeholderTextColor="#666" maxLength={15} />

          <Text style={styles.label}>IP محلی</Text>
          <TextInput style={styles.input} value={form.ip_local} onChangeText={v => updateField('ip_local', v)} placeholder="10.0.0.1" keyboardType="numbers-and-punctuation" placeholderTextColor="#666" maxLength={15} />

          <Text style={styles.label}>MAC Address</Text>
          <TextInput style={styles.input} value={form.mac} onChangeText={v => updateField('mac', v)} placeholder="AA:BB:CC:DD:EE:FF" placeholderTextColor="#666" maxLength={17} />

          <Text style={styles.label}>نوع شبکه</Text>
          <View style={styles.row}>
            {Object.entries(NET_TYPE_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[styles.netBtn, form.net_type === key && styles.netBtnActive]}
                onPress={() => updateField('net_type', key)}
              >
                <Text style={[styles.netBtnText, form.net_type === key && styles.netBtnTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => setShowMore(!showMore)} style={styles.moreToggle}>
            <Text style={styles.moreToggleText}>{showMore ? '▲ بستن جزئیات بیشتر' : '▼ جزئیات بیشتر'}</Text>
          </TouchableOpacity>

          {showMore && (
            <>
              <Text style={styles.label}>سوئیچ</Text>
              <TextInput style={styles.input} value={form.switch_t} onChangeText={v => updateField('switch_t', v)} placeholder='نام سوئیچ' placeholderTextColor="#666" />

              <Text style={styles.label}>پورت</Text>
              <TextInput style={styles.input} value={form.port} onChangeText={v => updateField('port', v)} placeholder='شماره پورت' placeholderTextColor="#666" />

              <Text style={styles.label}>VLAN</Text>
              <TextInput style={styles.input} value={form.vlan} onChangeText={v => updateField('vlan', v)} placeholder='VLAN ID' placeholderTextColor="#666" />

              <Text style={styles.label}>مادربورد</Text>
              <TextInput style={styles.input} value={form.motherboard} onChangeText={v => updateField('motherboard', v)} placeholder='مدل مادربورد' placeholderTextColor="#666" />

              <Text style={styles.label}>پردازنده</Text>
              <TextInput style={styles.input} value={form.cpu} onChangeText={v => updateField('cpu', v)} placeholder='Intel i5' placeholderTextColor="#666" />

              <Text style={styles.label}>RAM</Text>
              <TextInput style={styles.input} value={form.ram} onChangeText={v => updateField('ram', v)} placeholder='۸ گیگ' placeholderTextColor="#666" />

              <Text style={styles.label}>هارد</Text>
              <TextInput style={styles.input} value={form.hdd} onChangeText={v => updateField('hdd', v)} placeholder='SSD 256' placeholderTextColor="#666" />

              <Text style={styles.label}>توضیحات</Text>
              <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]} value={form.comments} onChangeText={v => updateField('comments', v)} placeholder='توضیحات اضافه...' placeholderTextColor="#666" multiline />

              <View style={styles.switchRow}>
                <Text style={styles.label}>علامت‌دار</Text>
                <Switch value={form.mark} onValueChange={v => updateField('mark', v)} trackColor={{ false: '#334155', true: '#7c3aed' }} thumbColor="#fff" />
              </View>
            </>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.saveBtn, saving && styles.disabledBtn]} onPress={handleSubmit} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'بروزرسانی' : 'ایجاد'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>انصراف</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#f1f5f9', fontSize: 20, fontWeight: 'bold' },
  closeBtn: { color: '#94a3b8', fontSize: 24, padding: 4 },
  label: { color: '#cbd5e1', fontSize: 14, marginBottom: 6, marginTop: 12, textAlign: 'right' },
  input: { backgroundColor: '#0f172a', borderRadius: 10, padding: 14, fontSize: 15, color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', textAlign: 'right' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  typeBtnActive: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  typeBtnText: { color: '#94a3b8', fontSize: 14 },
  typeBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  netBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  netBtnActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  netBtnText: { color: '#94a3b8', fontSize: 13 },
  netBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  moreToggle: { marginTop: 16, paddingVertical: 8, alignItems: 'center' },
  moreToggleText: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  error: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 12 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  saveBtn: { flex: 1, backgroundColor: '#7c3aed', borderRadius: 12, padding: 16, alignItems: 'center' },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { flex: 1, backgroundColor: '#334155', borderRadius: 12, padding: 16, alignItems: 'center' },
  cancelBtnText: { color: '#cbd5e1', fontSize: 16 },
});