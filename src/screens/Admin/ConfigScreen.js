import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Card, 
  Title, 
  List, 
  Switch, 
  TextInput, 
  Button, 
  Snackbar, 
  ActivityIndicator,
  Dialog,
  Portal,
  Text,
  Divider,
  Chip
} from 'react-native-paper';
import { fetchConfig, updateConfig } from '../../services/configService';

export default function ConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    examTimeLimit: 60,
    maxAttempts: 3,
    allowRetake: true,
    showResultsImmediately: false,
    enableNotifications: true,
    maxUploadSize: 10,
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: false,
    minimumPasswordLength: 6,
    sessionTimeout: 30,
    maxStudentsPerClass: 50
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, title: '', message: '', action: null });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const configData = await fetchConfig();
      setConfig({ ...config, ...configData });
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải cấu hình: ' + error.message, 
        error: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await updateConfig(config);
      setSnackbar({ 
        visible: true, 
        message: 'Cấu hình đã được lưu thành công!', 
        error: false 
      });
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi lưu cấu hình: ' + error.message, 
        error: true 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBooleanChange = (key, value) => {
    if (key === 'maintenanceMode' && value) {
      setConfirmDialog({
        visible: true,
        title: 'Kích hoạt chế độ bảo trì',
        message: 'Hệ thống sẽ ngừng hoạt động và chỉ admin có thể truy cập. Bạn có chắc chắn?',
        action: () => setConfig(prev => ({ ...prev, [key]: value }))
      });
    } else {
      setConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleNumberChange = (key, value) => {
    const numberValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, [key]: numberValue }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải cấu hình...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Cấu hình hệ thống</Title>
          
          {/* Cấu hình bài thi */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Cấu hình bài thi</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Thời gian làm bài (phút)</Text>
              <TextInput
                mode="outlined"
                value={config.examTimeLimit.toString()}
                onChangeText={(value) => handleNumberChange('examTimeLimit', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Số lần làm bài tối đa</Text>
              <TextInput
                mode="outlined"
                value={config.maxAttempts.toString()}
                onChangeText={(value) => handleNumberChange('maxAttempts', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>

            <List.Item
              title="Cho phép làm lại bài thi"
              right={() => (
                <Switch
                  value={config.allowRetake}
                  onValueChange={(value) => handleBooleanChange('allowRetake', value)}
                />
              )}
            />

            <List.Item
              title="Hiển thị kết quả ngay lập tức"
              right={() => (
                <Switch
                  value={config.showResultsImmediately}
                  onValueChange={(value) => handleBooleanChange('showResultsImmediately', value)}
                />
              )}
            />
          </View>

          {/* Cấu hình lớp học */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Cấu hình lớp học</Text>
            <Divider style={styles.divider} />
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Số học sinh tối đa mỗi lớp</Text>
              <TextInput
                mode="outlined"
                value={config.maxStudentsPerClass.toString()}
                onChangeText={(value) => handleNumberChange('maxStudentsPerClass', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>
          </View>

          {/* Cấu hình hệ thống */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Cấu hình hệ thống</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Bật thông báo"
              right={() => (
                <Switch
                  value={config.enableNotifications}
                  onValueChange={(value) => handleBooleanChange('enableNotifications', value)}
                />
              )}
            />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Kích thước upload tối đa (MB)</Text>
              <TextInput
                mode="outlined"
                value={config.maxUploadSize.toString()}
                onChangeText={(value) => handleNumberChange('maxUploadSize', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Thời gian hết phiên (phút)</Text>
              <TextInput
                mode="outlined"
                value={config.sessionTimeout.toString()}
                onChangeText={(value) => handleNumberChange('sessionTimeout', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>

            <List.Item
              title="Chế độ bảo trì"
              description="Hệ thống sẽ tạm ngừng hoạt động"
              right={() => (
                <View style={styles.maintenanceSwitch}>
                  <Switch
                    value={config.maintenanceMode}
                    onValueChange={(value) => handleBooleanChange('maintenanceMode', value)}
                  />
                  {config.maintenanceMode && <Chip mode="outlined" textStyle={{ color: '#f44336' }}>ĐANG BẢO TRÌ</Chip>}
                </View>
              )}
            />
          </View>

          {/* Cấu hình người dùng */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Cấu hình người dùng</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="Cho phép đăng ký tài khoản mới"
              right={() => (
                <Switch
                  value={config.registrationEnabled}
                  onValueChange={(value) => handleBooleanChange('registrationEnabled', value)}
                />
              )}
            />

            <List.Item
              title="Yêu cầu xác thực email"
              right={() => (
                <Switch
                  value={config.emailVerificationRequired}
                  onValueChange={(value) => handleBooleanChange('emailVerificationRequired', value)}
                />
              )}
            />

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Độ dài mật khẩu tối thiểu</Text>
              <TextInput
                mode="outlined"
                value={config.minimumPasswordLength.toString()}
                onChangeText={(value) => handleNumberChange('minimumPasswordLength', value)}
                keyboardType="numeric"
                style={styles.numberInput}
              />
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSaveConfig}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            icon="content-save"
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={confirmDialog.visible} onDismiss={() => setConfirmDialog({ ...confirmDialog, visible: false })}>
          <Dialog.Title>{confirmDialog.title}</Dialog.Title>
          <Dialog.Content>
            <Text>{confirmDialog.message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ ...confirmDialog, visible: false })}>
              Hủy
            </Button>
            <Button 
              onPress={() => {
                confirmDialog.action && confirmDialog.action();
                setConfirmDialog({ ...confirmDialog, visible: false });
              }}
            >
              Xác nhận
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
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
  card: {
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  numberInput: {
    width: 120,
  },
  maintenanceSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
}); 