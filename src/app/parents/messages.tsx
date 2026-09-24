import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useParentData, TeacherConversation } from '../../context/ParentDataContext';

export default function MessagesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    selectedChildKey,
    setSelectedChildKey,
    selectedChild,
    childrenProfiles,
    conversations,
    sendTeacherMessage,
    markConversationRead,
    unreadMessagesCount,
  } = useParentData();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Set default active conversation on desktop
  useEffect(() => {
    if (conversations.length > 0) {
      if (!activeConvId || !conversations.some((c) => c.id === activeConvId)) {
        if (isDesktop) {
          setActiveConvId(conversations[0].id);
          if (conversations[0].unread) {
            markConversationRead(conversations[0].id);
          }
        }
      }
    }
  }, [conversations, activeConvId, isDesktop]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  const handleSelectConv = (conv: TeacherConversation) => {
    setActiveConvId(conv.id);
    if (conv.unread) {
      markConversationRead(conv.id);
    }
  };

  const handleSend = () => {
    if (!replyText.trim() || !activeConv) return;
    sendTeacherMessage(activeConv.id, replyText);
    setReplyText('');
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ─── Top Header & Child Switcher ─────────────────────────────────── */}
        <View style={styles.topHeader}>
          <View>
            <View style={styles.titleRow}>
              <TouchableOpacity onPress={() => router.push('/parents/dashboard' as any)} style={styles.backBtn}>
                <Text style={styles.backBtnText}>← Dashboard</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Teacher Messages</Text>
            </View>
            <Text style={styles.pageSubtitle}>
              {selectedChild.name} · {selectedChild.className} · Direct Teacher Communication
            </Text>
          </View>

          {/* Child Switcher */}
          <View style={styles.childSwitcher}>
            {childrenProfiles.map((child) => {
              const active = child.key === selectedChildKey;
              return (
                <TouchableOpacity
                  key={child.key}
                  style={[styles.childBtn, active && styles.childBtnActive]}
                  onPress={() => setSelectedChildKey(child.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.childDot, { backgroundColor: child.avatarBg }]} />
                  <Text style={[styles.childBtnText, active && styles.childBtnTextActive]}>
                    {child.name} ({child.className.replace('Class ', '')})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Unread Notice ──────────────────────────────────────────────── */}
        {unreadMessagesCount > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={styles.unreadBannerText}>
              💬 You have <Text style={{ fontWeight: '800' }}>{unreadMessagesCount} unread</Text> {unreadMessagesCount === 1 ? 'message thread' : 'message threads'}.
            </Text>
          </View>
        )}

        {/* ─── Messaging Master-Detail Workspace ───────────────────────────── */}
        <View style={styles.chatWorkspace}>
          {/* Conversation List Column (Hidden on mobile if a conversation is open) */}
          {(!activeConv || isDesktop) && (
            <View style={[styles.convListPanel, isDesktop && styles.convListPanelDesktop]}>
              <View style={styles.panelHeader}>
                <Text style={styles.panelTitle}>Conversations</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{conversations.length}</Text>
                </View>
              </View>

              <ScrollView style={styles.convScroll} showsVerticalScrollIndicator={false}>
                {conversations.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <TouchableOpacity
                      key={conv.id}
                      style={[
                        styles.convItem,
                        isSelected && styles.convItemActive,
                        conv.unread && styles.convItemUnread,
                      ]}
                      onPress={() => handleSelectConv(conv)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.avatarBox, { backgroundColor: conv.avatarColor }]}>
                        <Text style={styles.avatarText}>{conv.teacherAvatar}</Text>
                      </View>

                      <View style={styles.convMeta}>
                        <View style={styles.convTopRow}>
                          <Text style={[styles.teacherName, conv.unread && styles.teacherNameUnread]}>
                            {conv.teacherName}
                          </Text>
                          <Text style={styles.timeAgoText}>{conv.timeAgo}</Text>
                        </View>

                        <Text style={styles.teacherRoleText}>{conv.teacherRole}</Text>
                        <Text style={styles.lastMsgSnippet} numberOfLines={1}>
                          {lastMsg ? lastMsg.content : 'No messages yet'}
                        </Text>
                      </View>

                      {conv.unread && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Conversation Thread / Chat Area */}
          {activeConv ? (
            <KeyboardAvoidingView
              style={[styles.threadPanel, isDesktop && styles.threadPanelDesktop]}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              {/* Thread Header */}
              <View style={styles.threadHeader}>
                {!isDesktop && (
                  <TouchableOpacity onPress={() => setActiveConvId(null)} style={styles.mobileBackBtn}>
                    <Text style={styles.mobileBackBtnText}>← All</Text>
                  </TouchableOpacity>
                )}
                <View style={[styles.threadAvatar, { backgroundColor: activeConv.avatarColor }]}>
                  <Text style={styles.avatarText}>{activeConv.teacherAvatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.threadTeacherName}>{activeConv.teacherName}</Text>
                  <Text style={styles.threadTeacherRole}>{activeConv.teacherRole}</Text>
                </View>
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Active</Text>
                </View>
              </View>

              {/* Message Bubbles */}
              <ScrollView
                ref={scrollRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.daySeparator}>
                  <Text style={styles.daySeparatorText}>Conversation with {activeConv.teacherName}</Text>
                </View>

                {activeConv.messages.map((msg) => {
                  const isParent = msg.sender === 'parent';
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.bubbleWrapper,
                        isParent ? styles.bubbleWrapperParent : styles.bubbleWrapperTeacher,
                      ]}
                    >
                      <View
                        style={[
                          styles.messageBubble,
                          isParent ? styles.bubbleParent : styles.bubbleTeacher,
                        ]}
                      >
                        {!isParent && <Text style={styles.bubbleSender}>{msg.senderName}</Text>}
                        <Text style={[styles.bubbleContent, isParent && styles.bubbleContentParent]}>
                          {msg.content}
                        </Text>
                        <Text style={[styles.bubbleTime, isParent && styles.bubbleTimeParent]}>
                          {msg.timestamp}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Input Area */}
              <View style={styles.inputArea}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Type your message..."
                  placeholderTextColor="#94A3B8"
                  value={replyText}
                  onChangeText={setReplyText}
                  onSubmitEditing={handleSend}
                  multiline={false}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!replyText.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <View style={[styles.emptyThreadPanel, isDesktop && styles.threadPanelDesktop]}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>💬</Text>
              <Text style={styles.emptyThreadTitle}>Select a teacher conversation</Text>
              <Text style={styles.emptyThreadSub}>
                Choose a teacher from the list to view previous messages and send updates.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  topHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EEF2FF',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  childSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  childBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  childBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  childDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  childBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  childBtnTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  unreadBanner: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  unreadBannerText: {
    fontSize: 13,
    color: '#3730A3',
    fontWeight: '500',
  },
  chatWorkspace: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  convListPanel: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  convListPanelDesktop: {
    width: 320,
    maxWidth: 340,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  convScroll: {
    flex: 1,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  convItemActive: {
    backgroundColor: '#EFF6FF',
  },
  convItemUnread: {
    backgroundColor: '#F8FAFF',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  convMeta: {
    flex: 1,
  },
  convTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  teacherNameUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  timeAgoText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  teacherRoleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  lastMsgSnippet: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
  },
  threadPanel: {
    flex: 2,
    backgroundColor: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
  },
  threadPanelDesktop: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  mobileBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 4,
  },
  mobileBackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  threadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  threadTeacherName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  threadTeacherRole: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
  },
  onlineText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
    gap: 12,
  },
  daySeparator: {
    alignItems: 'center',
    marginVertical: 6,
  },
  daySeparatorText: {
    fontSize: 11,
    color: '#94A3B8',
    backgroundColor: '#EDF2F7',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: '600',
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  bubbleWrapperTeacher: {
    justifyContent: 'flex-start',
  },
  bubbleWrapperParent: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleTeacher: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  bubbleParent: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  bubbleSender: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 3,
  },
  bubbleContent: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 18,
  },
  bubbleContentParent: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeParent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyThreadPanel: {
    flex: 2,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyThreadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyThreadSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 280,
  },
});
