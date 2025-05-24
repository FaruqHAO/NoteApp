import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EditNoteScreen({ route, navigation }) {
  const { noteId } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

const fetchNote = async () => {
  try {
    const isGuest = await SecureStore.getItemAsync('isGuest');
    if (isGuest === 'true') {
      const stored = await AsyncStorage.getItem('guestNotes');
      const notes = stored ? JSON.parse(stored) : [];
      const found = notes.find((n) => n.id === noteId);
      if (found) {
        setTitle(found.title);
        setContent(found.content);
      } else {
        Alert.alert('Error', 'Note not found');
        navigation.goBack();
      }
    } else {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch note: ${response.status}`);
      }

      const note = await response.json();
      setTitle(note.title);
      setContent(note.content);
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Could not load note.');
  } finally {
    setLoading(false);
  }
};
const updateNote = async () => {
  if (!title || !content) {
    Alert.alert('Error', 'Please fill both title and content');
    return;
  }

  try {
    const isGuest = await SecureStore.getItemAsync('isGuest');
    if (isGuest === 'true') {
      const stored = await AsyncStorage.getItem('guestNotes');
      const notes = stored ? JSON.parse(stored) : [];
      const updated = notes.map((n) =>
        n.id === noteId ? { ...n, title, content } : n
      );
      await AsyncStorage.setItem('guestNotes', JSON.stringify(updated));
      Alert.alert('Success', 'Note updated');
      navigation.goBack();
    } else {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Note updated');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update note');
      }
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Something went wrong');
  }
};

  useEffect(() => {
    fetchNote();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

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
        <TouchableOpacity style={styles.button} onPress={updateNote}>
          <Text style={styles.buttonText}>💾 Save Changes</Text>
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
    height: 250,
    fontSize: 18,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    padding: 16,
    borderWidth: 0,
    borderRadius: 0,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: '#28a745',
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
