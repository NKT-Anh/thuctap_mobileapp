import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import TeacherNavigator from './src/navigation/TeacherNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import StudentNavigator from './src/navigation/StudentNavigator';

function RootNavigator() {
  const { user, login, logout } = useAuth();
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }
  if (user.role === 'admin') {
    return <AppNavigator />;
  }
  if (user.role === 'teacher') {
    return <TeacherNavigator />;
  }
  if (user.role === 'student') {
    return <StudentNavigator />;
  }
  // TODO: StudentNavigator
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <LoginScreen onLogin={login} />
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}