import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import {
  getMyConversations, getMessages, sendMessage,
  Conversation, ChatMessage,
} from '../../services/chat';
import { EmptyState } from '../../components/EmptyState';

export default function ChatScreen() {
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
    try {
      const msgs = await getMessages(convId);
      setMessages(msgs);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv.id);
    }
  }, [selectedConv, loadMessages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedConv) return;
    setSending(true);
    try {
      const msg = await sendMessage(selectedConv.id, text.trim());
      setMessages(prev => [...prev, msg]);
      setText('');
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      console.error('Send failed:', e.message);
    } finally {
      setSending(false);
    }
  };

  if (selectedConv) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader title={selectedConv.title || 'Chat'} showBack />
        <TouchableOpacity onPress={() => setSelectedConv(null)} style={styles.backBar}>
          <Text style={styles.backBarText}>← Back to conversations</Text>
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {msgLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />
          ) : (
            <FlatList
              ref={flatRef}
              data={messages}
              keyExtractor={m => m.id}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={<EmptyState title="No messages yet" description="Be the first to say hello!" icon="💬" />}
              renderItem={({ item }) => {
                const isMe = item.sender_id === user?.id;
                return (
                  <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    {!isMe && <Text style={styles.senderName}>{item.sender_name}</Text>}
                    <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>{item.content}</Text>
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                );
              }}
            />
          )}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Messages" />
      {convsLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.center} />
      ) : (
        <FlatList
          data={conversations || []}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No conversations"
              description="You don't have any conversations yet."
              icon="💬"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convCard} onPress={() => setSelectedConv(item)}>
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{item.title?.[0] || '?'}</Text>
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convTitle}>{item.title || (item.type === 'direct' ? 'Direct Message' : 'Group')}</Text>
                <Text style={styles.convSubtitle}>{item.participant_count} participants · {item.type}</Text>
              </View>
              <Text style={styles.convArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' as const },
  backBar: {
    backgroundColor: COLORS.card, paddingHorizontal: SIZES.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBarText: { color: COLORS.primary, fontSize: 14 },
  listContent: { padding: SIZES.md },
  convCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.sm, padding: SIZES.md,
    marginBottom: SIZES.sm, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1,
  },
  convAvatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md,
  },
  convAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  convInfo: { flex: 1 },
  convTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  convSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  convArrow: { fontSize: 22, color: COLORS.textSecondary },
  messageList: { padding: SIZES.md, paddingBottom: SIZES.xl },
  bubble: {
    maxWidth: '80%', padding: SIZES.sm, borderRadius: 12, marginBottom: 8,
  },
  myBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  theirBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  senderName: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  bubbleText: { fontSize: 15, color: COLORS.text },
  myBubbleText: { color: '#fff' },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-end', marginTop: 2 },
  inputBar: {
    flexDirection: 'row', padding: SIZES.sm, backgroundColor: COLORS.card,
    borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: SIZES.md, paddingVertical: 8, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.background, maxHeight: 100, marginRight: SIZES.sm,
  },
  sendBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: SIZES.md, paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
});
