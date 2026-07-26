import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { ticketsAPI } from '../api/client';

const STATUS_LABELS = {
  created: { text: 'جدید', color: '#3b82f6', bg: '#1e3a5f' },
  forwarded: { text: 'ارجاع شده', color: '#f59e0b', bg: '#5f4b1e' },
  accepted: { text: 'پذیرفته شده', color: '#8b5cf6', bg: '#3b1e5f' },
  completed: { text: 'تکمیل شده', color: '#10b981', bg: '#1e5f3b' },
};

const PRIORITY_LABELS = {
  urgent: { text: 'فوری', color: '#ef4444' },
  normal: { text: 'عادی', color: '#3b82f6' },
  low: { text: 'کم‌اهمیت', color: '#6b7280' },
};

export default function TicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadTickets = useCallback(async (pageNum = 1, append = false) => {
    try {
      const params = { page: pageNum };
      if (filter !== 'all') params.status = filter;

      const response = await ticketsAPI.list(params);
      const newTickets = response.data.data || [];

      if (append) {
        setTickets(prev => [...prev, ...newTickets]);
      } else {
        setTickets(newTickets);
      }
      setHasMore(pageNum < (response.data.meta?.last_page || 1));
    } catch (e) {
      console.log('خطا:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadTickets(1);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadTickets(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTickets(nextPage, true);
    }
  };

  const TicketItem = ({ item }) => {
    const status = STATUS_LABELS[item.status] || STATUS_LABELS.created;
    const priority = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS.normal;

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
      >
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketCode}>{item.ticket_code}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
        <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
        <View style={styles.ticketFooter}>
          <Text style={[styles.priority, { color: priority.color }]}>
            ● {priority.text}
          </Text>
          <Text style={styles.ticketDate}>
            {item.unit?.name || ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === value && styles.filterBtnActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterText, filter === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* فیلترها */}
      <View style={styles.filters}>
        <FilterButton label="همه" value="all" />
        <FilterButton label="جدید" value="created" />
        <FilterButton label="باز" value="forwarded" />
        <FilterButton label="پذیرفته" value="accepted" />
        <FilterButton label="تکمیل" value="completed" />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TicketItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <Text style={styles.empty}>📋 تیکتی یافت نشد</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* دکمه ایجاد تیکت جدید */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  filters: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 6, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b' },
  filterBtnActive: { backgroundColor: '#7c3aed' },
  filterText: { color: '#94a3b8', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  ticketCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginHorizontal: 12, marginBottom: 8 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketCode: { color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  ticketSubject: { color: '#f1f5f9', fontSize: 16, fontWeight: '600', textAlign: 'right', marginBottom: 8 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priority: { fontSize: 13, fontWeight: '600' },
  ticketDate: { color: '#64748b', fontSize: 12 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 60, fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
