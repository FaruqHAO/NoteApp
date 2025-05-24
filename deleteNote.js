const deleteNote = async (noteId) => {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    const response = await fetch(`https://notesapi-7r9d.onrender.com/api/Notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Failed to delete note');

    // Optionally refetch notes
    fetchNotes();
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to delete the note.');
  }
};
