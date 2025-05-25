// import React, { useState, useEffect } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
// import { Provider as PaperProvider } from 'react-native-paper';
// import * as SecureStore from 'expo-secure-store';

// import LoginScreen from './LoginScreen';
// import RegisterScreen from './RegisterScreen';
// import AddNoteScreen from './AddNoteScreen';
// import NotesScreen from './NotesScreen';
// import EditNoteScreen from './EditNoteScreen';
// import ProfileScreen from './ProfileScreen';

// const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

// function NotesStack() {
//   return (
//     <Stack.Navigator initialRouteName="Notes">
//       <Stack.Screen name="Notes" component={NotesScreen} />
//       <Stack.Screen name="AddNote" component={AddNoteScreen} />
//       <Stack.Screen name="EditNote" component={EditNoteScreen} />
//       <Stack.Screen name="Profile">
//   {(props) => <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
// </Stack.Screen>

//     </Stack.Navigator>
//   );
// }

// // Custom drawer content passes setIsLoggedIn down to ProfileScreen
// function CustomDrawerContent(props) {
//   const { setIsLoggedIn } = props;
//   return (
//     <DrawerContentScrollView {...props}>
//       <ProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />
//     </DrawerContentScrollView>
//   );
// }


// export default function App() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const token = await SecureStore.getItemAsync('userToken');
//       const isGuest = await SecureStore.getItemAsync('isGuest');
//       setIsLoggedIn(!!token || isGuest === 'true');
//       setIsLoading(false);
//     };
//     checkLoginStatus();
//   }, []);

//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!isLoggedIn) {
//     return (
//       <PaperProvider>
//         <NavigationContainer>
//           <Stack.Navigator initialRouteName="Login">
//             <Stack.Screen name="Login">
//               {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
//             </Stack.Screen>
//             <Stack.Screen name="Register" component={RegisterScreen} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </PaperProvider>
//     );
//   }

//   // Logged-in drawer navigation with setIsLoggedIn passed down
//   return (
//     <PaperProvider>
//       <NavigationContainer>
//         <Drawer.Navigator
//   drawerContent={(props) => (
//      <CustomDrawerContent {...props} setIsLoggedIn={setIsLoggedIn} />
//   )}
//   screenOptions={{ headerShown: false }}
// >
//   <Drawer.Screen
//     name="Notes"
//     component={NotesScreen}
//     options={{ title: 'Notes' }}
//   />
// </Drawer.Navigator>

//       </NavigationContainer>
//     </PaperProvider>
//   );
// } 
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

import { AuthContext } from './AuthContext'; // 👈 import context

import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import AddNoteScreen from './AddNoteScreen';
import NotesScreen from './NotesScreen';
import EditNoteScreen from './EditNoteScreen';
import ProfileScreen from './ProfileScreen';
import atob from 'atob';
global.atob = atob;
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <ProfileScreen {...props} />
    </DrawerContentScrollView>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      const isGuest = await SecureStore.getItemAsync('isGuest');
      setIsLoggedIn(!!token || isGuest === 'true');
      setIsLoading(false);
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <PaperProvider>
        <NavigationContainer>
          {!isLoggedIn ? (
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Navigator>
          ) : (
            <Drawer.Navigator
              drawerContent={(props) => <CustomDrawerContent {...props} />}
              screenOptions={{ headerShown: false }}
            >
              <Drawer.Screen name="Notes" component={NotesScreen} />
              <Drawer.Screen name="AddNote" component={AddNoteScreen} />
              <Drawer.Screen name="EditNote" component={EditNoteScreen} />
              <Drawer.Screen name="Profile" component={ProfileScreen} />
            </Drawer.Navigator>
          )}
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
  );
}
