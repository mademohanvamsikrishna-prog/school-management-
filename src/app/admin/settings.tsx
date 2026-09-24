import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
  TextInput, Switch, Alert, Platform, ActivityIndicator,
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

export default function AdminSettingsScreen() {
  // General School Information
  const [schoolName, setSchoolName] = useState('Delhi Public Academy');
  const [affiliationNo, setAffiliationNo] = useState('CBSE/AFF/2026/89410');
  const [schoolEmail, setSchoolEmail] = useState('contact@dpa-edu.in');
  const [schoolPhone, setSchoolPhone] = useState('+91 98765 43210');
  const [schoolAddress, setSchoolAddress] = useState('Plot 42, Institutional Area, Sector 14, New Delhi - 110001');

  // Academic Settings
  const [currentSession, setCurrentSession] = useState('2026-2027');
  const [currentTerm, setCurrentTerm] = useState('Term 1 (Autumn)');
  const [passingPercentage, setPassingPercentage] = useState('40');
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState('5');

  // Notification & System Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsGateways, setSmsGateways] = useState(true);
  const [attendanceDigest, setAttendanceDigest] = useState(true);
  const [autoFeeReminders, setAutoFeeReminders] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('60');

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'academic' | 'notifications' | 'security'>('general');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (Platform.OS === 'web') {
        window.alert('Settings saved successfully!');
      } else {
        Alert.alert('Settings Saved', 'System configurations have been updated successfully.');
      }
    }, 600);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: P.bg }}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.breadcrumb}>SYSTEM / SETTINGS</Text>
          <Text style={s.title}>School & Portal Settings</Text>
        </View>
        <TouchableOpacity style={s.saveTopBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={s.saveTopBtnText}>💾 Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={s.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Navigation Tabs */}
        <View style={s.tabsRow}>
          {[
            { key: 'general', label: 'School Profile', icon: '🏫' },
            { key: 'academic', label: 'Academic Session', icon: '🎓' },
            { key: 'notifications', label: 'Alerts & Delivery', icon: '🔔' },
            { key: 'security', label: 'Security & Access', icon: '🔒' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tabItem, activeTab === tab.key && s.tabItemActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={{ fontSize: 13 }}>{tab.icon}</Text>
              <Text style={[s.tabItemText, activeTab === tab.key && s.tabItemTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section: General School Profile */}
        {activeTab === 'general' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>🏫 Institute Identity & Contact</Text>
              <Text style={s.cardSubtitle}>Basic institution parameters printed on report cards and invoices</Text>
            </View>

            <View style={s.formGrid}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>School / College Name *</Text>
                <TextInput
                  style={s.input}
                  value={schoolName}
                  onChangeText={setSchoolName}
                  placeholderTextColor={P.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Affiliation / Board Code</Text>
                <TextInput
                  style={s.input}
                  value={affiliationNo}
                  onChangeText={setAffiliationNo}
                  placeholderTextColor={P.textMuted}
                />
              </View>
            </View>

            <View style={s.formGrid}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Official Administrative Email *</Text>
                <TextInput
                  style={s.input}
                  value={schoolEmail}
                  onChangeText={setSchoolEmail}
                  keyboardType="email-address"
                  placeholderTextColor={P.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Office Contact Number</Text>
                <TextInput
                  style={s.input}
                  value={schoolPhone}
                  onChangeText={setSchoolPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor={P.textMuted}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={s.label}>Campus Address</Text>
              <TextInput
                style={[s.input, { height: 60, textAlignVertical: 'top' }]}
                value={schoolAddress}
                onChangeText={setSchoolAddress}
                multiline
                placeholderTextColor={P.textMuted}
              />
            </View>
          </View>
        )}

        {/* Section: Academic Session */}
        {activeTab === 'academic' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>🎓 Academic Structure & Grading</Text>
              <Text style={s.cardSubtitle}>Configure active academic calendar parameters and evaluation norms</Text>
            </View>

            <View style={s.formGrid}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Active Academic Year</Text>
                <TextInput
                  style={s.input}
                  value={currentSession}
                  onChangeText={setCurrentSession}
                  placeholderTextColor={P.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Active Term / Semester</Text>
                <TextInput
                  style={s.input}
                  value={currentTerm}
                  onChangeText={setCurrentTerm}
                  placeholderTextColor={P.textMuted}
                />
              </View>
            </View>

            <View style={s.formGrid}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Minimum Passing Mark Percentage (%)</Text>
                <TextInput
                  style={s.input}
                  value={passingPercentage}
                  onChangeText={setPassingPercentage}
                  keyboardType="numeric"
                  placeholderTextColor={P.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Working Days per Week</Text>
                <TextInput
                  style={s.input}
                  value={workingDaysPerWeek}
                  onChangeText={setWorkingDaysPerWeek}
                  keyboardType="numeric"
                  placeholderTextColor={P.textMuted}
                />
              </View>
            </View>
          </View>
        )}

        {/* Section: Notifications */}
        {activeTab === 'notifications' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>🔔 Notification & Automated Alerts</Text>
              <Text style={s.cardSubtitle}>Automated messaging channels for attendance and fees</Text>
            </View>

            <View style={s.toggleItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleTitle}>Email Broadcasts & Receipts</Text>
                <Text style={s.toggleSub}>Send automated fee receipts and grade reports to registered parent emails</Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{ false: '#CBD5E1', true: P.indigo }}
              />
            </View>

            <View style={s.divider} />

            <View style={s.toggleItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleTitle}>SMS Gateway Alerts</Text>
                <Text style={s.toggleSub}>Dispatch SMS notifications for urgent campus announcements and emergency alerts</Text>
              </View>
              <Switch
                value={smsGateways}
                onValueChange={setSmsGateways}
                trackColor={{ false: '#CBD5E1', true: P.indigo }}
              />
            </View>

            <View style={s.divider} />

            <View style={s.toggleItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleTitle}>Daily Absence Alert to Parents</Text>
                <Text style={s.toggleSub}>Automatically trigger notification if student is marked Absent during morning roll call</Text>
              </View>
              <Switch
                value={attendanceDigest}
                onValueChange={setAttendanceDigest}
                trackColor={{ false: '#CBD5E1', true: P.indigo }}
              />
            </View>

            <View style={s.divider} />

            <View style={s.toggleItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleTitle}>Automated Fee Due Reminders</Text>
                <Text style={s.toggleSub}>Send automated reminders 3 days before due date and on overdue invoices</Text>
              </View>
              <Switch
                value={autoFeeReminders}
                onValueChange={setAutoFeeReminders}
                trackColor={{ false: '#CBD5E1', true: P.indigo }}
              />
            </View>
          </View>
        )}

        {/* Section: Security */}
        {activeTab === 'security' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardTitle}>🔒 Security & Session Access</Text>
              <Text style={s.cardSubtitle}>Security rules, session lifespans, and multi-factor authentication</Text>
            </View>

            <View style={s.toggleItem}>
              <View style={{ flex: 1 }}>
                <Text style={s.toggleTitle}>Enforce Two-Factor Authentication (2FA)</Text>
                <Text style={s.toggleSub}>Require OTP verification for all Principal and Admin account logins</Text>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={setTwoFactorAuth}
                trackColor={{ false: '#CBD5E1', true: P.indigo }}
              />
            </View>

            <View style={s.divider} />

            <View style={{ marginTop: 12 }}>
              <Text style={s.label}>Portal Session Inactivity Timeout (Minutes)</Text>
              <TextInput
                style={[s.input, { width: 140 }]}
                value={sessionTimeoutMins}
                onChangeText={setSessionTimeoutMins}
                keyboardType="numeric"
                placeholderTextColor={P.textMuted}
              />
            </View>
          </View>
        )}

        {/* Save Bar Footer */}
        <View style={s.footerBar}>
          <TouchableOpacity style={s.saveBtnBig} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={s.saveBtnBigText}>Save Portal Configuration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  saveTopBtn: {
    backgroundColor: P.indigo,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  saveTopBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  contentScroll: {
    padding: 20,
    gap: 16,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: P.card,
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: P.border,
    gap: 6,
    flexWrap: 'wrap',
  },
  tabItem: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: P.indigoBg,
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: P.textSec,
  },
  tabItemTextActive: {
    color: P.indigo,
    fontWeight: '700',
  },
  card: {
    backgroundColor: P.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: P.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: P.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: P.textSec,
  },
  formGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: P.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: P.text,
    backgroundColor: P.bg,
  },
  divider: {
    height: 1,
    backgroundColor: P.border,
    marginVertical: 14,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: P.text,
    marginBottom: 2,
  },
  toggleSub: {
    fontSize: 11.5,
    color: P.textSec,
  },
  footerBar: {
    marginTop: 10,
    marginBottom: 30,
  },
  saveBtnBig: {
    backgroundColor: P.indigo,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: P.indigo,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnBigText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
