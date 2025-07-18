import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeacherDashboardScreen from '../screens/Teacher/TeacherDashboardScreen';
import TeacherQuestionBankScreen from '../screens/Teacher/TeacherQuestionBankScreen';
import TeacherExamManagementScreen from '../screens/Teacher/TeacherExamManagementScreen';
import TeacherLessonManagementScreen from '../screens/Teacher/TeacherLessonManagementScreen';
import TeacherStudentTrackingScreen from '../screens/Teacher/TeacherStudentTrackingScreen';
import TeacherNotificationScreen from '../screens/Teacher/TeacherNotificationScreen';
import TeacherClassManagementScreen from '../screens/Teacher/TeacherClassManagementScreen';
import TeacherStatisticScreen from '../screens/Teacher/TeacherStatisticScreen';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import TeacherClassDetailScreen from '../screens/Teacher/TeacherClassDetailScreen';
import TeacherChatScreen from '../screens/Teacher/TeacherChatScreen';
import TeacherChatDetailScreen from '../screens/Teacher/TeacherChatDetailScreen';
import TeacherProfileEditScreen from '../screens/Teacher/TeacherProfileEditScreen';
import { useNotification } from '../context/AuthContext';
const Tab = createBottomTabNavigator();

const ExamStack = createStackNavigator();
function ExamTabNavigator() {
  return (
    <ExamStack.Navigator screenOptions={{ headerShown: false }}>
      <ExamStack.Screen name="ExamMain" component={TeacherExamManagementScreen} />
      <ExamStack.Screen name="QuestionBank" component={TeacherQuestionBankScreen} />
    </ExamStack.Navigator>
  );
}

const MoreStack = createStackNavigator();
function MoreTabNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="StudentTracking" component={TeacherStudentTrackingScreen} />
      <MoreStack.Screen name="Statistic" component={TeacherStatisticScreen} />
      <MoreStack.Screen name="Notification" component={TeacherNotificationScreen} />
    </MoreStack.Navigator>
  );
}

function MeScreen({ navigation }) {
  const { user, logout } = useAuth();
  return (
    <View style={styles.meContainer}>
      <View style={styles.profileBox}>
        <View style={styles.avatar} />
        <Text style={styles.meName}>{user?.name || 'Tên giáo viên'}</Text>
        <Text style={styles.meEmail}>{user?.email || 'Email'}</Text>
      </View>
      <View style={styles.meBtnGroup}>
        <Button mode="contained-tonal" style={styles.meBtn} icon="account-edit" onPress={() => navigation.navigate('ProfileEdit')}>Chỉnh sửa thông tin</Button>
        <Button mode="contained-tonal" style={styles.meBtn} icon="bell-outline" onPress={() => navigation.navigate('Notification')}>Thông báo</Button>
        <Button mode="contained-tonal" style={styles.meBtn} icon="chart-bar" onPress={() => navigation.navigate('Statistic')}>Thống kê</Button>
        <Button mode="contained-tonal" style={styles.meBtn} icon="account-group-outline" onPress={() => navigation.navigate('StudentTracking')}>Theo dõi học viên</Button>
        <Button mode="contained-tonal" style={styles.meBtn} icon="help-circle-outline" onPress={() => navigation.navigate('QuestionBank')}>Tạo câu hỏi</Button>
        <Button mode="contained" style={[styles.meBtn, { backgroundColor: '#d32f2f' }]} icon="logout" onPress={logout}>Đăng xuất</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6f8fa', paddingTop: 40 },
  profileBox: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e0e0e0', marginBottom: 12 },
  meName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  meEmail: { fontSize: 14, color: '#666', marginBottom: 8 },
  meBtnGroup: { width: '100%', alignItems: 'center' },
  meBtn: { width: 240, marginBottom: 16, borderRadius: 8, justifyContent: 'center' },
});

const MeStack = createStackNavigator();
function MeTabNavigator() {
  return (
    <MeStack.Navigator>
      <MeStack.Screen name="MeMain" component={MeScreen} options={{ title: 'Tôi', headerShown: false }} />
      <MeStack.Screen name="Notification" component={TeacherNotificationScreen} options={{ headerShown: false }} />
      <MeStack.Screen name="Statistic" component={TeacherStatisticScreen} options={{ headerShown: false }} />
      <MeStack.Screen name="StudentTracking" component={TeacherStudentTrackingScreen} options={{ headerShown: false }} />
      <MeStack.Screen name="QuestionBank" component={TeacherQuestionBankScreen} options={{ headerShown: false }} />
      <MeStack.Screen name="ProfileEdit" component={TeacherProfileEditScreen} options={{ title: 'Chỉnh sửa thông tin' }} />
    </MeStack.Navigator>
  );
}

const RootStack = createStackNavigator();

export default function TeacherNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="TeacherClassDetail" component={TeacherClassDetailScreen} options={{ headerShown: true, title: 'Chi tiết lớp' }} />
      <RootStack.Screen name="TeacherChatScreen" component={TeacherChatScreen} options={{ headerShown: true, title: 'Danh sách chat' }} />
      <RootStack.Screen name="TeacherChatDetail" component={TeacherChatDetailScreen} options={{ headerShown: true, title: 'Chi tiết chat' }} />
    </RootStack.Navigator>
  );
}

function MainTabs() {
  const { unreadNotificationCount } = useNotification();
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#333',
        tabBarStyle: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: 60 },
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 12 },
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Dashboard':
              return <Ionicons name="home" size={size} color={color} />;
            case 'Class':
              return <Ionicons name="school" size={size} color={color} />;
            case 'Lesson':
              return <Ionicons name="book" size={size} color={color} />;
            case 'Exam':
              return <Ionicons name="document-text" size={size} color={color} />;
            case 'Me':
              return (
                <View>
                  <Ionicons name="person" size={size} color={color} />
                  {unreadNotificationCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'red'
                    }} />
                  )}
                </View>
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={TeacherChatScreen} options={{ title: 'Tin nhắn' }} />
      <Tab.Screen name="Class" component={TeacherClassManagementScreen} options={{ title: 'Lớp học' }} />
      <Tab.Screen name="Lesson" component={TeacherLessonManagementScreen} options={{ title: 'Bài học' }} />
      <Tab.Screen name="Exam" children={() => (
        <ExamTabNavigator />
      )} options={{ title: 'Đề thi' }} />
      <Tab.Screen name="Me" children={() => (
        <MeTabNavigator />
      )} options={{ title: 'Tôi', tabBarLabel: 'Tôi' }} />
    </Tab.Navigator>
  );
} 