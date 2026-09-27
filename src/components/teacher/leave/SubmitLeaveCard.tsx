import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

export interface LeaveFormPayload {
  leaveType: string;
  leaveTypeId?: string;
  fromDate: string;
  toDate: string;
  reason: string;
  documentName?: string;
  documentSize?: string;
}

interface SubmitLeaveCardProps {
  onSubmit: (payload: LeaveFormPayload) => Promise<boolean> | boolean;
  isSubmitting?: boolean;
}

// Exactly the 3 requested leave types
const LEAVE_TYPES = [
  { label: 'Sick Leave', value: 'Sick Leave', color: '#10B981', dotBg: '#D1FAE5' },
  { label: 'Personal Leave', value: 'Personal Leave', color: '#3B82F6', dotBg: '#DBEAFE' },
  { label: 'Casual Leave', value: 'Casual Leave', color: '#F59E0B', dotBg: '#FEF3C7' },
];

export const SubmitLeaveCard: React.FC<SubmitLeaveCardProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  // Default selected/placeholder state is empty string ("Select leave type")
  const [leaveType, setLeaveType] = useState<string>('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = useRef<any>(null);
  const dropdownRef = useRef<any>(null);

  const selectedTypeObj = LEAVE_TYPES.find((t) => t.value === leaveType);

  // Close dropdown on web when clicking outside
  useEffect(() => {
    if (Platform.OS === 'web' && isTypeDropdownOpen) {
      const handleClickOutside = (event: any) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsTypeDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isTypeDropdownOpen]);

  const handleFileChange = (event: any) => {
    if (Platform.OS === 'web') {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'File size exceeds 5MB limit.' }));
        return;
      }

      // Validate format
      const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        setErrors((prev) => ({ ...prev, file: 'Only PDF, JPG, and PNG files are supported.' }));
        return;
      }

      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

      setSelectedFile({ name: file.name, size: sizeStr });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.file;
        return copy;
      });
    }
  };

  const triggerUpload = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setSelectedFile({ name: 'medical_certificate.pdf', size: '1.2 MB' });
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!leaveType || leaveType.trim() === '') {
      newErrors.leaveType = 'Please select a leave type.';
    }
    if (!fromDate) newErrors.fromDate = 'From date is required.';
    if (!toDate) newErrors.toDate = 'To date is required.';

    if (fromDate && toDate) {
      const d1 = new Date(fromDate);
      const d2 = new Date(toDate);
      if (d1 > d2) {
        newErrors.toDate = 'To Date cannot be before From Date.';
      }
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please enter a reason for leave.';
    } else if (reason.length > 200) {
      newErrors.reason = 'Reason cannot exceed 200 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const success = await onSubmit({
      leaveType,
      fromDate,
      toDate,
      reason: reason.trim(),
      documentName: selectedFile?.name,
      documentSize: selectedFile?.size,
    });

    if (success) {
      // Reset form
      setLeaveType('');
      setReason('');
      setFromDate('');
      setToDate('');
      setSelectedFile(null);
      setErrors({});
    }
  };

  return (
    <View style={styles.cardContainer} id="submit-leave-form">
      {/* Hidden Web File Input */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      )}

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerIconWrap}>
          <Text style={{ fontSize: 18 }}>📝</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Submit Leave Request</Text>
          <Text style={styles.headerSubtitle}>Fill in the details to apply for leave</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Form Fields */}
      <View style={styles.formBody}>
        {/* Leave Type Dropdown */}
        <View
          style={[styles.fieldGroup, { zIndex: 100 }]}
          ref={dropdownRef}
        >
          <Text style={styles.fieldLabel}>
            Leave Type <Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.dropdownTrigger,
              isTypeDropdownOpen && styles.dropdownTriggerActive,
              errors.leaveType ? styles.inputError : null,
            ]}
            onPress={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            activeOpacity={0.85}
          >
            <View style={styles.typeSelectedRow}>
              {selectedTypeObj ? (
                <>
                  <View style={[styles.colorDot, { backgroundColor: selectedTypeObj.color }]} />
                  <Text style={styles.typeSelectedText}>{selectedTypeObj.label}</Text>
                </>
              ) : (
                <Text style={styles.typePlaceholderText}>Select leave type</Text>
              )}
            </View>
            <Text style={styles.dropdownArrow}>{isTypeDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {isTypeDropdownOpen && (
            <View style={styles.dropdownMenu}>
              {LEAVE_TYPES.map((type) => {
                const isSelected = type.value === leaveType;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.dropdownMenuItem,
                      isSelected && styles.dropdownMenuItemActive,
                    ]}
                    onPress={() => {
                      setLeaveType(type.value);
                      setIsTypeDropdownOpen(false);
                      if (errors.leaveType) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.leaveType;
                          return copy;
                        });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.colorDot, { backgroundColor: type.color }]} />
                    <Text
                      style={[
                        styles.dropdownMenuText,
                        isSelected && styles.dropdownMenuTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {errors.leaveType && <Text style={styles.errorText}>{errors.leaveType}</Text>}
        </View>

        {/* Date Pickers (2-col on desktop, stacked on mobile) */}
        <View style={styles.dateRow}>
          {/* From Date */}
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>
              From Date <Text style={styles.required}>*</Text>
            </Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={fromDate}
                onChange={(e: any) => {
                  setFromDate(e.target.value);
                  if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: '' }));
                }}
                style={{
                  width: '100%',
                  height: 40,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: errors.fromDate ? '1px solid #EF4444' : '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: 13,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <TextInput
                style={[styles.input, errors.fromDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={fromDate}
                onChangeText={(text) => {
                  setFromDate(text);
                  if (errors.fromDate) setErrors((prev) => ({ ...prev, fromDate: '' }));
                }}
              />
            )}
            {errors.fromDate && <Text style={styles.errorText}>{errors.fromDate}</Text>}
          </View>

          {/* To Date */}
          <View style={styles.dateCol}>
            <Text style={styles.fieldLabel}>
              To Date <Text style={styles.required}>*</Text>
            </Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={toDate}
                onChange={(e: any) => {
                  setToDate(e.target.value);
                  if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: '' }));
                }}
                style={{
                  width: '100%',
                  height: 40,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: errors.toDate ? '1px solid #EF4444' : '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  fontSize: 13,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <TextInput
                style={[styles.input, errors.toDate && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                value={toDate}
                onChangeText={(text) => {
                  setToDate(text);
                  if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: '' }));
                }}
              />
            )}
            {errors.toDate && <Text style={styles.errorText}>{errors.toDate}</Text>}
          </View>
        </View>

        {/* Reason for Leave */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelWithCounter}>
            <Text style={styles.fieldLabel}>
              Reason for Leave <Text style={styles.required}>*</Text>
            </Text>
            <Text style={[styles.charCounter, reason.length > 200 && styles.charCounterOver]}>
              {reason.length}/200
            </Text>
          </View>
          <TextInput
            style={[styles.textarea, errors.reason && styles.inputError]}
            placeholder="Enter reason for leave..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            maxLength={200}
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
            }}
          />
          {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
        </View>

        {/* Supporting Document Upload Area */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Attach Supporting Document (Optional)</Text>

          {!selectedFile ? (
            <View style={styles.uploadBox}>
              <View style={styles.uploadIconCircle}>
                <Text style={{ fontSize: 20 }}>📁</Text>
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadMainText}>Upload doctor note or letter</Text>
                <Text style={styles.uploadSubText}>PDF, JPG, PNG (Max 5MB)</Text>
              </View>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={triggerUpload}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fileSelectedBox}>
              <View style={styles.fileIconWrap}>
                <Text style={{ fontSize: 18 }}>📄</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>{selectedFile.size}</Text>
              </View>
              <TouchableOpacity onPress={removeFile} style={styles.removeFileBtn}>
                <Text style={styles.removeFileText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.file && <Text style={styles.errorText}>{errors.file}</Text>}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Text>
          <Text style={styles.sendIcon}>✈️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
    position: 'relative',
    overflow: 'visible',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  formBody: {
    gap: 14,
    overflow: 'visible',
  },
  fieldGroup: {
    gap: 6,
    position: 'relative',
    overflow: 'visible',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  required: {
    color: '#EF4444',
  },
  dropdownTrigger: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    boxSizing: 'border-box' as any,
  },
  dropdownTriggerActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  typeSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  typeSelectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  typePlaceholderText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 20,
    zIndex: 1000,
    padding: 6,
    gap: 3,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 10,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownMenuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  dropdownMenuTextActive: {
    fontWeight: '700',
    color: '#2563EB',
  },
  checkmark: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 1,
    gap: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  labelWithCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  charCounterOver: {
    color: '#EF4444',
  },
  textarea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    padding: 12,
    gap: 12,
  },
  uploadIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInfo: {
    flex: 1,
  },
  uploadMainText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  uploadSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  uploadBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  fileSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  fileIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  fileSize: {
    fontSize: 10,
    color: '#60A5FA',
    marginTop: 1,
  },
  removeFileBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sendIcon: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 2,
  },
});
