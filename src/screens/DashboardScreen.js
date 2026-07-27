import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { unitsAPI, ticketsAPI, todosAPI, hardwareAPI } from '../api/client';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    units: 0, tickets: 0, openTickets: 0, completedTickets: 0,
    todos: 0, pendingTodos: 0, completedTodos: 0,
    hardware: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [unitsRes, ticketsRes, todosRes, hardwareRes] = await Promise.all([
        unitsAPI.list(1),
        ticketsAPI.list({}),
        todosAPI.list({}),
        hardwareAPI.list({}).catch(() => ({ data: { data: [], meta: { total: 0 } } })),
      ]);

      const tickets = ticketsRes.data.data || [];
      const todos = todosRes.data.data || [];
      const hardwareItems = hardwareRes.data.data || [];

      setStats({
        units: unitsRes.data.meta?.total || unitsRes.data.data?.length || 0,
        tickets: ticketsRes.data.meta?.total || tickets.length,
        openTickets: tickets.filter(t => ['created', 'forwarded', 'accepted'].includes(t.status)).length,
        completedTickets: tickets.filter(t => t.status === 'completed').length,
        todos: todosRes.data.meta?.total || todos.length,
        pendingTodos: todos.filter(t => !t.is_completed).length,
        completedTodos: todos.filter(t => t.is_completed).length,
        hardware: hardwareRes.data.meta?.total || hardwareItems.length,
      });
    } catch (e) {
      console.log('خطا در بارگذاری آمار:', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* هدر */}
      <View style={styles.header}>
        <Text style={styles.greeting}>سلام {user?.name || 'کاربر'} 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('fa-IR')}</Text>
      </View>

      {/* آمار کلی */}
      <Text style={styles.sectionTitle}>📊 آمار کلی</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="🏢" title="واحدها" value={stats.units} color="#7c3aed" onPress={() => navigation.navigate('UnitsTab')} />
        <StatCard icon="📋" title="تیکت‌ها" value={stats.tickets} color="#f59e0b" onPress={() => navigation.navigate('TicketsTab')} />
        <StatCard icon="✅" title="تسک‌ها" value={stats.todos} color="#10b981" onPress={() => navigation.navigate('TodosTab')} />
        <StatCard icon="🖥️" title="سخت‌افزار" value={stats.hardware} color="#0ea5e9" onPress={() => navigation.navigate('HardwareTab')} />
      </View>

      {/* آمار تیکت‌ها */}
      <Text style={styles.sectionTitle}>📋 وضعیت تیکت‌ها</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="🔴" title="باز" value={stats.openTickets} color="#ef4444" />
        <StatCard icon="🟢" title="تکمیل شده" value={stats.completedTickets} color="#10b981" />
      </View>

      {/* آمار تسک‌ها */}
      <Text style={styles.sectionTitle}>✅ وضعیت تسک‌ها</Text>
      <View style={styles.statsGrid}>
        <StatCard icon="⏳" title="در انتظار" value={stats.pendingTodos} color="#f59e0b" />
        <StatCard icon="✅" title="انجام شده" value={stats.completedTodos} color="#10b981" />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingTop: 10 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', textAlign: 'right' },
  date: { fontSize: 14, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#e2e8f0', paddingHorizontal: 20, marginTop: 20, marginBottom: 12, textAlign: 'right' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  statCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1e293b', borderRadius: 12, padding: 16,
    borderLeftWidth: 4, minWidth: '47%', flex: 1,
  },
  statIcon: { fontSize: 28, marginRight: 12 },
  statInfo: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', textAlign: 'right' },
  statTitle: { fontSize: 13, color: '#94a3b8', textAlign: 'right' },
});
