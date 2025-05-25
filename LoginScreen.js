import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './AuthContext'; // adjust the path if needed

export default function LoginScreen({ navigation }) {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('All fields are required');
      return;
    }
  if (!emailRegex.test(email)) {
  Alert.alert('Please enter a valid email address');
  return;
}

    setLoading(true);

    try {
      const response = await fetch('https://notesapi-7r9d.onrender.com/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.deleteItemAsync('isGuest');

      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
      console.error('Login error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    await SecureStore.setItemAsync('isGuest', 'true');
    setIsLoggedIn(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTE</Text>
      <Text style={styles.header}>Welcome Back</Text>
      <Text style={styles.subheader}>
        Log in to your account to access to your notes.
      </Text>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.loginText}>Don't have an account? Register here</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGuestLogin}>
        <Text style={styles.guestText}>Continue as Guest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbeee0',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: '#2e2e2e',
    marginBottom: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2e2e2e',
  },
  subheader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#5c5c5c',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5c5c5c',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  button: {
    backgroundColor: '#d9534f',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#d9534f',
    fontWeight: 'bold',
  },
  guestText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#d9534f',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
