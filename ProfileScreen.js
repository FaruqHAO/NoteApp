import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './AuthContext';

const GENERAL_AVATAR_URL = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

export default function ProfileScreen({ navigation }) {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const isGuest = await SecureStore.getItemAsync('isGuest');
        if (isGuest === 'true') {
          setUserName('Guest');
          return;
        }
        const token = await SecureStore.getItemAsync('userToken');
       
        if (token) {
          const decoded = decodeJWT(token);
          setUserName(decoded?.email || 'User');
        } else {
          setUserName('Guest');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setUserName('Guest');
      }
    };

    fetchUserName();
  }, []);

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  };

  const menuItems = [
    {
      icon: 'log-out-outline',
      label: 'Log Out',
      action: async () => {
        try {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('isGuest');
          setIsLoggedIn(false);
        } catch (error) {
          console.error('Error deleting token:', error);
        }
      },
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>NOTE</Text>
        <Image source={{ uri: GENERAL_AVATAR_URL }} style={styles.avatar} />
        <Text style={styles.name}>{userName}</Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={item.action}>
            <View style={styles.iconWrapper}>
              <Ionicons name={item.icon} size={20} color="#e74c3c" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FBEEDC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 240,
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuItem: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    backgroundColor: '#fceae9',
    padding: 10,
    borderRadius: 8,
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
