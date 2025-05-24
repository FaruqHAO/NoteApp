import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Button,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const isFocused = useIsFocused();

  const fetchNotes = async () => {
  try {
    const isGuest = await SecureStore.getItemAsync('isGuest');
    if (isGuest === 'true') {
     // Guest mode - load from AsyncStorage
      const guestNotes = await AsyncStorage.getItem('guestNotes');
      const notes = guestNotes ? JSON.parse(guestNotes) : [];
      setNotes(notes);
      return;;
    }

    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      setLoading(false);
      Alert.alert('Error', 'You are not logged in.');
      navigation.navigate('Login');
      return;
    }

    const response = await fetch('https://notesapi-7r9d.onrender.com/api/Notes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch notes.');

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Data is not an array');
    setNotes(data);
  } catch (error) {
    setErrorMessage('Could not load notes. Please check your connection.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (isFocused) fetchNotes();
  }, [isFocused]);

useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <View style={{ flexDirection: 'row', marginRight: 15 }}>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          style={{ marginRight: 20 }}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('isGuest');
    navigation.replace('Login');
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    ),
    headerTitle: () =>
      showSearch ? (
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          autoFocus
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      ) : (
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Notes</Text>
      ),
  });
}, [navigation, showSearch, searchQuery]);


const deleteNote = async (noteId) => {
  try {
    const isGuest = await SecureStore.getItemAsync('isGuest');
    if (isGuest === 'true') {
      const stored = await AsyncStorage.getItem('guestNotes');
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = parsed.filter((note) => note.id !== noteId);
      await AsyncStorage.setItem('guestNotes', JSON.stringify(updated));
      setNotes(updated);
      return;
    }

    const token = await SecureStore.getItemAsync('userToken');
    const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } else {
      Alert.alert('Error', 'Failed to delete note.');
    }
  } catch {
    Alert.alert('Error', 'Something went wrong while deleting.');
  }
};

  const renderItem = ({ item }) => {
    const handleDelete = () => {
      Alert.alert('Delete Note', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(item.id) },
      ]);
    };

    return (
      <View style={styles.noteItem}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
        >
          <Text style={styles.noteTitle}>{item.title}</Text>
          <Text>{item.content}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : filteredNotes.length === 0 ? (
        <Text style={styles.emptyText}>No notes found.</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}

     <TouchableOpacity
  style={styles.fab}
  onPress={() => navigation.navigate('AddNote')}
>
  <Ionicons name="add" size={30} color="white" />
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingBottom: 70 },
  noteItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    paddingLeft: 10,
  },
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  searchBar: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 10,
    borderRadius: 8,
    width: 200,
    height: 35,
  },
  fab: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: '#007bff',
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 5, // for Android shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3.84, // for iOS shadow
},

});
