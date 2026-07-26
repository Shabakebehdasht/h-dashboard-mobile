import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { ticketsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params;
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTicket(); }, [ticketId]);

  const loadTicket = async () => {
    try {
      const res = await ticketsAPI.get(ticketId);
      setTicket(res.data.data);
    } catch (e) {
      Alert.alert('خطا', 'تیکت یافت نشد');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'accept') await ticketsAPI.accept(ticketId);
      else if (action === 'complete') await ticketsAPI.complete(ticketId);
      await loadTicket();
    } catch (e) {
      Alert.alert('خطا', e.response?.data?.message || 'عملیات انجام نشد');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#7c3aed" style={{ flex: 1, backgroundColor: '#0f172a' }} />;
  if (!ticket) return null;

  const statusColors = {
    created: '#3b82f6', forwarded: '#f59e0b', accepted: '#8b5cf6', completed: '#10b981',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.code}>{ticket.ticket_code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[ticket.status] + '22' }]}>
          <Text style={[styles.statusText, { color: statusColors[ticket.status] }]}>{ticket.status}</Text>
        </View>
      </View>

      <Text style={styles.subject}>{ticket.subject}</Text>
      <Text style={styles.content}>{ticket.content}</Text>

      <View style={styles.infoCard}>
        <InfoRow label="واحد" value={ticket.unit?.name || '-'} />
        <InfoRow label="اولویت" value={ticket.priority === 'urgent' ? '🔴 فوری' : ticket.priority === 'normal' ? '🔵 عادی' : '⚪ کم'} />
        <InfoRow label="ایجاد کننده" value={ticket.user?.n_code || '-'} />
        <InfoRow label="محول شده به" value={ticket.assignee?.n_code || '-'} />
        <InfoRow label="تاریخ ایجاد" value={new Date(ticket.created_at).toLocaleDateString('fa-IR')} />
        {ticket.completed_at && <InfoRow label="تاریخ تکمیل" value={new Date(ticket.completed_at).toLocaleDateString('fa-IR')} />}
      </View>

      {/* دکمه‌های عملیاتی */}
      {ticket.status !== 'completed' && (
        <View style={styles.actions}>
          {ticket.status === 'created' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]} onPress={() => handleAction('accept')}>
              <Text style={styles.actionText}>✅ پذیرش</Text>
            </TouchableOpacity>
          )}
          {ticket.status === 'accepted' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => handleAction('complete')}>
              <Text style={styles.actionText}>✔️ تکمیل</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* فعالیت‌ها */}
      {ticket.activities?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 فعالیت‌ها</Text>
          {ticket.activities.map((act) => (
            <View key={act.id} style={styles.activityCard}>
              <Text style={styles.activityDesc}>{act.description}</Text>
              <Text style={styles.activityMeta}>
                {act.user?.n_code} • {new Date(act.created_at).toLocaleDateString('fa-IR')}
              </Text>
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
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  code: { color: '#94a3b8', fontFamily: 'monospace', fontSize: 14 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: 'bold', fontSize: 13 },
  subject: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginBottom: 12 },
  content: { color: '#cbd5e1', fontSize: 15, textAlign: 'right', lineHeight: 24, marginBottom: 20 },
  infoCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  infoLabel: { color: '#94a3b8', fontSize: 14 },
  infoValue: { color: '#f1f5f9', fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#e2e8f0', fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' },
  activityCard: { backgroundColor: '#1e293b', borderRadius: 8, padding: 12, marginBottom: 8 },
  activityDesc: { color: '#cbd5e1', fontSize: 14, textAlign: 'right', marginBottom: 4 },
  activityMeta: { color: '#64748b', fontSize: 12, textAlign: 'right' },
});
