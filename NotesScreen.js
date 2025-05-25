import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';  // <-- import this

export default function RecentNotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = async () => {
    setLoading(true);  // show loading spinner when fetching
    try {
      const isGuest = await SecureStore.getItemAsync('isGuest');
      if (isGuest === 'true') {
        const guestNotes = await AsyncStorage.getItem('guestNotes');
        const parsedNotes = guestNotes ? JSON.parse(guestNotes) : [];
        setNotes(parsedNotes);
        return;
      }

      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        navigation.replace('Login');
        return;
      }

      const response = await fetch('https://notesapi-7r9d.onrender.com/api/Notes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch notes.');

      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not load notes');
    } finally {
      setLoading(false);
    }
  };

  // Replace useEffect with useFocusEffect to refetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const renderNoteCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EditNote', { noteId: item.id })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={5}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>

        {showSearch ? (
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        ) : (
          <Text style={styles.headerTitle}>Recent Notes</Text>
        )}

        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Notes */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : filteredNotes.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 30 }}>No notes found</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddNote')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBEEDC',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    width: cardWidth,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
    color: '#333',
  },
  cardContent: {
    fontSize: 13,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
});

// ... (styles remain unchanged)
