import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingItem = ({ label, onPress, danger = false }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [
    styles.item,
    danger && styles.dangerItem,
    pressed && styles.itemPressed
  ]}>
    <Text style={[styles.itemText, danger && styles.dangerText]}>{label}</Text>
  </Pressable>
);

export default function SettingScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Surface style={styles.section}>
          <SettingItem label="Tài khoản" onPress={() => navigation.navigate('Profile')} />
          <SettingItem label="Tiến độ học" onPress={() => navigation.navigate('Progress')} />
          <SettingItem label="Trao đổi" onPress={() => navigation.navigate('Chat')} />
          <SettingItem label="Tham gia lớp" onPress={() => navigation.navigate('JoinClass')} />
        </Surface>

        <Surface style={[styles.section, styles.logoutSection]}>
          <SettingItem label="Đăng xuất" danger onPress={logout} />
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    paddingVertical: 4,
  },
  logoutSection: {
    backgroundColor: '#fff0f0',
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  itemPressed: {
    backgroundColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  dangerItem: {
    backgroundColor: '#fff0f0',
  },
  dangerText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
});
