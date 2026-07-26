import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { todosAPI } from '../api/client';

export default function TodosScreen({ navigation }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  const loadTodos = useCallback(async () => {
    try {
      const res = await todosAPI.list({});
      let data = res.data.data || [];
      if (filter === 'pending') data = data.filter(t => !t.is_completed);
      if (filter === 'completed') data = data.filter(t => t.is_completed);
      setTodos(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { loadTodos(); }, [filter]);

  const toggleTodo = async (id) => {
    try {
      await todosAPI.toggleComplete(id);
      setTodos(prev => prev.map(t => t.id === id ? { ...t, is_completed: !t.is_completed } : t));
    } catch (e) {
      Alert.alert('خطا', 'عملیات انجام نشد');
    }
  };

  const deleteTodo = async (id) => {
    Alert.alert('حذف', 'آیا مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        try {
          await todosAPI.delete(id);
          setTodos(prev => prev.filter(t => t.id !== id));
        } catch (e) { console.log(e); }
      }},
    ]);
  };

  const TodoItem = ({ item }) => (
    <View style={styles.todoCard}>
      <TouchableOpacity style={styles.checkBtn} onPress={() => toggleTodo(item.id)}>
        <Text style={[styles.check, item.is_completed && styles.checkDone]}>
          {item.is_completed ? '✅' : '⬜'}
        </Text>
      </TouchableOpacity>
      <View style={styles.todoInfo}>
        <Text style={[styles.todoTitle, item.is_completed && styles.todoDone]}>
          {item.title}
        </Text>
        {item.end_at && (
          <Text style={styles.todoDate}>📅 {new Date(item.end_at).toLocaleDateString('fa-IR')}</Text>
        )}
      </View>
      <TouchableOpacity onPress={() => deleteTodo(item.id)}>
        <Text style={styles.deleteBtn}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* فیلترها */}
      <View style={styles.filters}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'all' && styles.filterActive]} onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>همه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'pending' && styles.filterActive]} onPress={() => setFilter('pending')}>
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>در انتظار</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'completed' && styles.filterActive]} onPress={() => setFilter('completed')}>
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>انجام شده</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TodoItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTodos(); }} />}
          ListEmptyComponent={<Text style={styles.empty}>✅ تسکی یافت نشد</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateTodo')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  filters: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b' },
  filterActive: { backgroundColor: '#7c3aed' },
  filterText: { color: '#94a3b8', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  todoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 14, marginHorizontal: 12, marginBottom: 8 },
  checkBtn: { marginRight: 12 },
  check: { fontSize: 22 },
  checkDone: { opacity: 0.6 },
  todoInfo: { flex: 1 },
  todoTitle: { color: '#f1f5f9', fontSize: 15, fontWeight: '500', textAlign: 'right' },
  todoDone: { textDecorationLine: 'line-through', color: '#64748b' },
  todoDate: { color: '#64748b', fontSize: 12, textAlign: 'right', marginTop: 4 },
  deleteBtn: { fontSize: 18, padding: 4 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 60, fontSize: 16 },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center',
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
