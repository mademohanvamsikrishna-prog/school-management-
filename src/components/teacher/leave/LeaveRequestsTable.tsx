import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

export interface LeaveRequestRecord {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  daysCount?: number;
  reason: string;
  status: 'Awaiting Review' | 'Approved' | 'Rejected' | 'Cancelled' | string;
  appliedOn: string;
  documentName?: string;
  documentSize?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface LeaveRequestsTableProps {
  requests: LeaveRequestRecord[];
  onViewDetails: (item: LeaveRequestRecord) => void;
  onEditRequest: (item: LeaveRequestRecord) => void;
  onCancelRequest: (item: LeaveRequestRecord) => void;
  onExport: () => void;
}

export const LeaveRequestsTable: React.FC<LeaveRequestsTableProps> = ({
  requests,
  onViewDetails,
  onEditRequest,
  onCancelRequest,
  onExport,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const STATUS_OPTIONS = ['All Status', 'Pending', 'Approved', 'Rejected'];

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Status Filter
      if (statusFilter !== 'All Status') {
        if (statusFilter === 'Pending') {
          if (r.status !== 'Awaiting Review' && r.status !== 'Pending') return false;
        } else if (r.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchType = r.leaveType.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        const matchFrom = r.fromDate.toLowerCase().includes(q);
        const matchTo = r.toDate.toLowerCase().includes(q);
        const matchStatus = r.status.toLowerCase().includes(q);
        const matchApplied = r.appliedOn.toLowerCase().includes(q);
        return matchType || matchReason || matchFrom || matchTo || matchStatus || matchApplied;
      }

      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved')) {
      return {
        bg: '#DCFCE7',
        text: '#15803D',
        border: '#BBF7D0',
        dot: '#22C55E',
      };
    }
    if (s.includes('reject')) {
      return {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: '#FECACA',
        dot: '#EF4444',
      };
    }
    if (s.includes('cancel')) {
      return {
        bg: '#F1F5F9',
        text: '#64748B',
        border: '#E2E8F0',
        dot: '#94A3B8',
      };
    }
    // Awaiting Review / Pending
    return {
      bg: '#FEF3C7',
      text: '#92400E',
      border: '#FDE68A',
      dot: '#F59E0B',
    };
  };

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sick')) return '🩺';
    if (t.includes('casual')) return '🌴';
    if (t.includes('personal')) return '📄';
    if (t.includes('emergency')) return '🚨';
    return '📝';
  };

  return (
    <View style={styles.cardContainer}>
      {/* Table Header & Controls */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Text style={{ fontSize: 20 }}>📋</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>My Leave Requests</Text>
            <Text style={styles.headerSubtitle}>
              View and manage all your leave applications ({filteredRequests.length})
            </Text>
          </View>
        </View>

        {/* Toolbar: Search + Status Dropdown + Export */}
        <View style={styles.toolbar}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search requests..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Chips / Selector */}
          <View style={styles.filterChipsRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.filterChip,
                  statusFilter === opt && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(opt)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === opt && styles.filterChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={onExport}
            activeOpacity={0.8}
          >
            <Text style={styles.exportIcon}>📥</Text>
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Table Content */}
      {Platform.OS === 'web' ? (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                <th style={thStyle}>Leave Type</th>
                <th style={thStyle}>From Date</th>
                <th style={thStyle}>To Date</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Applied On</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#94A3B8' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                    <div style={{ fontWeight: 600, color: '#64748B' }}>No leave applications found</div>
                    <div style={{ fontSize: 12 }}>Try adjusting your search query or filters</div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req, idx) => {
                  const badge = getStatusBadge(req.status);
                  const isMenuOpen = activeMenuId === req.id;
                  const isPending =
                    req.status.toLowerCase().includes('review') ||
                    req.status.toLowerCase().includes('pending');

                  return (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Leave Type */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{getTypeIcon(req.leaveType)}</span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>
                              {req.leaveType}
                            </div>
                            {req.documentName && (
                              <div style={{ fontSize: 11, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 4 }}>
                                📎 {req.documentName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* From Date */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                          {req.fromDate}
                        </span>
                      </td>

                      {/* To Date */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                          {req.toDate}
                        </span>
                      </td>

                      {/* Reason */}
                      <td style={{ ...tdStyle, maxWidth: 220 }}>
                        <div
                          style={{
                            color: '#475569',
                            fontSize: 13,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={req.reason}
                        >
                          {req.reason}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            backgroundColor: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.text,
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: badge.dot,
                            }}
                          />
                          {req.status}
                        </div>
                      </td>

                      {/* Applied On */}
                      <td style={tdStyle}>
                        <span style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                          {req.appliedOn}
                        </span>
                      </td>

                      {/* Actions Menu */}
                      <td style={{ ...tdStyle, textAlign: 'right', position: 'relative' }}>
                        <div style={{ display: 'inline-block', position: 'relative' }}>
                          <button
                            onClick={() => setActiveMenuId(isMenuOpen ? null : req.id)}
                            style={{
                              background: isMenuOpen ? '#EFF6FF' : '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 8,
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: 14,
                              color: '#475569',
                            }}
                          >
                            •••
                          </button>

                          {isMenuOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 34,
                                width: 130,
                                backgroundColor: '#FFFFFF',
                                borderRadius: 10,
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                padding: 4,
                                textAlign: 'left',
                              }}
                            >
                              <div
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onViewDetails(req);
                                }}
                                style={menuItemStyle}
                              >
                                👁️ View Details
                              </div>

                              {isPending && (
                                <>
                                  <div
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onEditRequest(req);
                                    }}
                                    style={menuItemStyle}
                                  >
                                    ✏️ Edit
                                  </div>
                                  <div
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onCancelRequest(req);
                                    }}
                                    style={{ ...menuItemStyle, color: '#EF4444' }}
                                  >
                                    ✕ Cancel
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Native Fallback List */
        <ScrollView style={{ maxHeight: 400 }}>
          {filteredRequests.map((req) => {
            const badge = getStatusBadge(req.status);
            return (
              <View key={req.id} style={styles.nativeCard}>
                <View style={styles.nativeCardHeader}>
                  <Text style={styles.nativeCardTitle}>{req.leaveType}</Text>
                  <View style={[styles.nativeBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.nativeBadgeText, { color: badge.text }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.nativeCardDates}>
                  {req.fromDate} → {req.toDate}
                </Text>
                <Text style={styles.nativeCardReason}>{req.reason}</Text>
                <View style={styles.nativeActionsRow}>
                  <TouchableOpacity
                    style={styles.nativeActionBtn}
                    onPress={() => onViewDetails(req)}
                  >
                    <Text style={styles.nativeActionText}>View Details</Text>
                  </TouchableOpacity>
                  {(req.status.includes('Review') || req.status.includes('Pending')) && (
                    <TouchableOpacity
                      style={[styles.nativeActionBtn, { backgroundColor: '#FEE2E2' }]}
                      onPress={() => onCancelRequest(req)}
                    >
                      <Text style={[styles.nativeActionText, { color: '#EF4444' }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#475569',
  letterSpacing: '0.02em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const menuItemStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'background-color 0.1s ease',
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 8,
    minWidth: 180,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
    minWidth: 120,
  },
  clearIcon: {
    fontSize: 12,
    color: '#94A3B8',
    paddingHorizontal: 4,
  },
  filterChipsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  exportIcon: {
    fontSize: 14,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  nativeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  nativeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nativeCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  nativeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  nativeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  nativeCardDates: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  nativeCardReason: {
    fontSize: 12,
    color: '#64748B',
  },
  nativeActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  nativeActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  nativeActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
