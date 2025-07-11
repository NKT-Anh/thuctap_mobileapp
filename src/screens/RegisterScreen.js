import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

export default function RegisterScreen({ onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

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
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký tài khoản</Text>
      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={name}
        onChangeText={setName}
      />
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
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'student' && styles.roleActive]}
          onPress={() => setRole('student')}
        >
          <Text style={role === 'student' ? styles.roleActiveText : styles.roleText}>Học viên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleBtn, role === 'teacher' && styles.roleActive]}
          onPress={() => setRole('teacher')}
        >
          <Text style={role === 'teacher' ? styles.roleActiveText : styles.roleText}>Giảng viên</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <Button title="Đăng ký" onPress={handleRegister} />
      )}
      {/* Nút quay về đăng nhập */}
      <TouchableOpacity onPress={onRegisterSuccess} style={{ marginTop: 16 }}>
        <Text style={{ color: '#007AFF', textDecorationLine: 'underline' }}>
          Quay về đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  input: { width: 300, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 16 },
  roleContainer: { flexDirection: 'row', marginBottom: 16 },
  roleBtn: { padding: 10, borderWidth: 1, borderColor: '#007AFF', borderRadius: 5, marginHorizontal: 8 },
  roleActive: { backgroundColor: '#007AFF' },
  roleText: { color: '#007AFF', fontWeight: 'bold' },
  roleActiveText: { color: '#fff', fontWeight: 'bold' },
});