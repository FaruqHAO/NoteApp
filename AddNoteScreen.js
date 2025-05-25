import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash.debounce';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://notesapi-7r9d.onrender.com/api/notes';

const NoteEditor = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Load user token once on mount
  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setUserToken(token);
    };
    loadToken();
  }, []);

  // Save note to server or AsyncStorage (fallback) - debounced
  const saveNote = async (titleToSave, contentToSave) => {
    if (!titleToSave.trim() && !contentToSave.trim()) {
      return; // don't save empty notes
    }

    if (!userToken) {
      // No user token, save locally for guest
      saveNoteLocally(titleToSave, contentToSave);
      return;
    }

    try {
      const method = noteId ? 'PUT' : 'POST';
      const url = noteId ? `${API_URL}/${noteId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ title: titleToSave, content: contentToSave }),
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const savedNote = JSON.parse(text);
          if (!noteId && savedNote.id) {
            setNoteId(savedNote.id);
          }
        } else {
          // No content returned, ignore or handle if needed
          if (!noteId) {
            console.warn('No response body after saving note');
          }
        }
      } else {
        console.error('Failed to save note on server:', response.status, response.statusText);
        // fallback to save locally
        saveNoteLocally(titleToSave, contentToSave);
      }
    } catch (error) {
      console.error('Error saving note to server:', error);
      // fallback to save locally
      saveNoteLocally(titleToSave, contentToSave);
    }
  };

  // Save note locally for guests or fallback
  const saveNoteLocally = async (titleToSave, contentToSave) => {
    try {
      const notesRaw = await AsyncStorage.getItem('guestNotes');
      const notes = notesRaw ? JSON.parse(notesRaw) : [];

      let updatedNotes;
      if (noteId) {
        updatedNotes = notes.map(note =>
          note.id === noteId ? { ...note, title: titleToSave, content: contentToSave } : note
        );
      } else {
        const newNote = { id: Date.now().toString(), title: titleToSave, content: contentToSave };
        updatedNotes = [...notes, newNote];
        setNoteId(newNote.id);
      }

      await AsyncStorage.setItem('guestNotes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving note locally:', error);
    }
  };

  // debounce to avoid too many writes
  const debouncedSave = useCallback(debounce(saveNote, 1000), [noteId, userToken]);

  useEffect(() => {
    debouncedSave(title, content);
    return () => {
      debouncedSave.cancel();
    };
  }, [title, content, debouncedSave]);

  // Reset fields on screen focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setTitle('');
      setContent('');
      setNoteId(null);
    });

    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButtonContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Note</Text>

        <TouchableOpacity onPress={() => Alert.alert('More options pressed')}>
          <Text style={styles.moreOptions}>⋮</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.noteTitle}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter note title"
        placeholderTextColor="#999"
        maxLength={100}
      />

      <TextInput
        style={styles.noteContent}
        value={content}
        onChangeText={setContent}
        placeholder="Enter note content"
        placeholderTextColor="#999"
        multiline
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E6D5', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButtonContainer: {
    padding: 10,
  },
  backButton: {
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  moreOptions: {
    fontSize: 24,
    color: '#333',
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    color: '#333',
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    height: 650,
    color: '#333',
  },
});

export default NoteEditor;
