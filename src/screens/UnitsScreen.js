import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { unitsAPI } from '../api/client';

export default function UnitsScreen({ navigation }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadUnits = async (pageNum = 1, append = false) => {
    try {
      const res = await unitsAPI.list(pageNum);
      const data = res.data.data || [];
      setUnits(prev => append ? [...prev, ...data] : data);
      setHasMore(pageNum < (res.data.meta?.last_page || 1));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadUnits(1); }, []);

  const UnitItem = ({ item }) => (
    <TouchableOpacity
      style={styles.unitCard}
      onPress={() => navigation.navigate('UnitDetail', { unitId: item.id })}
    >
      <View style={styles.unitHeader}>
        <Text style={styles.unitName}>{item.name}</Text>
        <Text style={styles.unitIcon}>🏢</Text>
      </View>
      {item.unit_type?.name && (
        <Text style={styles.unitType}>{item.unit_type.name}</Text>
      )}
      {item.region?.name && (
        <Text style={styles.unitRegion}>📍 {item.region.name}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#7c3aed" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={units}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <UnitItem item={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUnits(1); }} />}
          onEndReached={() => {
            if (hasMore && !loading) {
              const next = page + 1;
              setPage(next);
              loadUnits(next, true);
            }
          }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={styles.empty}>🏢 واحدی یافت نشد</Text>}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  unitCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  unitName: { color: '#f1f5f9', fontSize: 17, fontWeight: 'bold', textAlign: 'right', flex: 1 },
  unitIcon: { fontSize: 22, marginLeft: 8 },
  unitType: { color: '#a78bfa', fontSize: 13, textAlign: 'right', marginBottom: 2 },
  unitRegion: { color: '#64748b', fontSize: 12, textAlign: 'right' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 60, fontSize: 16 },
});
