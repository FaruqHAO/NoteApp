import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const response = await fetch('https://notesapi-7r9d.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.deleteItemAsync('isGuest'); // clear guest flag

      setIsLoggedIn(true);
      navigation.replace('Notes');
    } catch (error) {
      console.error('Login error:', error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await SecureStore.setItemAsync('isGuest', 'true');
    setIsLoggedIn(true);
    navigation.replace('Notes');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
      <Text
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        Don't have an account? Register here
      </Text>

      <TouchableOpacity onPress={handleGuestLogin}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  registerLink: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
  },
  guestText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
});
