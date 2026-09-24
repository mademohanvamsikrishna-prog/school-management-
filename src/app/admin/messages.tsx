import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,
  TextInput, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';

const P = {
  bg: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSec: '#64748B', textMuted: '#94A3B8',
  indigo: '#2563EB', indigoBg: '#EFF6FF',
  green: '#10B981', greenBg: '#ECFDF5',
  amber: '#F59E0B', amberBg: '#FFFBEB',
  red: '#EF4444', redBg: '#FEF2F2',
  purple: '#8B5CF6', purpleBg: '#F5F3FF',
};

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'teacher' | 'parent' | 'staff';
  avatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  role: 'teacher' | 'parent' | 'staff';
  designationOrChild: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  online: boolean;
  avatarColor: string;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Dr. Ramesh Sharma',
    role: 'teacher',
    designationOrChild: 'Senior Physics Teacher · Grade 11-12',
    lastMessage: 'I have uploaded the term exam marks for Class 11-A.',
    lastTimestamp: '10:45 AM',
    unreadCount: 1,
    online: true,
    avatarColor: '#2563EB',
    messages: [
      {
        id: 'm-1',
        senderId: 'teacher-1',
        senderName: 'Dr. Ramesh Sharma',
        senderRole: 'teacher',
        text: 'Respected Principal Sir, good morning.',
        timestamp: '10:30 AM',
        isMe: false,
      },
      {
        id: 'm-2',
        senderId: 'admin-1',
        senderName: 'Principal Office',
        senderRole: 'admin',
        text: 'Good morning Dr. Sharma. Has the Physics lab schedule for next week been finalized?',
        timestamp: '10:35 AM',
        isMe: true,
      },
      {
        id: 'm-3',
        senderId: 'teacher-1',
        senderName: 'Dr. Ramesh Sharma',
        senderRole: 'teacher',
        text: 'Yes Sir. Also I have uploaded the term exam marks for Class 11-A for your review.',
        timestamp: '10:45 AM',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Mrs. Priya Verma',
    role: 'parent',
    designationOrChild: 'Parent of Aarav Verma (Class 10-A)',
    lastMessage: 'Thank you for arranging the remedial mathematics sessions.',
    lastTimestamp: '09:15 AM',
    unreadCount: 0,
    online: false,
    avatarColor: '#10B981',
    messages: [
      {
        id: 'm-21',
        senderId: 'parent-1',
        senderName: 'Mrs. Priya Verma',
        senderRole: 'parent',
        text: 'Sir, we received the attendance report for Aarav. Thank you for arranging the remedial mathematics sessions.',
        timestamp: '09:15 AM',
        isMe: false,
      },
      {
        id: 'm-22',
        senderId: 'admin-1',
        senderName: 'Principal Office',
        senderRole: 'admin',
        text: 'You are welcome Mrs. Verma. The faculty is tracking his progress closely.',
        timestamp: '09:20 AM',
        isMe: true,
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Mr. Suresh Menon',
    role: 'staff',
    designationOrChild: 'Transport Coordinator · Campus Logistics',
    lastMessage: 'All 14 school buses completed morning routes on time.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    online: true,
    avatarColor: '#F59E0B',
    messages: [
      {
        id: 'm-31',
        senderId: 'staff-1',
        senderName: 'Mr. Suresh Menon',
        senderRole: 'staff',
        text: 'Sir, Route 7 bus maintenance is finished. All 14 school buses completed morning routes on time.',
        timestamp: 'Yesterday',
        isMe: false,
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'Ms. Sunita Rao',
    role: 'teacher',
    designationOrChild: 'English Faculty · Class 9 Coordinator',
    lastMessage: 'Submitted the draft for the Annual Debate Competition.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    online: false,
    avatarColor: '#8B5CF6',
    messages: [
      {
        id: 'm-41',
        senderId: 'teacher-2',
        senderName: 'Ms. Sunita Rao',
        senderRole: 'teacher',
        text: 'Good afternoon Sir. Submitted the draft for the Annual Debate Competition rules.',
        timestamp: 'Yesterday',
        isMe: false,
      },
    ],
  },
];

export default function AdminMessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'parent' | 'staff'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMsg, setInputMsg] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];

  const handleSend = () => {
    if (!inputMsg.trim() || !activeConv) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'admin-me',
      senderName: 'Principal Office',
      senderRole: 'admin',
      text: inputMsg.trim(),
      timestamp: 'Just now',
      isMe: true,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: newMsg.text,
            lastTimestamp: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );
    setInputMsg('');
  };

  const filteredConversations = conversations.filter(c => {
    const matchesRole = filterRole === 'all' || c.role === filterRole;
    const matchesSearch = searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.designationOrChild.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Top Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>COMMUNICATION / MESSAGES</Text>
          <Text style={s.title}>Messages & Communication Portal</Text>
        </View>
      </View>

      {/* Main Split Layout */}
      <View style={s.splitLayout}>
        {/* Left: Chat List Panel */}
        <View style={s.chatListPanel}>
          {/* Filter Chips */}
          <View style={s.filterRow}>
            {(['all', 'teacher', 'parent', 'staff'] as const).map(roleKey => (
              <TouchableOpacity
                key={roleKey}
                style={[s.roleChip, filterRole === roleKey && s.roleChipActive]}
                onPress={() => setFilterRole(roleKey)}
              >
                <Text style={[s.roleChipText, filterRole === roleKey && s.roleChipTextActive]}>
                  {roleKey === 'all' ? 'All' : roleKey.charAt(0).toUpperCase() + roleKey.slice(1) + 's'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search Box */}
          <View style={s.searchBox}>
            <Text style={{ fontSize: 13 }}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={P.textMuted}
            />
          </View>

          {/* List of Contacts */}
          <FlatList
            data={filteredConversations}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 10, gap: 6 }}
            renderItem={({ item }) => {
              const isActive = item.id === activeConvId;
              return (
                <TouchableOpacity
                  style={[s.convItem, isActive && s.convItemActive]}
                  onPress={() => {
                    setActiveConvId(item.id);
                    // Mark read
                    setConversations(prev => prev.map(c => c.id === item.id ? { ...c, unreadCount: 0 } : c));
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[s.avatar, { backgroundColor: item.avatarColor }]}>
                    <Text style={s.avatarText}>
                      {item.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </Text>
                    {item.online && <View style={s.onlineBadge} />}
                  </View>

                  <View style={s.convMeta}>
                    <View style={s.convNameRow}>
                      <Text style={[s.convName, isActive && { color: P.indigo }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={s.convTime}>{item.lastTimestamp}</Text>
                    </View>
                    <Text style={s.convRoleSub} numberOfLines={1}>{item.designationOrChild}</Text>
                    <Text style={[s.convLastMsg, item.unreadCount > 0 && s.convLastMsgUnread]} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                  </View>

                  {item.unreadCount > 0 && (
                    <View style={s.unreadBadge}>
                      <Text style={s.unreadBadgeText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Right: Active Chat View */}
        <View style={s.chatFeedPanel}>
          {activeConv ? (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
            >
              {/* Active Conversation Header */}
              <View style={s.activeHeader}>
                <View style={[s.avatarSmall, { backgroundColor: activeConv.avatarColor }]}>
                  <Text style={s.avatarSmallText}>
                    {activeConv.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.activeName}>{activeConv.name}</Text>
                  <Text style={s.activeStatus}>
                    {activeConv.online ? '🟢 Active Now · ' : '⚪ Offline · '}
                    {activeConv.designationOrChild}
                  </Text>
                </View>
              </View>

              {/* Messages Body */}
              <ScrollView
                style={s.messagesScroll}
                contentContainerStyle={s.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={s.encryptionNotice}>
                  <Text style={s.encryptionText}>🔒 End-to-end official school communication channel</Text>
                </View>

                {activeConv.messages.map(m => (
                  <View
                    key={m.id}
                    style={[s.messageWrapper, m.isMe ? s.myMessageWrapper : s.theirMessageWrapper]}
                  >
                    {!m.isMe && (
                      <Text style={s.messageSender}>{m.senderName}</Text>
                    )}
                    <View style={[s.messageBubble, m.isMe ? s.myBubble : s.theirBubble]}>
                      <Text style={[s.messageText, m.isMe ? s.myMessageText : s.theirMessageText]}>
                        {m.text}
                      </Text>
                      <Text style={[s.messageTimestamp, m.isMe ? s.myTimestamp : s.theirTimestamp]}>
                        {m.timestamp}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Message Composer */}
              <View style={s.composer}>
                <TextInput
                  style={s.composerInput}
                  placeholder={`Write a message to ${activeConv.name}...`}
                  value={inputMsg}
                  onChangeText={setInputMsg}
                  placeholderTextColor={P.textMuted}
                  multiline
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  style={[s.sendBtn, !inputMsg.trim() && s.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!inputMsg.trim()}
                >
                  <Text style={s.sendBtnText}>Send ➔</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={s.noChatSelected}>
              <Text style={{ fontSize: 44 }}>💬</Text>
              <Text style={s.noChatText}>Select a conversation to start chatting</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: P.card,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  breadcrumb: {
    fontSize: 10,
    fontWeight: '700',
    color: P.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: P.text,
  },
  splitLayout: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
  },
  chatListPanel: {
    width: Platform.OS === 'web' ? 340 : '100%',
    backgroundColor: P.card,
    borderRightWidth: 1,
    borderRightColor: P.border,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: P.bg,
  },
  roleChipActive: {
    backgroundColor: P.indigoBg,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: P.textSec,
  },
  roleChipTextActive: {
    color: P.indigo,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: P.border,
    marginHorizontal: 10,
    marginVertical: 8,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: P.text,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  convItemActive: {
    backgroundColor: P.indigoBg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
  onlineBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: P.green,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  convMeta: {
    flex: 1,
  },
  convNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convName: {
    fontSize: 13,
    fontWeight: '700',
    color: P.text,
    flex: 1,
  },
  convTime: {
    fontSize: 10,
    color: P.textMuted,
  },
  convRoleSub: {
    fontSize: 10.5,
    color: P.textMuted,
    marginTop: 1,
    marginBottom: 2,
  },
  convLastMsg: {
    fontSize: 11.5,
    color: P.textSec,
  },
  convLastMsgUnread: {
    color: P.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: P.indigo,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  // Chat Feed Panel
  chatFeedPanel: {
    flex: 1,
    backgroundColor: P.bg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: P.card,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  activeName: {
    fontSize: 14,
    fontWeight: '800',
    color: P.text,
  },
  activeStatus: {
    fontSize: 11,
    color: P.textMuted,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    gap: 14,
  },
  encryptionNotice: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  encryptionText: {
    fontSize: 11,
    color: P.textMuted,
    fontWeight: '500',
  },
  messageWrapper: {
    maxWidth: '75%',
  },
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageSender: {
    fontSize: 10.5,
    fontWeight: '600',
    color: P.textMuted,
    marginBottom: 3,
    marginLeft: 6,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: P.indigo,
    borderColor: P.indigo,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: P.card,
    borderColor: P.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: P.text,
  },
  messageTimestamp: {
    fontSize: 9.5,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimestamp: {
    color: P.textMuted,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: P.card,
    borderTopWidth: 1,
    borderTopColor: P.border,
  },
  composerInput: {
    flex: 1,
    backgroundColor: P.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: P.text,
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: P.indigo,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendBtnDisabled: {
    backgroundColor: P.textMuted,
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  noChatSelected: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noChatText: {
    color: P.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
