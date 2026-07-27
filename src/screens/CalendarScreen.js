import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { todosAPI } from '../api/client';
import {
  getCurrentJalaliMonth, getAdjacentJalaliMonth, generateJalaliCalendar,
  daysInJalaliMonth, getTodayJalali, formatJalali, isoToJalali,
  TICKET_STATUS_LABELS,
} from '../utils/helpers';

const MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const DAY_NAMES = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']; // Sat to Fri

export default function CalendarScreen({ navigation }) {
  const { year: initialYear, month: initialMonth } = getCurrentJalaliMonth();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // month | week

  const weeks = generateJalaliCalendar(year, month);
  const today = getTodayJalali();

  const loadTodos = async (date) => {
    setLoading(true);
    try {
      const isoDate = date; // needs conversion if needed
      const res = await todosAPI.list({ 
        date: undefined, // fetch all, filter client-side
        year, month,
      });
      setTodos(res.data?.data || []);
    } catch (e) {
      console.log('Error loading todos:', e);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTodos(); }, [year, month]);

  const navigateMonth = (delta) => {
    const adj = getAdjacentJalaliMonth(year, month, delta);
    setYear(adj.year);
    setMonth(adj.month);
    setSelectedDay(null);
  };

  const goToToday = () => {
    const { year: y, month: m } = getCurrentJalaliMonth();
    setYear(y);
    setMonth(m);
    setSelectedDay(null);
  };

  const getTodosForDay = (dayStr) => {
    if (!dayStr) return { count: 0, completed: 0 };
    const matched = todos.filter(t => {
      const todoDate = isoToJalali(t.start_at);
      return todoDate === dayStr;
    });
    return {
      count: matched.length,
      completed: matched.filter(t => t.is_completed).length,
    };
  };

  const selectedTodos = selectedDay ? getTodosForDay(selectedDay) : null;

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹ ماه قبل</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>{MONTH_NAMES[month - 1]} {year}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
          <Text style={styles.navBtnText}>ماه بعد ›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={styles.dayHeaders}>
        {DAY_NAMES.map((d, i) => (
          <View key={i} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, i === 6 && { color: '#ef4444' }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <ScrollView style={styles.calendarContainer}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (!day) {
                return <View key={`empty-${di}`} style={styles.dayCell} />;
              }

              const isToday = day.isToday;
              const isSelected = selectedDay === day.dayStr;
              const dayTodos = getTodosForDay(day.dayStr);

              return (
                <TouchableOpacity
                  key={day.day}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => setSelectedDay(day.dayStr === selectedDay ? null : day.dayStr)}
                >
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    isSelected && styles.selectedText,
                    di === 6 && { color: '#ef4444' },
                  ]}>
                    {day.day}
                  </Text>
                  {dayTodos.count > 0 && (
                    <View style={styles.dotRow}>
                      <View style={[
                        styles.dot,
                        dayTodos.completed === dayTodos.count && dayTodos.count > 0
                          ? styles.dotCompleted
                          : styles.dotPending,
                      ]} />
                      {dayTodos.count > 1 && (
                        <Text style={styles.dotCount}>{dayTodos.count}</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Selected day details */}
      {selectedDay && (
        <View style={styles.detailPanel}>
          <Text style={styles.detailTitle}>📅 {selectedDay}</Text>
          <Text style={styles.detailSubtitle}>
            {getTodosForDay(selectedDay).count} تسک — 
            {getTodosForDay(selectedDay).completed} تکمیل شده
          </Text>
          <TouchableOpacity
            style={styles.addTodoBtn}
            onPress={() => navigation.navigate('TodosTab')}
          >
            <Text style={styles.addTodoBtnText}>مشاهده تسک‌ها ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Summary strip */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {todos.filter(t => !t.is_completed).length} تسک در انتظار
        </Text>
        <Text style={styles.summaryText}>
           از {daysInJalaliMonth(year, month)} روز
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, paddingBottom: 4,
  },
  navBtn: { padding: 8 },
  navBtnText: { color: '#7c3aed', fontSize: 15, fontWeight: '600' },
  todayBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1e293b', borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  todayBtnText: { color: '#f1f5f9', fontSize: 16, fontWeight: 'bold' },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: 4, marginTop: 8, marginBottom: 4 },
  dayHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  dayHeaderText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  calendarContainer: { flex: 1, paddingHorizontal: 2 },
  weekRow: { flexDirection: 'row', marginBottom: 2 },
  dayCell: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, margin: 1, minHeight: 48,
  },
  todayCell: { backgroundColor: '#7c3aed22', borderWidth: 1, borderColor: '#7c3aed' },
  selectedCell: { backgroundColor: '#7c3aed44', borderWidth: 1.5, borderColor: '#7c3aed' },
  dayText: { color: '#f1f5f9', fontSize: 15, fontWeight: '500' },
  todayText: { color: '#7c3aed', fontWeight: 'bold' },
  selectedText: { color: '#fff', fontWeight: 'bold' },
  dotRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 1 },
  dotPending: { backgroundColor: '#f59e0b' },
  dotCompleted: { backgroundColor: '#10b981' },
  dotCount: { color: '#94a3b8', fontSize: 9, marginLeft: 2 },
  detailPanel: {
    backgroundColor: '#1e293b', margin: 12, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  detailTitle: { color: '#f1f5f9', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  detailSubtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginTop: 4 },
  addTodoBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#7c3aed', alignItems: 'center' },
  addTodoBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  summaryBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    padding: 12, backgroundColor: '#1e293b', borderTopWidth: 0.5, borderTopColor: '#334155',
  },
  summaryText: { color: '#94a3b8', fontSize: 13 },
});