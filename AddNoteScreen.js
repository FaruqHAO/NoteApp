import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
const handleAddNote = async () => {
  if (!title || !content) {
    Alert.alert('Error', 'Please fill both title and content');
    return;
  }

  try {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      // Guest mode: Save locally
      const guestNote = { title, content, id: Date.now().toString() };

      const existing = await AsyncStorage.getItem('guestNotes');
      const notes = existing ? JSON.parse(existing) : [];
      notes.push(guestNote);
      await AsyncStorage.setItem('guestNotes', JSON.stringify(notes));

      Alert.alert('Note Saved Locally', 'You’re in guest mode');
      navigation.goBack();
      return;
    }

    // Logged-in user: Send to server
    const response = await fetch('https://notesapi-7r9d.onrender.com/api/Notes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      Alert.alert('Success', 'Note added');
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Failed to add note');
    }
  } catch (error) {
    Alert.alert('Error', 'Something went wrong');
    console.error(error);
  }
};


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TextInput
          placeholder="Content"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textArea]}
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.button} onPress={handleAddNote}>
          <Text style={styles.buttonText}>➕ Add Note</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
textArea: {
  height: 250, // much taller
  fontSize: 18, // larger font like iOS Notes
  textAlignVertical: 'top',
  backgroundColor: '#fff',
  padding: 16,
  borderWidth: 0, // no border like iOS
  borderRadius: 0, // flat edges
  shadowColor: '#ccc',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 1,
},
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
