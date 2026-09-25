import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';

export interface QuickNoteItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

const DEFAULT_NOTES: QuickNoteItem[] = [
  {
    id: '1',
    title: 'Prepare Physics Lab Equipment',
    description: 'Ensure optics lenses and laser kits are ready for Class 10-A Lab Session.',
    date: 'Sep 24, 2026',
  },
  {
    id: '2',
    title: 'Collect Math Homework Sheets',
    description: 'Collect Chapter 4 Algebra assignments from Class 9-B.',
    date: 'Sep 25, 2026',
  },
];

export const QuickNotesCard: React.FC = () => {
  const [notes, setNotes] = useState<QuickNoteItem[]>(DEFAULT_NOTES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitleInput('');
    setDescInput('');
    setModalVisible(true);
  };

  const handleOpenEdit = (note: QuickNoteItem) => {
    setEditingId(note.id);
    setTitleInput(note.title);
    setDescInput(note.description);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSaveNote = () => {
    if (!titleInput.trim()) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (editingId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingId
            ? { ...n, title: titleInput, description: descInput }
            : n
        )
      );
    } else {
      const newNote: QuickNoteItem = {
        id: Date.now().toString(),
        title: titleInput,
        description: descInput,
        date: todayStr,
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>QUICK NOTES</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add Note</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notesList}>
        {notes.length === 0 ? (
          <Text style={styles.emptyText}>No quick notes saved yet.</Text>
        ) : (
          notes.map((item) => (
            <View key={item.id} style={styles.noteItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                {item.description ? (
                  <Text style={styles.noteDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.noteDate}>{item.date}</Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleOpenEdit(item)} style={styles.iconBtn}>
                  <Text style={{ fontSize: 13 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                  <Text style={{ fontSize: 13 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add / Edit Note Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Quick Note' : 'Add Quick Note'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ fontSize: 18, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Note Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Science Lab Preparation"
                placeholderTextColor="#94A3B8"
                value={titleInput}
                onChangeText={setTitleInput}
              />

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Description</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Enter details..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={descInput}
                onChangeText={setDescInput}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNote}>
                <Text style={styles.saveBtnText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  addBtn: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C3AED',
  },
  notesList: {
    gap: 10,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  noteDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  noteDate: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  textarea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
