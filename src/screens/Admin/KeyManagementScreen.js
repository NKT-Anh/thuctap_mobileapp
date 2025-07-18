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
  Switch
} from 'react-native-paper';
import { fetchKeys, addKey, updateKey, deleteKey, generateApiKey } from '../../services/keyService';

export default function KeyManagementScreen() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editKey, setEditKey] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'api',
    permissions: [],
    expiresAt: '',
    isActive: true,
    maxUsage: 1000,
    currentUsage: 0
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, key: null });
  const [menuVisible, setMenuVisible] = useState(false);
  const [generating, setGenerating] = useState(false);

  const keyTypes = [
    { value: 'api', label: 'API Key' },
    { value: 'access', label: 'Access Token' },
    { value: 'refresh', label: 'Refresh Token' },
    { value: 'webhook', label: 'Webhook Secret' }
  ];

  const permissionOptions = [
    'read:users',
    'write:users',
    'read:exams',
    'write:exams',
    'read:lessons',
    'write:lessons',
    'read:questions',
    'write:questions',
    'admin:all'
  ];

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const data = await fetchKeys();
      setKeys(data || []);
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải danh sách key: ' + error.message, 
        error: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredKeys = keys.filter(key => {
    const matchSearch = 
      key.name?.toLowerCase().includes(search.toLowerCase()) ||
      key.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : 
                       filter === 'active' ? key.isActive : 
                       filter === 'expired' ? new Date(key.expiresAt) < new Date() : 
                       key.type === filter;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditKey(null);
    setForm({
      name: '',
      description: '',
      type: 'api',
      permissions: [],
      expiresAt: '',
      isActive: true,
      maxUsage: 1000,
      currentUsage: 0
    });
    setModalVisible(true);
  };

  const openEditModal = (key) => {
    setEditKey(key);
    setForm({
      ...key,
      expiresAt: key.expiresAt ? new Date(key.expiresAt.seconds * 1000).toISOString().split('T')[0] : ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setSnackbar({ visible: true, message: 'Vui lòng nhập tên key', error: true });
      return;
    }

    try {
      const keyData = {
        ...form,
        maxUsage: parseInt(form.maxUsage) || 1000,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        updatedAt: new Date()
      };

      if (editKey) {
        await updateKey(editKey.id, keyData);
        setSnackbar({ visible: true, message: 'Cập nhật key thành công!', error: false });
      } else {
        // Tạo key mới với API key được sinh tự động
        keyData.keyValue = await generateApiKey();
        keyData.createdAt = new Date();
        await addKey(keyData);
        setSnackbar({ visible: true, message: 'Thêm key thành công!', error: false });
      }

      setModalVisible(false);
      loadKeys();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi lưu key: ' + error.message, 
        error: true 
      });
    }
  };

  const handleDelete = async (key) => {
    try {
      await deleteKey(key.id);
      setSnackbar({ visible: true, message: 'Xóa key thành công!', error: false });
      loadKeys();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi xóa key: ' + error.message, 
        error: true 
      });
    }
    setConfirmDialog({ visible: false, key: null });
  };

  const handleGenerateNewKey = async (keyId) => {
    try {
      setGenerating(true);
      const newKeyValue = await generateApiKey();
      await updateKey(keyId, { 
        keyValue: newKeyValue, 
        updatedAt: new Date(),
        currentUsage: 0 // Reset usage counter
      });
      setSnackbar({ visible: true, message: 'Tạo key mới thành công!', error: false });
      loadKeys();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi tạo key mới: ' + error.message, 
        error: true 
      });
    } finally {
      setGenerating(false);
    }
  };

  const toggleKeyStatus = async (keyId, currentStatus) => {
    try {
      await updateKey(keyId, { 
        isActive: !currentStatus, 
        updatedAt: new Date() 
      });
      setSnackbar({ 
        visible: true, 
        message: `${!currentStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} key thành công!`, 
        error: false 
      });
      loadKeys();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi thay đổi trạng thái key: ' + error.message, 
        error: true 
      });
    }
  };

  const getStatusColor = (key) => {
    if (!key.isActive) return '#9e9e9e';
    if (key.expiresAt && new Date(key.expiresAt.seconds * 1000) < new Date()) return '#f44336';
    if (key.currentUsage >= key.maxUsage) return '#ff9800';
    return '#4caf50';
  };

  const getStatusText = (key) => {
    if (!key.isActive) return 'Vô hiệu hóa';
    if (key.expiresAt && new Date(key.expiresAt.seconds * 1000) < new Date()) return 'Hết hạn';
    if (key.currentUsage >= key.maxUsage) return 'Vượt giới hạn';
    return 'Hoạt động';
  };

  const getTypeText = (type) => {
    const typeObj = keyTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Không giới hạn';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('vi-VN');
  };

  const renderKeyItem = ({ item }) => (
    <Card style={styles.keyCard}>
      <Card.Content>
        <View style={styles.keyHeader}>
          <View style={styles.keyInfo}>
            <Title style={styles.keyTitle}>{item.name}</Title>
            <Text style={styles.keyType}>{getTypeText(item.type)}</Text>
          </View>
          <View style={styles.keyActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleKeyStatus(item.id, item.isActive)}
            />
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => setConfirmDialog({ visible: true, key: item })}
            />
          </View>
        </View>

        <Text style={styles.keyDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.keyDetails}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(item) }]}
            textStyle={{ color: getStatusColor(item) }}
          >
            {getStatusText(item)}
          </Chip>
        </View>

        <View style={styles.keyStats}>
          <Text style={styles.statText}>📊 {item.currentUsage}/{item.maxUsage} lượt</Text>
          <Text style={styles.statText}>📅 Hết hạn: {formatDate(item.expiresAt)}</Text>
        </View>

        <View style={styles.keyValue}>
          <Text style={styles.keyValueLabel}>Key:</Text>
          <Text style={styles.keyValueText} numberOfLines={1}>
            {item.keyValue ? `${item.keyValue.substring(0, 20)}...` : 'Chưa tạo'}
          </Text>
          <Button 
            mode="outlined" 
            compact 
            onPress={() => handleGenerateNewKey(item.id)}
            loading={generating}
            disabled={generating}
          >
            Tạo mới
          </Button>
        </View>

        {item.permissions && item.permissions.length > 0 && (
          <View style={styles.permissionsContainer}>
            <Text style={styles.permissionsTitle}>Quyền:</Text>
            <View style={styles.permissionsList}>
              {item.permissions.slice(0, 3).map((permission, idx) => (
                <Chip key={idx} mode="outlined" style={styles.permissionChip} compact>
                  {permission}
                </Chip>
              ))}
              {item.permissions.length > 3 && (
                <Text style={styles.morePermissionsText}>+{item.permissions.length - 3} quyền khác</Text>
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
        <Text style={styles.loadingText}>Đang tải danh sách key...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.searchSection}>
        <TextInput
          mode="outlined"
          label="Tìm kiếm key..."
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
          <Menu.Item onPress={() => { setFilter('expired'); setMenuVisible(false); }} title="Hết hạn" />
          <Menu.Item onPress={() => { setFilter('api'); setMenuVisible(false); }} title="API Key" />
          <Menu.Item onPress={() => { setFilter('access'); setMenuVisible(false); }} title="Access Token" />
        </Menu>
      </Surface>

      <FlatList
        data={filteredKeys}
        renderItem={renderKeyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có key nào</Text>
            <Button mode="contained" onPress={openAddModal} style={styles.emptyButton}>
              Tạo key đầu tiên
            </Button>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddModal}
        label="Thêm key"
      />

      {/* Modal thêm/sửa key */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{editKey ? 'Sửa key' : 'Thêm key mới'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                mode="outlined"
                label="Tên key *"
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

              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label="Giới hạn sử dụng"
                  value={form.maxUsage.toString()}
                  onChangeText={(text) => setForm({...form, maxUsage: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                />

                <TextInput
                  mode="outlined"
                  label="Ngày hết hạn"
                  value={form.expiresAt}
                  onChangeText={(text) => setForm({...form, expiresAt: text})}
                  placeholder="YYYY-MM-DD"
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

              <List.Item
                title="Kích hoạt key"
                right={() => (
                  <Switch
                    value={form.isActive}
                    onValueChange={(value) => setForm({...form, isActive: value})}
                  />
                )}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Hủy</Button>
            <Button onPress={handleSave}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={confirmDialog.visible} 
          onDismiss={() => setConfirmDialog({ visible: false, key: null })}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc chắn muốn xóa key "{confirmDialog.key?.name}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, key: null })}>
              Hủy
            </Button>
            <Button onPress={() => handleDelete(confirmDialog.key)}>
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
  keyCard: {
    marginBottom: 12,
    elevation: 2,
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  keyInfo: {
    flex: 1,
  },
  keyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  keyType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyDescription: {
    marginVertical: 8,
    color: '#333',
  },
  keyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  statusChip: {
    marginRight: 4,
  },
  keyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  keyValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  keyValueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  keyValueText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  permissionsContainer: {
    marginTop: 8,
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
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
}); 