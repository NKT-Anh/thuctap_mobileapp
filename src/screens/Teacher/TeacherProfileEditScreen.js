import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

export default function TeacherProfileEditScreen({ navigation }) {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [description, setDescription] = useState(user?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { name, phone, description });
      // Cập nhật context
      login({ ...user, name, phone, description });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>Chỉnh sửa thông tin cá nhân</Text>
      <TextInput
        label="Họ tên"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={{ marginBottom: 16 }}
      />
      <TextInput
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ marginBottom: 24 }}
      />
      <Button mode="contained" onPress={handleSave} loading={saving}>Lưu thay đổi</Button>
    </View>
  );
} 