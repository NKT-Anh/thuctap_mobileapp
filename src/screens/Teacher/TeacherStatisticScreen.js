import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, Dimensions, ScrollView } from 'react-native';
import { fetchStatistics, fetchUserStatistics } from '../../services/statisticService';
import { useAuth } from '../../context/AuthContext';
import { getTeacherClassesWithStats } from '../../services/teacherClassService';
import { fetchNotificationsByTeacherEmail } from '../../services/notificationService';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function TeacherStatisticScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);setStats
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teacherStats, setTeacherStats] = useState({
    classCount: 0,
    studentCount: 0,
    notificationCount: 0,
  });

  useEffect(() => {
    loadStats();
    if (user?.email) loadTeacherStats(user.email);
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [s, us] = await Promise.all([
        fetchStatistics(),
        fetchUserStatistics()
      ]);
      setStats(s);
      setUserStats(us);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thống kê: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTeacherStats = async (teacherEmail) => {
    try {
      // Lấy danh sách lớp giáo viên
      const classes = await getTeacherClassesWithStats(teacherEmail);
      const classCount = classes.length;
      const studentCount = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
      // Lấy số lượng thông báo đã gửi
      const notifications = await fetchNotificationsByTeacherEmail(teacherEmail);
      setTeacherStats({
        classCount,
        studentCount,
        notificationCount: notifications.length,
        classList: classes, // Thêm dòng này
      });
    } catch (error) {
      // Có thể báo lỗi nếu cần
    }
  };

  const handleExport = async () => {
    try {
      // Sheet 1: Tổng quan
      const overview = [
        ['Lớp đang dạy', teacherStats.classCount],
        ['Học sinh', teacherStats.studentCount],
        ['Thông báo đã gửi', teacherStats.notificationCount],
        ['Tổng học viên', userStats?.totalUsers || 0],
        ['Đang hoạt động', userStats?.activeUsers || 0],
        ['Đã khóa', userStats?.lockedUsers || 0],
        ['Đề thi', stats?.examCount || 0],
        ['Bài học', stats?.lessonCount || 0],
        ['Câu hỏi', stats?.questionCount || 0],
      ];
      // Sheet 2: Danh sách lớp
      const classSheet = [['Tên lớp', 'Số học sinh', 'Số đề thi']];
      (teacherStats.classList || []).forEach(c => {
        classSheet.push([c.name || c.id, c.studentCount || 0, c.examCount || 0]);
      });
      // Tạo workbook
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.aoa_to_sheet(overview);
      const ws2 = XLSX.utils.aoa_to_sheet(classSheet);
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
      XLSX.utils.book_append_sheet(wb, ws2, 'Lớp của tôi');
      // Xuất file
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileUri = FileSystem.cacheDirectory + `baocao_giaovien_${Date.now()}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dialogTitle: 'Chia sẻ báo cáo Excel' });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xuất báo cáo: ' + error.message);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f6f8fa' }} contentContainerStyle={{ padding: 0 }}>
      {/* Header */}
      <View style={{ backgroundColor: '#007AFF', paddingTop: 36, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 12 }}>
        <Text style={{ color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 }}>Thống kê & Báo cáo</Text>
        <Text style={{ color: '#e0eaff', fontSize: 15 }}>Tổng quan hoạt động của giáo viên</Text>
      </View>
      {/* Stat Cards Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }}>
        <StatCard icon={<Ionicons name="school" size={28} color="#fff" />} label="Lớp đang dạy" value={teacherStats.classCount} color="#007AFF" />
        <StatCard icon={<Ionicons name="people" size={28} color="#fff" />} label="Học sinh" value={teacherStats.studentCount} color="#43D8C9" />
        <StatCard icon={<Ionicons name="notifications" size={28} color="#fff" />} label="Thông báo đã gửi" value={teacherStats.notificationCount} color="#FFB830" />
        <StatCard icon={<MaterialCommunityIcons name="account-group" size={28} color="#fff" />} label="Tổng học viên" value={userStats?.totalUsers || 0} color="#6C63FF" />
        <StatCard icon={<Ionicons name="checkmark-circle" size={28} color="#fff" />} label="Đang hoạt động" value={userStats?.activeUsers || 0} color="#00B894" />
        <StatCard icon={<Ionicons name="lock-closed" size={28} color="#fff" />} label="Đã khóa" value={userStats?.lockedUsers || 0} color="#FF6363" />
        <StatCard icon={<MaterialCommunityIcons name="file-document-edit" size={28} color="#fff" />} label="Đề thi" value={stats?.examCount || 0} color="#3A86FF" />
        <StatCard icon={<MaterialCommunityIcons name="book-open-variant" size={28} color="#fff" />} label="Bài học" value={stats?.lessonCount || 0} color="#FB5607" />
        <StatCard icon={<MaterialCommunityIcons name="help-circle" size={28} color="#fff" />} label="Câu hỏi" value={stats?.questionCount || 0} color="#8338EC" />
      </View>
      {/* Biểu đồ cột số học sinh từng lớp */}
      {teacherStats.classCount > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Biểu đồ số học sinh từng lớp</Text>
          <BarChart
            data={{
              labels: (teacherStats.classList || []).map(c => c.name || c.id),
              datasets: [
                {
                  data: (teacherStats.classList || []).map(c => c.studentCount || 0),
                },
              ],
            }}
            width={Dimensions.get('window').width - 48}
            height={220}
            yAxisLabel={''}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#007AFF' },
            }}
            style={{ borderRadius: 16 }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>
      )}
      <View style={{ marginTop: 24, marginBottom: 32, alignItems: 'center' }}>
        <Button title="Xuất báo cáo (Excel/PDF)" onPress={handleExport} color="#007AFF" />
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={{ width: '47%', backgroundColor: color, borderRadius: 18, marginBottom: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.13, shadowRadius: 8, elevation: 3 }}>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 6, marginRight: 12 }}>{icon}</View>
      <View>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{value}</Text>
        <Text style={{ color: '#fff', fontSize: 14, marginTop: 2 }}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  statBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  statLabel: { fontSize: 16, color: '#555' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  chartCard: { backgroundColor: '#fff', borderRadius: 18, marginTop: 32, marginHorizontal: 16, padding: 18, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#222', textAlign: 'center' },
}); 