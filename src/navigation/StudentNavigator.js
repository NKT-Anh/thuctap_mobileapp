import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import MyClassesScreen from '../screens/Student/MyClassesScreen';
import LessonListScreen from '../screens/Student/LessonListScreen';
import NotificationScreen from '../screens/Student/NotificationScreen';
import SettingScreen from '../screens/Student/SettingScreen';
import ProfileScreen from '../screens/Student/ProfileScreen';
import ProgressScreen from '../screens/Student/ProgressScreen';
import ChatScreen from '../screens/Student/ChatScreen';
import JoinClassScreen from '../screens/Student/JoinClassScreen';
import LessonDetailScreen from '../screens/Student/LessonDetailScreen';
import MockExamScreen from '../screens/Student/MockExamScreen';
import OfficialExamScreen from '../screens/Student/OfficialExamScreen';
import OfficialExamResultScreen from '../screens/Student/OfficialExamResultScreen';
import ExamTypeScreen from '../screens/Student/ExamTypeScreen';
import OfficialExamListScreen from '../screens/Student/OfficialExamListScreen';
import MockExamListScreen from '../screens/Student/MockExamListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MyClasses"
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 20 },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          paddingBottom: 5,
          height: 60,
          borderTopColor: '#eee',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'MyClasses':
              iconName = 'home';
              break;
            case 'Lessons':
              iconName = 'book';
              break;
            case 'ExamType':
              iconName = 'clipboard-outline'; 
              break;
            case 'Notification':
              iconName = 'notifications';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="MyClasses"
        component={MyClassesScreen}
        options={{
          headerTitle: 'Lớp học của tôi',
          tabBarLabel: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="Lessons"
        component={LessonListScreen}
        options={{
          headerTitle: 'Bài học',
          tabBarLabel: 'Bài học',
        }}
      />
      <Tab.Screen
        name="ExamType"
        component={ExamTypeScreen}
        options={{
          headerTitle: 'Ôn thi',
          tabBarLabel: 'Ôn thi',
        }}
      />
      <Tab.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          headerTitle: 'Thông báo hệ thống',
          tabBarLabel: 'Thông báo',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          headerTitle: 'Cài đặt & Tài khoản',
          tabBarLabel: 'Cài đặt',
        }}
      />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Tiến độ học' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Trao đổi' }} />
      <Stack.Screen name="JoinClass" component={JoinClassScreen} options={{ title: 'Tham gia lớp' }} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ title: 'Chi tiết bài học' }} />
      <Stack.Screen name="OfficialExam" component={OfficialExamScreen} options={{ title: 'Thi chính thức' }} />
      <Stack.Screen name="OfficialExamResult" component={OfficialExamResultScreen} options={{ title: 'Kết quả Thi chính thức' }} />
      <Stack.Screen name="ExamType" component={ExamTypeScreen} options={{ title: 'Chọn kiểu thi' }} />
      <Stack.Screen name="OfficialExamList" component={OfficialExamListScreen} options={{ title: 'Danh sách bài kiểm tra' }} />
      <Stack.Screen name="MockExamList" component={MockExamListScreen} options={{ title: 'Danh sách bài luyện tập' }} />
      <Stack.Screen name="MockExam" component={MockExamScreen} options={{ title: 'Luyện tập' }} />

    </Stack.Navigator>
  );
}
