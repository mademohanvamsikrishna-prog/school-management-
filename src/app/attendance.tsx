import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const initialStudents = [
  {
    id: 1,
    name: 'Rahul Kumar',
    className: '10-A',
    present: true,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    className: '10-A',
    present: true,
  },
  {
    id: 3,
    name: 'Arjun Reddy',
    className: '10-B',
    present: false,
  },
  {
    id: 4,
    name: 'Sneha Rao',
    className: '10-B',
    present: true,
  },
];

export default function AttendanceScreen() {
  const [students, setStudents] = useState(initialStudents);

  const toggleAttendance = (id: number) => {
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === id
          ? {
              ...student,
              present: !student.present,
            }
          : student
      )
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Attendance</Text>

      <Text style={styles.subtitle}>
        Student Attendance
      </Text>

      {students.map((student) => (
        <View key={student.id} style={styles.card}>
          <View>
            <Text style={styles.name}>
              {student.name}
            </Text>

            <Text style={styles.classText}>
              Class: {student.className}
            </Text>
          </View>

          <Pressable
            style={[
              styles.statusButton,
              student.present
                ? styles.present
                : styles.absent,
            ]}
            onPress={() => toggleAttendance(student.id)}
          >
            <Text style={styles.statusText}>
              {student.present ? 'Present' : 'Absent'}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  classText: {
    fontSize: 14,
  },

  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 85,
    alignItems: 'center',
  },

  present: {
    backgroundColor: '#22c55e',
  },

  absent: {
    backgroundColor: '#ef4444',
  },

  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});