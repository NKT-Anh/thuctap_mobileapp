import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LessonListScreen from '../screens/Student/LessonListScreen';
import PracticeScreen from '../screens/Student/PracticeScreen';
import MockExamScreen from '../screens/Student/MockExamScreen';
import OfficialExamScreen from '../screens/Student/OfficialExamScreen';
import ProgressScreen from '../screens/Student/ProgressScreen';
import NotificationScreen from '../screens/Student/NotificationScreen';
import ChatScreen from '../screens/Student/ChatScreen';
import ProfileScreen from '../screens/Student/ProfileScreen';
import LessonDetailScreen from '../screens/Student/LessonDetailScreen';
import PracticeResultScreen from '../screens/Student/PracticeResultScreen';
import MockExamResultScreen from '../screens/Student/MockExamResultScreen';
import OfficialExamResultScreen from '../screens/Student/OfficialExamResultScreen';
import MyClassesScreen from '../screens/Student/MyClassesScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function StudentNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <Drawer.Navigator
        initialRouteName="LessonList"
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: true,
          drawerStyle: { backgroundColor: '#fff', width: 280 },
          drawerActiveTintColor: '#007AFF',
          drawerInactiveTintColor: '#333',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Drawer.Screen name="MyClasses" component={MyClassesScreen} options={{ title: 'Lớp của tôi', drawerIcon: ({ color, size }) => (<Ionicons name="school" size={size} color={color} />) }} />
        <Drawer.Screen name="LessonList" component={LessonListScreen} options={{ title: 'Bài học', drawerIcon: ({ color, size }) => (<Ionicons name="book" size={size} color={color} />) }} />
        <Drawer.Screen name="LessonDetail" component={LessonDetailScreen} options={{ drawerItemStyle: { display: 'none' }, title: 'Chi tiết Bài học' }} />
        <Drawer.Screen name="Practice" component={PracticeScreen} options={{ title: 'Luyện tập', drawerIcon: ({ color, size }) => (<Ionicons name="create" size={size} color={color} />) }} />
        <Drawer.Screen name="PracticeResult" component={PracticeResultScreen} options={{ drawerItemStyle: { display: 'none' }, title: 'Kết quả luyện tập' }} />
        <Drawer.Screen name="MockExam" component={MockExamScreen} options={{ title: 'Thi thử', drawerIcon: ({ color, size }) => (<Ionicons name="timer" size={size} color={color} />) }} />
        <Drawer.Screen name="MockExamResult" component={MockExamResultScreen} options={{ drawerItemStyle: { display: 'none' }, title: 'Kết quả Thi thử' }} />
        <Drawer.Screen name="OfficialExam" component={OfficialExamScreen} options={{ title: 'Thi chính thức', drawerIcon: ({ color, size }) => (<Ionicons name="medal" size={size} color={color} />) }} />
        <Drawer.Screen name="OfficialExamResult" component={OfficialExamResultScreen} options={{ drawerItemStyle: { display: 'none' }, title: 'Kết quả Thi chính thức' }} />
        <Drawer.Screen name="Progress" component={ProgressScreen} options={{ title: 'Tiến độ', drawerIcon: ({ color, size }) => (<Ionicons name="stats-chart" size={size} color={color} />) }} />
        <Drawer.Screen name="Notification" component={NotificationScreen} options={{ title: 'Thông báo', drawerIcon: ({ color, size }) => (<Ionicons name="notifications" size={size} color={color} />) }} />
        <Drawer.Screen name="Chat" component={ChatScreen} options={{ title: 'Trao đổi', drawerIcon: ({ color, size }) => (<Ionicons name="chatbubbles" size={size} color={color} />) }} />
        <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản', drawerIcon: ({ color, size }) => (<Ionicons name="person" size={size} color={color} />) }} />
      </Drawer.Navigator>
    </SafeAreaView>
  );
} 