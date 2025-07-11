import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, TextInput, Button, FAB, Dialog, Portal, Snackbar, ActivityIndicator, Avatar, List, IconButton, Chip } from 'react-native-paper';
import { fetchUsers, addUser, updateUser, deleteUser } from '../../services/userService';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', status: 'active' });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, user: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải danh sách người dùng: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : u.status === filter;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditUser(null);
    setForm({ name: '', email: '', role: 'student', status: 'active' });
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setForm(user);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setSnackbar({ visible: true, message: 'Vui lòng nhập đầy đủ tên và email!', error: true });
      return;
    }
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        setSnackbar({ visible: true, message: 'Đã cập nhật người dùng!', error: false });
      } else {
        await addUser(form);
        setSnackbar({ visible: true, message: 'Đã thêm người dùng mới!', error: false });
      }
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể lưu người dùng: ' + error.message, error: true });
    }
  };

  const handleDelete = async (user) => {
    setConfirmDialog({ visible: true, user });
  };

  const confirmDelete = async () => {
    const user = confirmDialog.user;
    setConfirmDialog({ visible: false, user: null });
    try {
      await deleteUser(user.id);
      setSnackbar({ visible: true, message: 'Đã xóa người dùng!', error: false });
      loadUsers();
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể xóa người dùng: ' + error.message, error: true });
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'locked' : 'active';
      await updateUser(user.id, { ...user, status: newStatus });
      setSnackbar({ visible: true, message: `Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản!`, error: false });
      loadUsers();
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể thay đổi trạng thái: ' + error.message, error: true });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f6f8fa' }}>
      <Text variant="titleLarge" style={styles.title}>Quản lý Người dùng</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          mode="outlined"
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm theo tên, email..."
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
        />
        <FAB
          style={styles.addBtn}
          icon="plus"
          color="#fff"
          onPress={openAddModal}
          size="small"
          label="Thêm"
        />
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Chip style={[styles.filterBtn, filter === 'all' && styles.filterActive]} selected={filter === 'all'} onPress={() => setFilter('all')}>Tất cả</Chip>
        <Chip style={[styles.filterBtn, filter === 'active' && styles.filterActive]} selected={filter === 'active'} onPress={() => setFilter('active')}>Đang hoạt động</Chip>
        <Chip style={[styles.filterBtn, filter === 'locked' && styles.filterActive]} selected={filter === 'locked'} onPress={() => setFilter('locked')}>Đã khóa</Chip>
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.userCard} mode="elevated">
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar.Text size={40} label={item.name ? item.name[0].toUpperCase() : '?'} style={{ marginRight: 12, backgroundColor: '#007AFF' }} />
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={styles.userName}>{item.name} <Text style={{ color: '#888', fontSize: 13 }}>({item.role})</Text></Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={{ color: item.status === 'active' ? 'green' : 'red', fontWeight: 'bold' }}>{item.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</Text>
              </View>
              <IconButton icon={item.status === 'active' ? 'lock' : 'lock-open-variant'} iconColor={item.status === 'active' ? 'orange' : 'green'} onPress={() => handleToggleStatus(item)} />
              <IconButton icon="pencil" iconColor="#007AFF" onPress={() => openEditModal(item)} />
              <IconButton icon="delete" iconColor="red" onPress={() => handleDelete(item)} />
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có người dùng nào.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)} style={styles.dialog}>
          <Dialog.Title>{editUser ? 'Sửa người dùng' : 'Thêm người dùng'}</Dialog.Title>
          <Dialog.Content>
            <TextInput mode="outlined" label="Tên" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} style={styles.input} />
            <TextInput mode="outlined" label="Email" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} style={styles.input} />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <Chip style={[styles.filterBtn, form.role === 'student' && styles.filterActive]} selected={form.role === 'student'} onPress={() => setForm(f => ({ ...f, role: 'student' }))}>Học viên</Chip>
              <Chip style={[styles.filterBtn, form.role === 'teacher' && styles.filterActive]} selected={form.role === 'teacher'} onPress={() => setForm(f => ({ ...f, role: 'teacher' }))}>Giáo viên</Chip>
              <Chip style={[styles.filterBtn, form.role === 'admin' && styles.filterActive]} selected={form.role === 'admin'} onPress={() => setForm(f => ({ ...f, role: 'admin' }))}>Admin</Chip>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)} textColor="gray">Hủy</Button>
            <Button onPress={handleSave}>{editUser ? 'Lưu' : 'Thêm'}</Button>
          </Dialog.Actions>
        </Dialog>
        <Dialog visible={confirmDialog.visible} onDismiss={() => setConfirmDialog({ visible: false, user: null })}>
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc muốn xóa tài khoản <Text style={{ fontWeight: 'bold' }}>{confirmDialog.user?.name}</Text>?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, user: null })} textColor="gray">Hủy</Button>
            <Button onPress={confirmDelete} textColor="red">Xóa</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2500}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', marginBottom: 10 },
  input: { marginBottom: 10 },
  addBtn: { marginLeft: 8, backgroundColor: '#007AFF', alignSelf: 'center' },
  filterBtn: { marginRight: 8, borderRadius: 20 },
  filterActive: { backgroundColor: '#007AFF', color: '#fff' },
  userCard: { marginBottom: 10, borderRadius: 12, elevation: 2 },
  userName: { fontWeight: 'bold' },
  userEmail: { color: '#555', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fa' },
  dialog: { borderRadius: 12 },
}); 