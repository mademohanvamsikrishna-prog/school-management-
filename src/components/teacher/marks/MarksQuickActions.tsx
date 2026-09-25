import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MarksQuickActionsProps {
  onEnterMarks: () => void;
  onExportResults?: () => void;
  onPrintResults?: () => void;
  onDownloadReport?: () => void;
}

export const MarksQuickActions: React.FC<MarksQuickActionsProps> = ({
  onEnterMarks,
  onExportResults,
  onPrintResults,
  onDownloadReport,
}) => {
  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.btn, styles.btnEnter]}
        onPress={onEnterMarks}
        activeOpacity={0.8}
      >
        <Text style={styles.btnIcon}>✏️</Text>
        <Text style={styles.btnTextWhite}>Enter Marks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnExport]}
        onPress={onExportResults}
        activeOpacity={0.8}
      >
        <Text style={styles.btnIcon}>📥</Text>
        <Text style={styles.btnTextDark}>Export Results</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnPrint]}
        onPress={onPrintResults}
        activeOpacity={0.8}
      >
        <Text style={styles.btnIcon}>🖨️</Text>
        <Text style={styles.btnTextDark}>Print Results</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.btnDownload]}
        onPress={onDownloadReport}
        activeOpacity={0.8}
      >
        <Text style={styles.btnIcon}>📄</Text>
        <Text style={styles.btnTextDark}>Download Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  btnEnter: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  btnExport: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  btnPrint: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  btnDownload: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  btnIcon: {
    fontSize: 16,
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnTextDark: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
