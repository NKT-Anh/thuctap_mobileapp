import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import RegisterScreen from './RegisterScreen';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

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
    <View style={styles.bg}>
      <View style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <MaterialCommunityIcons name="laptop" size={64} color="#007AFF" style={{ marginBottom: 6 }} />
          <Text style={styles.title}>Đăng nhập hệ thống luyện thi Tin học</Text>
          <Text style={styles.subtitle}>Cùng luyện tập và chinh phục các kỳ thi Tin học!</Text>
        </View>
        <View style={[styles.inputWrap, emailFocus && styles.inputWrapActive]}>
          <Ionicons name="mail" size={20} color={emailFocus ? '#007AFF' : '#aaa'} style={{ marginHorizontal: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
          />
        </View>
        <View style={[styles.inputWrap, passFocus && styles.inputWrapActive]}>
          <Ionicons name="lock-closed" size={20} color={passFocus ? '#007AFF' : '#aaa'} style={{ marginHorizontal: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setPassFocus(true)}
            onBlur={() => setPassFocus(false)}
          />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <MaterialCommunityIcons name="login" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Đăng nhập</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setShowRegister(true)} style={{ marginTop: 22, alignItems: 'center' }}>
          <Text style={{ color: '#007AFF', textDecorationLine: 'underline', fontSize: 15 }}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#f6f8fa', justifyContent: 'center', alignItems: 'center' },
  card: { width: 340, backgroundColor: '#fff', borderRadius: 18, padding: 28, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 2, color: '#222', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#007AFF', marginBottom: 12, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  inputWrapActive: { borderColor: '#007AFF', backgroundColor: '#f0f6ff' },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 6, fontSize: 16, color: '#222', borderRadius: 12 },
  loginBtn: { flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 2 },
}); 