import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { aiChatAPI } from '../api/client';

const QUICK_QUESTIONS = [
  'وضعیت کلی سخت‌افزارها چطور است؟',
  'چند تا لپ‌تاپ داریم؟',
  'سیستم‌هایی با رم بالای ۱۶ گیگ را نمایش بده',
  'آمار کلی سرورها را بده',
  'چه سیستم‌هایی هارد SSD دارند؟',
];

export default function AiChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'سلام! من دستیار هوشمند سخت‌افزار هستم. می‌توانم درباره سخت‌افزارهای ثبت‌شده به شما اطلاعات بدم و به سوالات مرتبط پاسخ بدم.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async (text) => {
    const messageText = text.trim();
    if (!messageText || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChatAPI.send(messageText);
      const data = res.data;
      const reply = data.status === 'ok' && data.response
        ? data.response
        : data.message || 'پاسخی دریافت نشد';

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        text: '⚠️ خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const askQuick = (q) => {
    sendMessage(q);
  };

  const MessageItem = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isUser ? '👤' : '🤖'}</Text>
        </View>
        <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAssistant]}>
          <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAssistant]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 چت هوش مصنوعی سخت‌افزار</Text>
        <Text style={styles.headerSubtitle}>سوالات خود را درباره سخت‌افزارها بپرسید</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageItem item={item} />}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          loading ? (
            <View style={[styles.msgRow, styles.msgRowAssistant]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🤖</Text>
              </View>
              <View style={[styles.msgBubble, styles.msgBubbleAssistant]}>
                <ActivityIndicator size="small" color="#7c3aed" />
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Questions */}
      <View style={styles.quickContainer}>
        <FlatList
          horizontal
          data={QUICK_QUESTIONS}
          keyExtractor={(item, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => askQuick(item)}
              disabled={loading}
            >
              <Text style={styles.quickBtnText} numberOfLines={1}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickList}
        />
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="سوال خود را بپرسید..."
          placeholderTextColor="#64748b"
          textAlign="right"
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>ارسال</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 16, paddingBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  headerTitle: { color: '#f1f5f9', fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
  headerSubtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'right', marginTop: 4 },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAssistant: { justifyContent: 'flex-start' },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 8,
  },
  avatarText: { fontSize: 18 },
  msgBubble: {
    maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10,
  },
  msgBubbleUser: { backgroundColor: '#7c3aed', borderBottomRightRadius: 4 },
  msgBubbleAssistant: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 22 },
  msgTextUser: { color: '#fff' },
  msgTextAssistant: { color: '#e2e8f0' },
  quickContainer: { paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: '#334155' },
  quickList: { paddingHorizontal: 12, gap: 8 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#1e293b',
    borderWidth: 1, borderColor: '#334155',
  },
  quickBtnText: { color: '#94a3b8', fontSize: 12, maxWidth: 160 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 12, borderTopWidth: 0.5, borderTopColor: '#334155',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1, backgroundColor: '#1e293b', borderRadius: 12,
    padding: 12, fontSize: 15, color: '#f1f5f9',
    maxHeight: 100, borderWidth: 1, borderColor: '#334155',
    textAlign: 'right',
  },
  sendBtn: {
    backgroundColor: '#7c3aed', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, marginLeft: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});