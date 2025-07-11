import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import RegisterScreen from './RegisterScreen';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Lấy role từ Firestore
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        Alert.alert('Lỗi', 'Tài khoản không tồn tại trong hệ thống!');
        setLoading(false);
        return;
      }
      const userData = userDoc.data();
      if (!userData.role) {
        Alert.alert('Lỗi', 'Tài khoản chưa được gán quyền!');
        setLoading(false);
        return;
      }
      onLogin({
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
      });
    } catch (error) {
      Alert.alert('Lỗi đăng nhập', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <RegisterScreen onRegisterSuccess={() => setShowRegister(false)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập hệ thống</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Đăng nhập" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={() => setShowRegister(true)} style={{ marginTop: 20 }}>
        <Text style={{ color: '#007AFF', textDecorationLine: 'underline' }}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  input: { width: 300, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 16 },
}); 