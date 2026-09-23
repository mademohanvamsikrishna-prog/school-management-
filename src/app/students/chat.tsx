/**
 * Student Chat — Conversation list + message thread.
 * Replaces the 3-line PlaceholderScreen.
 * Same implementation pattern as teacher/chat.tsx and parents/chat.tsx.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  getMyConversations, getMessages, sendMessage,
  Conversation, ChatMessage,
} from '../../services/chat';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#4F46E5', indigoBg: '#EEF2FF',
  messageSelf: '#4F46E5', messageOther: '#F1F5F9',
};

function timeStr(dt: string) {
  try {
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export default function StudentChatScreen() {
  const { user } = useAuth();
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const { data: conversations, loading: convsLoading } = useApi(getMyConversations);

  const loadMessages = useCallback(async (convId: string) => {
    setMsgLoading(true);
    try { setMessages(await getMessages(convId)); }
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedConv) loadMessages(selectedConv.id);
  }, [selectedConv, loadMessages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;
    setSending(true);
    try {
      await sendMessage(selectedConv.id, text.trim());
      setText('');
      loadMessages(selectedConv.id);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } finally { setSending(false); }
  };

  // ── Conversation list ──────────────────────────────────────────────────────
  if (!selectedConv) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
        <View style={s.header}>
          <Text style={s.breadcrumb}>STUDENT / CHAT</Text>
          <Text style={s.title}>Messages</Text>
        </View>

        {convsLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={P.indigo} />
          </View>
        ) : (
          <FlatList
            data={conversations ?? []}
            keyExtractor={c => c.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 52 }}>💬</Text>
                <Text style={s.emptyTitle}>No Conversations Yet</Text>
                <Text style={s.emptySub}>Your conversations with teachers will appear here.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={s.convCard} onPress={() => setSelectedConv(item)} activeOpacity={0.8}>
                <View style={s.convAvatar}>
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>
                    {(item.title ?? 'C')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.convTitle}>{item.title ?? 'Conversation'}</Text>
                  <Text style={s.convSub}>{item.participant_count} participant{item.participant_count !== 1 ? 's' : ''}</Text>
                </View>
                <Text style={{ color: P.textMuted, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // ── Message thread ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => { setSelectedConv(null); setMessages([]); }}>
          <Text style={{ color: P.indigo, fontWeight: '700', fontSize: 15 }}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={s.convHeaderTitle} numberOfLines={1}>{selectedConv.title ?? 'Chat'}</Text>
        <View style={{ width: 60 }} />
      </View>

      {msgLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={P.indigo} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            onContentSizeChange={() => flatRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={s.empty}>
                <Text style={{ fontSize: 40 }}>💬</Text>
                <Text style={s.emptySub}>No messages yet. Say hello!</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMine = item.sender_id === user?.id;
              return (
                <View style={[s.msgWrap, isMine ? s.msgRight : s.msgLeft]}>
                  {!isMine && <Text style={s.senderName}>{item.sender_name}</Text>}
                  <View style={[s.bubble, isMine ? s.bubbleSelf : s.bubbleOther]}>
                    <Text style={[s.bubbleText, isMine && { color: '#FFF' }]}>{item.content}</Text>
                  </View>
                  <Text style={s.msgTime}>{timeStr(item.created_at)}</Text>
                </View>
              );
            }}
          />

          {/* Input bar */}
          <View style={s.inputBar}>
            <TextInput
              style={s.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={P.textMuted}
              multiline
              maxLength={1000}
              onSubmitEditing={Platform.OS === 'web' ? handleSend : undefined}
            />
            <TouchableOpacity style={[s.sendBtn, !text.trim() && { opacity: 0.4 }]} onPress={handleSend} disabled={!text.trim() || sending}>
              {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.sendIcon}>➤</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: P.card, borderBottomWidth: 1, borderBottomColor: P.border, gap: 12 },
  breadcrumb: { fontSize: 10, fontWeight: '700', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '800', color: P.text },
  backBtn: { paddingHorizontal: 4, paddingVertical: 4 },
  convHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: P.text, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: P.text },
  emptySub: { fontSize: 13, color: P.textSec, textAlign: 'center', paddingHorizontal: 30 },
  convCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: P.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: P.border, shadowColor: '#0F172A', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, elevation: 1 },
  convAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: P.indigo, justifyContent: 'center', alignItems: 'center' },
  convTitle: { fontSize: 15, fontWeight: '700', color: P.text, marginBottom: 2 },
  convSub: { fontSize: 12, color: P.textSec },
  msgWrap: { gap: 3 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  senderName: { fontSize: 11, fontWeight: '600', color: P.textSec, marginLeft: 4, marginBottom: 2 },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleSelf: { backgroundColor: P.indigo, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: P.messageOther, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: P.text, lineHeight: 20 },
  msgTime: { fontSize: 10, color: P.textMuted, marginHorizontal: 6 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, backgroundColor: P.card, borderTopWidth: 1, borderTopColor: P.border },
  input: { flex: 1, borderWidth: 1, borderColor: P.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: P.text, backgroundColor: P.bg, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: P.indigo, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
