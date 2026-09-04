import { ScrollView, StyleSheet, Text, View } from 'react-native';

const students = [
  {
    id: 1,
    name: 'Rahul Kumar',
    className: '10-A',
    maths: 85,
    science: 78,
    english: 90,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    className: '10-A',
    maths: 92,
    science: 88,
    english: 86,
  },
  {
    id: 3,
    name: 'Arjun Reddy',
    className: '10-B',
    maths: 74,
    science: 80,
    english: 72,
  },
  {
    id: 4,
    name: 'Sneha Rao',
    className: '10-B',
    maths: 89,
    science: 94,
    english: 91,
  },
];

export default function MarksScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Student Marks</Text>

      <Text style={styles.subtitle}>
        Examination Results
      </Text>

      {students.map((student) => {
        const total =
          student.maths +
          student.science +
          student.english;

        const average = Math.round(total / 3);

        return (
          <View key={student.id} style={styles.card}>
            <Text style={styles.name}>
              {student.name}
            </Text>

            <Text style={styles.classText}>
              Class: {student.className}
            </Text>

            <View style={styles.row}>
              <Text>Maths</Text>
              <Text>{student.maths}</Text>
            </View>

            <View style={styles.row}>
              <Text>Science</Text>
              <Text>{student.science}</Text>
            </View>

            <View style={styles.row}>
              <Text>English</Text>
              <Text>{student.english}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Average
              </Text>

              <Text style={styles.totalText}>
                {average}%
              </Text>
            </View>
          </View>
        );
      })}
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  classText: {
    fontSize: 14,
    marginBottom: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },

  totalText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});