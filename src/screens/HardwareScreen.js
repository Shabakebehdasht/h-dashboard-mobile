import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { hardwareAPI } from '../api/client';
import HardwareFormModal from './HardwareFormModal';
import { HARDWARE_TYPE_LABELS, NET_TYPE_LABELS, formatJalali, toDateInputValue, getTodayJalali } from '../utils/helpers';

const TYPE_BADGE_STYLE = {
  pc: { bg: '#1e3a5f', color: '#3b82f6' },
  laptop: { bg: '#5f4b1e', color: '#f59e0b' },
  server: { bg: '#5f1e1e', color: '#ef4444' },
};

export default function HardwareScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    search: '', type: '', os: '', cpu: '', ram: '', hdd: '',
    net_type: '', mark: '', person_name: '', person_ncode: '',
    unit_name: '', semat_name: '', sort_field: 'created_at', sort_dir: 'desc',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadList = useCallback(async (pageNum = 1, append = false) => {
    try {
      const params = {
        page: pageNum,
        per_page: 15,
        sort_field: filters.sort_field,
        sort_dir: filters.sort_dir,
      };
      Object.entries(filters).forEach(([key, val]) => {
        if (key !== 'sort_field' && key !== 'sort_dir' && val) params[key] = val;
      });
      const res = await hardwareAPI.list(params);
      const newItems = res.data.data || [];
      if (append) setItems(prev => [...prev, ...newItems]);
      else setItems(newItems);
      setHasMore(pageNum < (res.data.meta?.last_page || 1));
    } catch (e) {
      console.log('Hardware load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => { loadList(1); }, [filters]);

  const onRefresh = () => { setRefreshing(true); setPage(1); loadList(1); };
  const loadMore = () => { if (hasMore && !loading) { setPage(p => p + 1); loadList(page + 1, true); } };

  const handleDelete = async (id) => {
    Alert.alert('حذف', 'آیا از حذف مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try { await hardwareAPI.remove(id); loadList(1); }
        catch (e) { Alert.alert('خطا', 'حذف نشد'); }
      }},
    ]);
  };

  const openCreate = () => { setEditId(null); setModalVisible(true); };
  const openEdit = (id) => { setEditId(id); setModalVisible(true); };

  const HardwareItem = ({ item }) => {
    const typeStyle = TYPE_BADGE_STYLE[item.type] || TYPE_BADGE_STYLE.pc;
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('HardwareDetail', { hardwareId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.name}>{item.pc_name}</Text>
            <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.badgeText, { color: typeStyle.color }]}>{HARDWARE_TYPE_LABELS[item.type] || item.type}</Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>🖥️ {item.os || '-'}</Text>
            <Text style={styles.metaText}>🔌 {NET_TYPE_LABELS[item.net_type] || '-'}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.detailRow}><Text style={styles.detailLabel}>IP:</Text> <Text style={styles.detailValue}>{item.ip_valid || '-'}</Text></Text>
          <Text style={styles.detailRow}><Text style={styles.detailLabel}>CPU:</Text> <Text style={styles.detailValue}>{item.cpu || '-'}</Text></Text>
          <Text style={styles.detailRow}><Text style={styles.detailLabel}>RAM:</Text> <Text style={styles.detailValue}>{item.ram || '-'}</Text></Text>
          <Text style={styles.detailRow}><Text style={styles.detailLabel}>HDD:</Text> <Text style={styles.detailValue}>{item.hdd || '-'}</Text></Text>
          {item.person && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>پرسنل:</Text> <Text style={styles.detailValue}>{item.person.f_name} {item.person.l_name}</Text></Text>
          )}
          {item.clean_at && (
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>پاک‌سازی:</Text> <Text style={styles.detailValue}>{formatJalali(item.clean_at)}</Text></Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => openEdit(item.id)} style={styles.actionBtn}><Text style={styles.actionBtnText}>✏️ ویرایش</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionBtn, styles.deleteBtn]}><Text style={styles.actionBtnText}>🗑️ حذف</Text></TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🖥️ مدیریت سخت‌افزار</Text>
        <TouchableOpacity style={styles.fab} onPress={openCreate}><Text style={styles.fabText}>+</Text></TouchableOpacity>
      </View>

      {/* Filters */}
      <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggleText}>{showFilters ? '▲ مخفی کردن فیلترها' : '▼ فیلترها'}</Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TextInput style={styles.filterInput} placeholder="جستجوی نام، IP، MAC..." value={filters.search} onChangeText={v => setFilters({...filters, search: v})} placeholderTextColor="#666" />
            <TouchableOpacity style={styles.filterSelect} onPress={() => setFilters({...filters, type: ''})}>
              <Text style={styles.filterSelectText}>نوع: {filters.type ? HARDWARE_TYPE_LABELS[filters.type] : 'همه'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            <TextInput style={styles.filterInput} placeholder="OS (مثال: Windows 10)" value={filters.os} onChangeText={v => setFilters({...filters, os: v})} placeholderTextColor="#666" />
            <TextInput style={styles.filterInput} placeholder="CPU" value={filters.cpu} onChangeText={v => setFilters({...filters, cpu: v})} placeholderTextColor="#666" />
          </View>
          <View style={styles.filterRow}>
            <TextInput style={styles.filterInput} placeholder="RAM" value={filters.ram} onChangeText={v => setFilters({...filters, ram: v})} placeholderTextColor="#666" />
            <TextInput style={styles.filterInput} placeholder="HDD/SSD" value={filters.hdd} onChangeText={v => setFilters({...filters, hdd: v})} placeholderTextColor="#666" />
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterSelect} onPress={() => setFilters({...filters, net_type: ''})}>
              <Text style={styles.filterSelectText}>شبکه: {filters.net_type ? NET_TYPE_LABELS[filters.net_type] : 'همه'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterSelect} onPress={() => setFilters({...filters, mark: ''})}>
              <Text style={styles.filterSelectText}>علامت: {filters.mark === 'true' ? '✓ بله' : filters.mark === 'false' ? '✗ خیر' : 'همه'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#7c3aed" style={styles.loading} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <HardwareItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={styles.empty}>🖥️ سخت‌افزاری یافت نشد</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modal */}
      <HardwareFormModal
        visible={modalVisible}
        editId={editId}
        onClose={() => { setModalVisible(false); setEditId(null); }}
        onSaved={() => { setModalVisible(false); setEditId(null); loadList(1); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold' },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  filterToggle: { paddingVertical: 12, alignItems: 'center' },
  filterToggleText: { color: '#7c3aed', fontSize: 14, fontWeight: '600' },
  filtersContainer: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#1e293b', marginHorizontal: 8, borderRadius: 12, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  filterInput: { flex: 1, minWidth: 150, backgroundColor: '#0f172a', borderRadius: 10, padding: 12, fontSize: 14, color: '#f1f5f9', borderWidth: 1, borderColor: '#334155', textAlign: 'right' },
  filterSelect: { flex: 1, minWidth: 150, backgroundColor: '#0f172a', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#334155' },
  filterSelectText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 60, fontSize: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginHorizontal: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { gap: 8 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#f1f5f9', fontSize: 17, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardMeta: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metaText: { color: '#94a3b8', fontSize: 12 },
  cardDetails: { marginTop: 10, gap: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { color: '#64748b', fontSize: 13 },
  detailValue: { color: '#cbd5e1', fontSize: 13, fontWeight: '500', textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#334155' },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155' },
  deleteBtn: { backgroundColor: '#7f1d1d', borderColor: '#991b1b' },
  actionBtnText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
});