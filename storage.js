// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_NOTES_KEY = 'guest_notes';

export async function getGuestNotes() {
  const notes = await AsyncStorage.getItem(GUEST_NOTES_KEY);
  return notes ? JSON.parse(notes) : [];
}

export async function addGuestNote(note) {
  const existing = await getGuestNotes();
  const newNotes = [...existing, { ...note, id: Date.now().toString() }];
  await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(newNotes));
  return newNotes;
}

export async function updateGuestNote(updatedNote) {
  const existing = await getGuestNotes();
  const newNotes = existing.map(n => (n.id === updatedNote.id ? updatedNote : n));
  await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(newNotes));
  return newNotes;
}

export async function deleteGuestNote(id) {
  const existing = await getGuestNotes();
  const newNotes = existing.filter(n => n.id !== id);
  await AsyncStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(newNotes));
  return newNotes;
}
