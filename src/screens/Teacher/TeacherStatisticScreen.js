import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { fetchStatistics, fetchUserStatistics } from '../../services/statisticService';

export default function TeacherStatisticScreen() {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

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

  const handleExport = () => {
    Alert.alert('Chức năng xuất báo cáo sẽ được bổ sung sau!');
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Thống kê & Báo cáo</Text>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Tổng số học viên:</Text>
        <Text style={styles.statValue}>{userStats?.totalUsers || 0}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Đang hoạt động:</Text>
        <Text style={styles.statValue}>{userStats?.activeUsers || 0}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Đã khóa:</Text>
        <Text style={styles.statValue}>{userStats?.lockedUsers || 0}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Số đề thi:</Text>
        <Text style={styles.statValue}>{stats?.examCount || 0}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Số bài học:</Text>
        <Text style={styles.statValue}>{stats?.lessonCount || 0}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Số câu hỏi:</Text>
        <Text style={styles.statValue}>{stats?.questionCount || 0}</Text>
      </View>
      <View style={{ marginTop: 20 }}>
        <Button title="Xuất báo cáo (Excel/PDF)" onPress={handleExport} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  statBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  statLabel: { fontSize: 16, color: '#555' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
}); 