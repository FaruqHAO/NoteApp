import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }

    if (!emailRegex.test(email)) {
  Alert.alert('Please enter a valid email address');
  return;
}

if (password.length < 6) {
  Alert.alert('Password must be at least 6 characters long');
  return;
}
    

    try {
      const response = await fetch('https://notesapi-7r9d.onrender.com/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (response.ok) {
        Alert.alert('Success', 'User registered successfully');
        navigation.navigate('Login');
      } else {
        const errorData = await response.json();
        Alert.alert('Registration Failed', errorData.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
      console.error('Register Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NOTE</Text>
      <Text style={styles.header}>Create a free account</Text>
      <Text style={styles.subheader}>
        Join Note App for free. Create unlimited notes.
      </Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Salman Omar"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="faruq@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="***********"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account?</Text>
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
});
