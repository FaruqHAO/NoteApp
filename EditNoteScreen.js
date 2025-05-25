import React, { useEffect, useState, useCallback } from 'react';

import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Share
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash.debounce';

export default function EditNoteScreen({ route, navigation }) {
  const { noteId } = route.params ?? {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // Show modal on pressing ⋮
  const onMoreOptionsPress = () => setModalVisible(true);

  // Share handler
 const onShare = async () => {
  try {
    setModalVisible(false); // Close the modal
    const message = `${title}\n\n${content}`;
    const result = await Share.share({
      message: message,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        console.log('Shared with activity type: ', result.activityType);
      } else {
        console.log('Shared');
      }
    } else if (result.action === Share.dismissedAction) {
      console.log('Dismissed');
    }
  } catch (error) {
    Alert.alert('Error', 'Could not share the note.');
    console.error(error.message);
  }
};


  // Delete handler
  const onDelete = () => {
    setModalVisible(false);
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const isGuest = await SecureStore.getItemAsync('isGuest');
              if (isGuest === 'true') {
                const stored = await AsyncStorage.getItem('guestNotes');
                const parsed = stored ? JSON.parse(stored) : [];
                const updated = parsed.filter((note) => note.id !== noteId);
                await AsyncStorage.setItem('guestNotes', JSON.stringify(updated));
                navigation.navigate('Notes');
                return;
              }

              const token = await SecureStore.getItemAsync('userToken');
              const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.ok) {
              navigation.navigate('Notes');
              } else {
                Alert.alert('Error', 'Failed to delete note.');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Something went wrong while deleting.');
            }
          },
        },
      ]
    );
  };

  // Fetch the note data on mount
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

  // Save note automatically (debounced)
  const saveNote = async (titleToSave, contentToSave) => {
    if (!titleToSave.trim() && !contentToSave.trim()) {
      return; // don't save empty notes
    }

    try {
      const isGuest = await SecureStore.getItemAsync('isGuest');
      if (isGuest === 'true') {
        const stored = await AsyncStorage.getItem('guestNotes');
        const notes = stored ? JSON.parse(stored) : [];
        const updated = notes.map((n) =>
          n.id === noteId ? { ...n, title: titleToSave, content: contentToSave } : n
        );
        await AsyncStorage.setItem('guestNotes', JSON.stringify(updated));
      } else {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: titleToSave, content: contentToSave }),
        });

        if (!response.ok) {
          console.error('Failed to update note on server');
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // debounce saving by 1 second
  const debouncedSave = useCallback(debounce(saveNote, 1000), [noteId]);

  // trigger save when title or content changes
  useEffect(() => {
    if (!loading) {
      debouncedSave(title, content);
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [title, content, debouncedSave, loading]);

  useEffect(() => {
    if (noteId) {
      setLoading(true);
      fetchNote();
    }
  }, [noteId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#333" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Note</Text>

        <TouchableOpacity onPress={onMoreOptionsPress}>
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

      {/* Modal for More Options */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={onDelete} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onShare} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

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
    fontSize: 32,
    color: '#333',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5E6D5',
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalOption: {
    paddingVertical: 15,
    color: '#000',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#000',
  },
});
