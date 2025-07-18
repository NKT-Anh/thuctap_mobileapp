import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Surface, Divider } from 'react-native-paper';
import { fetchUsers } from '../../services/userService';
import { fetchExams } from '../../services/examService';
import { fetchLessons } from '../../services/lessonService';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    totalLessons: 0,
    activeUsers: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tải dữ liệu song song
      const [users, exams, lessons] = await Promise.all([
        fetchUsers().catch(() => []),
        fetchExams().catch(() => []),
        fetchLessons().catch(() => [])
      ]);

      // Tính toán thống kê
      const students = users.filter(u => u.role === 'student');
      const teachers = users.filter(u => u.role === 'teacher');
      const activeUsers = users.filter(u => u.status === 'active');

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalExams: exams.length,
        totalLessons: lessons.length,
        activeUsers: activeUsers.length
      });
    } catch (error) {
      console.error('Lỗi tải dữ liệu dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
<<<<<<< Updated upstream
          <Title style={styles.welcomeTitle}>Bảng điều khiển Admin</Title>
=======
          <Title style={styles.welcomeTitle}>Admin</Title>
>>>>>>> Stashed changes
          <Paragraph style={styles.welcomeText}>
            Chào mừng đến với hệ thống quản trị KICODE!
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.statsGrid}>
        <Surface style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
        </Surface>

        <Surface style={[styles.statCard, styles.successCard]}>
          <Text style={styles.statNumber}>{stats.activeUsers}</Text>
          <Text style={styles.statLabel}>Người dùng hoạt động</Text>
        </Surface>

        <Surface style={[styles.statCard, styles.infoCard]}>
          <Text style={styles.statNumber}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Học sinh</Text>
        </Surface>

        <Surface style={[styles.statCard, styles.warningCard]}>
          <Text style={styles.statNumber}>{stats.totalTeachers}</Text>
          <Text style={styles.statLabel}>Giáo viên</Text>
        </Surface>

        <Surface style={[styles.statCard, styles.errorCard]}>
          <Text style={styles.statNumber}>{stats.totalExams}</Text>
          <Text style={styles.statLabel}>Đề thi</Text>
        </Surface>

        <Surface style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statNumber}>{stats.totalLessons}</Text>
          <Text style={styles.statLabel}>Bài học</Text>
        </Surface>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title>Tóm tắt hệ thống</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tỷ lệ người dùng hoạt động:</Text>
            <Text style={styles.summaryValue}>
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tỷ lệ học sinh/giáo viên:</Text>
            <Text style={styles.summaryValue}>
              {stats.totalTeachers > 0 ? Math.round(stats.totalStudents / stats.totalTeachers) : 0}:1
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Trung bình bài học/đề thi:</Text>
            <Text style={styles.summaryValue}>
              {stats.totalExams > 0 ? Math.round(stats.totalLessons / stats.totalExams) : 0}:1
            </Text>
          </View>
        </Card.Content>
      </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  welcomeCard: {
    marginBottom: 20,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#E3F2FD',
  },
  successCard: {
    backgroundColor: '#E8F5E8',
  },
  infoCard: {
    backgroundColor: '#E1F5FE',
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
  },
  secondaryCard: {
    backgroundColor: '#F3E5F5',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    elevation: 4,
  },
  divider: {
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
}); 