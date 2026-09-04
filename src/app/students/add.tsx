import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AddStudentScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [rollNo, setRollNo] = useState('');

  const handleAddStudent = () => {
    if (!name || !className || !rollNo) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    Alert.alert('Success', 'Student added successfully');

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Student</Text>

      <Text style={styles.label}>Student Name</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter student name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Class</Text>

      <TextInput
        style={styles.input}
        placeholder="Example: 10-A"
        value={className}
        onChangeText={setClassName}
      />

      <Text style={styles.label}>Roll Number</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter roll number"
        value={rollNo}
        onChangeText={setRollNo}
        keyboardType="numeric"
      />

      <Pressable
        style={styles.button}
        onPress={handleAddStudent}
      >
        <Text style={styles.buttonText}>
          ADD STUDENT
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f5f9',
    padding: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  button: {
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});