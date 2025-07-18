import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/Admin/DashboardScreen';
import UserManagementScreen from '../screens/Admin/UserManagementScreen';
import KeyManagementScreen from '../screens/Admin/KeyManagementScreen';
import QuestionBankScreen from '../screens/Admin/QuestionBankScreen';
import ExamManagementScreen from '../screens/Admin/ExamManagementScreen';
import LessonManagementScreen from '../screens/Admin/LessonManagementScreen';
import StatisticScreen from '../screens/Admin/StatisticScreen';
import NotificationScreen from '../screens/Admin/NotificationScreen';
import RoleManagementScreen from '../screens/Admin/RoleManagementScreen';
import ConfigScreen from '../screens/Admin/ConfigScreen';
import { useAuth } from '../context/AuthContext';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
      <DrawerItemList {...props} />
      <DrawerItem
        label={() => <Text style={{ color: 'red', fontWeight: 'bold' }}>Đăng xuất</Text>}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

export default function AppNavigator() {
  return (
    
      <Drawer.Navigator 
        initialRouteName="Dashboard"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          headerLeft: () => null, // Ẩn nút hamburger mặc định
          drawerStyle: {
            backgroundColor: '#fff',
            width: 280,
          },
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: '#333',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Drawer.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ 
            title: 'Tổng quan',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Users" 
          component={UserManagementScreen} 
          options={{ 
            title: 'Quản lý Người dùng',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Keys" 
          component={KeyManagementScreen} 
          options={{ 
            title: 'Quản lý Key',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="key" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Questions" 
          component={QuestionBankScreen} 
          options={{ 
            title: 'Ngân hàng Câu hỏi',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="help-circle" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Exams" 
          component={ExamManagementScreen} 
          options={{ 
            title: 'Quản lý Đề thi',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Lessons" 
          component={LessonManagementScreen} 
          options={{ 
            title: 'Quản lý Bài học',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Statistics" 
          component={StatisticScreen} 
          options={{ 
            title: 'Thống kê & Báo cáo',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Notifications" 
          component={NotificationScreen} 
          options={{ 
            title: 'Thông báo & Tin tức',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Roles" 
          component={RoleManagementScreen} 
          options={{ 
            title: 'Quản lý Phân quyền',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield" size={size} color={color} />
            ),
          }} 
        />
        <Drawer.Screen 
          name="Config" 
          component={ConfigScreen} 
          options={{ 
            title: 'Cấu hình hệ thống',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }} 
        />
      </Drawer.Navigator>
  );
} 