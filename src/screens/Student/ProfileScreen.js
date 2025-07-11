import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { updateUser, changePassword } from '../../services/userService';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateUser(user.id, { name });
      setSnackbar({ visible: true, message: 'Đã cập nhật tên!', error: false });
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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Tài khoản cá nhân</Text>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title={user?.email} subtitle={user?.role} />
        <Card.Content>
          <TextInput label="Tên" value={name} onChangeText={setName} style={{ marginBottom: 12 }} />
          <Button mode="contained" onPress={handleUpdate} style={{ marginBottom: 12 }} loading={loading}>Cập nhật tên</Button>
          <TextInput label="Mật khẩu mới" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 12 }} />
          <Button mode="contained" onPress={handleChangePassword} loading={loading}>Đổi mật khẩu</Button>
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