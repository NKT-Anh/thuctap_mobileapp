import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  FAB, 
  Dialog, 
  Portal, 
  Snackbar, 
  ActivityIndicator,
  Chip,
  List,
  IconButton,
  Menu,
  Divider,
  Surface,
  Checkbox,
  Switch
} from 'react-native-paper';
import { fetchRoles, addRole, updateRole, deleteRole, fetchPermissions } from '../../services/roleService';

export default function RoleManagementScreen() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    permissions: [],
    isActive: true,
    isDefault: false,
    color: '#2196F3'
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, role: null });
  const [menuVisible, setMenuVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  const defaultPermissions = [
    { id: 'read:users', name: 'Xem người dùng', category: 'users' },
    { id: 'write:users', name: 'Quản lý người dùng', category: 'users' },
    { id: 'read:exams', name: 'Xem đề thi', category: 'exams' },
    { id: 'write:exams', name: 'Quản lý đề thi', category: 'exams' },
    { id: 'read:lessons', name: 'Xem bài học', category: 'lessons' },
    { id: 'write:lessons', name: 'Quản lý bài học', category: 'lessons' },
    { id: 'read:questions', name: 'Xem câu hỏi', category: 'questions' },
    { id: 'write:questions', name: 'Quản lý câu hỏi', category: 'questions' },
    { id: 'read:statistics', name: 'Xem thống kê', category: 'statistics' },
    { id: 'write:statistics', name: 'Quản lý thống kê', category: 'statistics' },
    { id: 'read:config', name: 'Xem cấu hình', category: 'config' },
    { id: 'write:config', name: 'Quản lý cấu hình', category: 'config' },
    { id: 'admin:all', name: 'Toàn quyền admin', category: 'admin' }
  ];

  const roleColors = [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', 
    '#9C27B0', '#00BCD4', '#795548', '#607D8B'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        fetchRoles().catch(() => []),
        fetchPermissions().catch(() => defaultPermissions)
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải dữ liệu: ' + error.message, 
        error: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchSearch = 
      role.name?.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : 
                       filter === 'active' ? role.isActive : 
                       filter === 'default' ? role.isDefault : 
                       false;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditRole(null);
    setForm({
      name: '',
      description: '',
      permissions: [],
      isActive: true,
      isDefault: false,
      color: roleColors[0]
    });
    setModalVisible(true);
  };

  const openEditModal = (role) => {
    setEditRole(role);
    setForm(role);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setSnackbar({ visible: true, message: 'Vui lòng nhập tên vai trò', error: true });
      return;
    }

    try {
      const roleData = {
        ...form,
        updatedAt: new Date()
      };

      if (editRole) {
        await updateRole(editRole.id, roleData);
        setSnackbar({ visible: true, message: 'Cập nhật vai trò thành công!', error: false });
      } else {
        roleData.createdAt = new Date();
        await addRole(roleData);
        setSnackbar({ visible: true, message: 'Thêm vai trò thành công!', error: false });
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi lưu vai trò: ' + error.message, 
        error: true 
      });
    }
  };

  const handleDelete = async (role) => {
    try {
      await deleteRole(role.id);
      setSnackbar({ visible: true, message: 'Xóa vai trò thành công!', error: false });
      loadData();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi xóa vai trò: ' + error.message, 
        error: true 
      });
    }
    setConfirmDialog({ visible: false, role: null });
  };

  const togglePermission = (permissionId) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getPermissionsByCategory = () => {
    const grouped = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const renderRoleItem = ({ item }) => (
    <Card style={styles.roleCard}>
      <Card.Content>
        <View style={styles.roleHeader}>
          <View style={styles.roleInfo}>
            <View style={styles.titleRow}>
              <View 
                style={[styles.colorIndicator, { backgroundColor: item.color }]} 
              />
              <View style={styles.titleContent}>
                <Title style={styles.roleTitle}>{item.name}</Title>
                <Text style={styles.roleDescription}>{item.description}</Text>
              </View>
            </View>
          </View>
          <View style={styles.roleActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => {
                updateRole(item.id, { ...item, isActive: !item.isActive });
                loadData();
              }}
            />
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => setConfirmDialog({ visible: true, role: item })}
              disabled={item.isDefault}
            />
          </View>
        </View>

        <View style={styles.roleDetails}>
          {item.isDefault && (
            <Chip mode="outlined" style={styles.defaultChip}>
              Mặc định
            </Chip>
          )}
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: item.isActive ? '#4caf50' : '#9e9e9e' }]}
            textStyle={{ color: item.isActive ? '#4caf50' : '#9e9e9e' }}
          >
            {item.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
          </Chip>
          <Chip mode="outlined" style={styles.detailChip}>
            {item.permissions?.length || 0} quyền
          </Chip>
        </View>

        {item.permissions && item.permissions.length > 0 && (
          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsTitle}>Quyền hạn:</Text>
            <View style={styles.permissionsList}>
              {item.permissions.slice(0, 4).map((permissionId, idx) => {
                const permission = permissions.find(p => p.id === permissionId);
                return permission ? (
                  <Chip key={idx} mode="outlined" style={styles.permissionChip} compact>
                    {permission.name}
                  </Chip>
                ) : null;
              })}
              {item.permissions.length > 4 && (
                <Text style={styles.morePermissionsText}>
                  +{item.permissions.length - 4} quyền khác
                </Text>
              )}
            </View>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải danh sách vai trò...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.searchSection}>
        <TextInput
          mode="outlined"
          label="Tìm kiếm vai trò..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)}>
              Lọc: {filter === 'all' ? 'Tất cả' : filter}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setFilter('all'); setMenuVisible(false); }} title="Tất cả" />
          <Menu.Item onPress={() => { setFilter('active'); setMenuVisible(false); }} title="Hoạt động" />
          <Menu.Item onPress={() => { setFilter('default'); setMenuVisible(false); }} title="Mặc định" />
        </Menu>
      </Surface>

      <FlatList
        data={filteredRoles}
        renderItem={renderRoleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có vai trò nào</Text>
            <Button mode="contained" onPress={openAddModal} style={styles.emptyButton}>
              Tạo vai trò đầu tiên
            </Button>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddModal}
        label="Thêm vai trò"
      />

      {/* Modal thêm/sửa vai trò */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{editRole ? 'Sửa vai trò' : 'Thêm vai trò mới'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                mode="outlined"
                label="Tên vai trò *"
                value={form.name}
                onChangeText={(text) => setForm({...form, name: text})}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Mô tả"
                value={form.description}
                onChangeText={(text) => setForm({...form, description: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <Text style={styles.sectionTitle}>Màu sắc:</Text>
              <View style={styles.colorPicker}>
                {roleColors.map((color, index) => (
                  <Button
                    key={index}
                    mode={form.color === color ? "contained" : "outlined"}
                    style={[styles.colorButton, { backgroundColor: form.color === color ? color : 'transparent', borderColor: color }]}
                    onPress={() => setForm({...form, color})}
                  >
                    {' '}
                  </Button>
                ))}
              </View>

              <List.Item
                title="Vai trò hoạt động"
                right={() => (
                  <Switch
                    value={form.isActive}
                    onValueChange={(value) => setForm({...form, isActive: value})}
                  />
                )}
              />

              <List.Item
                title="Vai trò mặc định"
                description="Tự động gán cho người dùng mới"
                right={() => (
                  <Switch
                    value={form.isDefault}
                    onValueChange={(value) => setForm({...form, isDefault: value})}
                  />
                )}
              />

              <Button 
                mode="outlined" 
                onPress={() => setPermissionModalVisible(true)}
                style={styles.permissionButton}
                icon="shield-check"
              >
                Chọn quyền hạn ({form.permissions.length})
              </Button>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Hủy</Button>
            <Button onPress={handleSave}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Modal chọn quyền */}
        <Dialog visible={permissionModalVisible} onDismiss={() => setPermissionModalVisible(false)}>
          <Dialog.Title>Chọn quyền hạn</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.permissionModalContent}>
              {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <View key={category} style={styles.permissionCategory}>
                  <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
                  {categoryPermissions.map((permission) => (
                    <List.Item
                      key={permission.id}
                      title={permission.name}
                      description={permission.id}
                      left={() => (
                        <Checkbox
                          status={form.permissions.includes(permission.id) ? 'checked' : 'unchecked'}
                          onPress={() => togglePermission(permission.id)}
                        />
                      )}
                      onPress={() => togglePermission(permission.id)}
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPermissionModalVisible(false)}>Đóng</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={confirmDialog.visible} 
          onDismiss={() => setConfirmDialog({ visible: false, role: null })}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc chắn muốn xóa vai trò "{confirmDialog.role?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, role: null })}>
              Hủy
            </Button>
            <Button onPress={() => handleDelete(confirmDialog.role)}>
              Xóa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={snackbar.error ? styles.errorSnackbar : styles.successSnackbar}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  roleCard: {
    marginBottom: 12,
    elevation: 2,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roleInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  roleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  defaultChip: {
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800',
  },
  statusChip: {
    marginRight: 4,
  },
  detailChip: {
    marginRight: 4,
  },
  permissionsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  permissionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  permissionChip: {
    backgroundColor: '#e8f5e8',
  },
  morePermissionsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    paddingHorizontal: 24,
  },
  permissionModalContent: {
    paddingHorizontal: 24,
    maxHeight: 400,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  permissionButton: {
    marginTop: 16,
  },
  permissionCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
}); 