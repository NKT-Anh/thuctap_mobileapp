import React from 'react';
import { View, Text } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Admin Dashboard</Text>
      <Text>Chào mừng đến với hệ thống quản trị!</Text>
    </View>
  );
} 