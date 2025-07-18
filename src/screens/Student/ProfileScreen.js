import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { updateUser, changePassword } from '../../services/userService';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [pendingAvatar, setPendingAvatar] = useState(null);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const userId = user.id || user.uid;
      await updateUser(userId, { name });
      setSnackbar({ visible: true, message: 'Đã cập nhật tên!', error: false });
      login({ ...user, name });
    } catch (e) {
      setSnackbar({ visible: true, message: e.message || 'Lỗi cập nhật tên!', error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password.trim() || password.length < 6) {
      setSnackbar({ visible: true, message: 'Mật khẩu phải từ 6 ký tự!', error: true });
      return;
    }
    setLoading(true);
    try {
      await changePassword(password);
      setPassword('');
      setSnackbar({ visible: true, message: 'Đã đổi mật khẩu!', error: false });
    } catch (e) {
      setSnackbar({ visible: true, message: e.message || 'Lỗi đổi mật khẩu!', error: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Bạn cần cấp quyền truy cập ảnh để đổi avatar!');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPendingAvatar(result.assets[0].uri);
      }
    } catch (e) {
      setSnackbar({ visible: true, message: 'Lỗi chọn ảnh: ' + (e.message || e), error: true });
    }
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) return;
    setLoading(true);
    try {
      const response = await fetch(pendingAvatar);
      const blob = await response.blob();
      const fileRef = ref(storage, `avatars/${user.uid}_${Date.now()}`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      setAvatar(url);
      setPendingAvatar(null);
      // Lưu url vào Firestore
      let userId = user.id || user.uid;
      if (!user.id) {
        const q = query(collection(firestore, 'users'), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          userId = snap.docs[0].id;
        }
      }
      await updateUser(userId, { avatarUrl: url });
      login({ ...user, avatarUrl: url, id: userId });
      setSnackbar({ visible: true, message: 'Đã cập nhật ảnh đại diện!', error: false });
    } catch (e) {
      setSnackbar({ visible: true, message: 'Lỗi cập nhật ảnh: ' + (e.message || e), error: true });
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f6f8fa' }}>
      <Text variant="titleLarge" style={{ marginBottom: 12, alignSelf: 'center', fontWeight: 'bold', color: '#007AFF' }}>Tài khoản cá nhân</Text>
      <Card style={{ marginBottom: 16, paddingVertical: 16, alignItems: 'center', borderRadius: 16 }}>
        <TouchableOpacity onPress={handlePickAvatar}>
          {pendingAvatar ? (
            <Avatar.Image size={80} source={{ uri: pendingAvatar }} style={{ backgroundColor: '#e3f2fd', marginBottom: 12 }} />
          ) : avatar ? (
            <Avatar.Image size={80} source={{ uri: avatar }} style={{ backgroundColor: '#e3f2fd', marginBottom: 12 }} />
          ) : (
            <Avatar.Icon size={80} icon="account" style={{ backgroundColor: '#e3f2fd', marginBottom: 12 }} color="#007AFF" />
          )}
        </TouchableOpacity>
        <Text style={{ color: '#007AFF', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }} onPress={handlePickAvatar}>Chạm để đổi ảnh đại diện</Text>
        {pendingAvatar && (
          <Button
            mode="contained"
            onPress={handleSaveAvatar}
            style={{ marginBottom: 8, width: 160, borderRadius: 8, backgroundColor: '#007AFF' }}
            loading={loading}
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            icon="content-save"
          >
            Lưu ảnh
          </Button>
        )}
        <Card.Title
          title={user?.name || 'Chưa có tên'}
          subtitle={user?.email}
          titleStyle={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}
          subtitleStyle={{ textAlign: 'center', color: '#888' }}
          style={{ alignSelf: 'center' }}
        />
        <Text style={{ color: '#007AFF', fontWeight: 'bold', marginBottom: 8 }}>Vai trò: {user?.role === 'student' ? 'Học viên' : user?.role}</Text>
        <Text style={{ color: user?.status === 'active' ? '#43a047' : '#d32f2f', marginBottom: 16 }}>
          Trạng thái: {user?.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
        </Text>
        <Card.Content style={{ width: '100%', alignItems: 'center' }}>
          <TextInput
            label="Tên"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 12, width: 260 }}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleUpdate}
            style={{ marginBottom: 16, width: 200, borderRadius: 8, backgroundColor: '#007AFF' }}
            loading={loading}
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            icon="content-save"
          >
            Cập nhật tên
          </Button>
          <TextInput
            label="Mật khẩu mới"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ marginBottom: 12, width: 260 }}
            mode="outlined"
          />
          <Button
            mode="contained-tonal"
            onPress={handleChangePassword}
            loading={loading}
            style={{ width: 200, borderRadius: 8 }}
            labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
            icon="lock-reset"
          >
            Đổi mật khẩu
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2000}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
} 