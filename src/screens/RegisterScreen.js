import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Lưu thông tin user vào Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        email,
        role,
        status: 'active',
      });
      Alert.alert('Thành công', 'Đăng ký thành công! Bạn có thể đăng nhập.');
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      Alert.alert('Lỗi đăng ký', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <MaterialCommunityIcons name="laptop" size={60} color="#007AFF" style={{ marginBottom: 6 }} />
          <Text style={styles.title}>Đăng ký tài khoản luyện thi Tin học</Text>
          <Text style={styles.subtitle}>Tạo tài khoản để bắt đầu học, ôn tập và thi!</Text>
        </View>
        <View style={[styles.inputWrap, nameFocus && styles.inputWrapActive]}>
          <Ionicons name="person" size={20} color={nameFocus ? '#007AFF' : '#aaa'} style={{ marginHorizontal: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
          />
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
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'student' && styles.roleActive]}
            onPress={() => setRole('student')}
          >
            <Ionicons name="school" size={18} color={role === 'student' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
            <Text style={role === 'student' ? styles.roleActiveText : styles.roleText}>Học viên</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'teacher' && styles.roleActive]}
            onPress={() => setRole('teacher')}
          >
            <MaterialCommunityIcons name="account-tie" size={18} color={role === 'teacher' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
            <Text style={role === 'teacher' ? styles.roleActiveText : styles.roleText}>Giảng viên</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 16 }} />
        ) : (
          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
            <MaterialCommunityIcons name="account-plus" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Đăng ký</Text>
          </TouchableOpacity>
        )}
        {/* Nút quay về đăng nhập */}
        <TouchableOpacity onPress={onRegisterSuccess} style={{ marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: '#007AFF', textDecorationLine: 'underline', fontSize: 15 }}>
            Quay về đăng nhập
          </Text>
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
  roleContainer: { flexDirection: 'row', marginBottom: 16, justifyContent: 'center' },
  roleBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 18, borderWidth: 1, borderColor: '#007AFF', borderRadius: 20, marginHorizontal: 8, backgroundColor: '#fff' },
  roleActive: { backgroundColor: '#007AFF' },
  roleText: { color: '#007AFF', fontWeight: 'bold' },
  roleActiveText: { color: '#fff', fontWeight: 'bold' },
  registerBtn: { flexDirection: 'row', backgroundColor: '#007AFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 2 },
});