import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  Button, 
  ActivityIndicator,
  Surface,
  Divider,
  Chip,
  List,
  Avatar,
  ProgressBar
} from 'react-native-paper';
import { 
  getSystemStatistics, 
  getUserStatistics, 
  getExamStatistics, 
  getLessonStatistics,
  getPerformanceStatistics
} from '../../services/statisticService';

const { width } = Dimensions.get('window');

export default function StatisticScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [statistics, setStatistics] = useState({
    system: {},
    users: {},
    exams: {},
    lessons: {},
    performance: {}
  });

  const periods = [
    { value: 'day', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'year', label: 'Năm này' }
  ];

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      const [systemStats, userStats, examStats, lessonStats, performanceStats] = await Promise.all([
        getSystemStatistics(selectedPeriod).catch(() => ({})),
        getUserStatistics(selectedPeriod).catch(() => ({})),
        getExamStatistics(selectedPeriod).catch(() => ({})),
        getLessonStatistics(selectedPeriod).catch(() => ({})),
        getPerformanceStatistics(selectedPeriod).catch(() => ({}))
      ]);

      setStatistics({
        system: systemStats,
        users: userStats,
        exams: examStats,
        lessons: lessonStats,
        performance: performanceStats
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header với period selector */}
      <Surface style={styles.headerSection}>
        <Title style={styles.headerTitle}>Thống kê & Báo cáo</Title>
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <Chip
              key={period.value}
              mode={selectedPeriod === period.value ? 'flat' : 'outlined'}
              selected={selectedPeriod === period.value}
              onPress={() => setSelectedPeriod(period.value)}
              style={styles.periodChip}
            >
              {period.label}
            </Chip>
          ))}
        </View>
        <Button 
          mode="outlined" 
          onPress={handleRefresh} 
          loading={refreshing}
          icon="refresh"
          style={styles.refreshButton}
        >
          Làm mới
        </Button>
      </Surface>

      {/* Thống kê tổng quan hệ thống */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Tổng quan hệ thống</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.statsGrid}>
            <Surface style={[styles.statCard, styles.primaryCard]}>
              <Text style={styles.statNumber}>{formatNumber(statistics.system.totalUsers)}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
              <Text style={styles.statChange}>
                +{statistics.system.newUsersThisPeriod || 0} mới
              </Text>
            </Surface>

            <Surface style={[styles.statCard, styles.successCard]}>
              <Text style={styles.statNumber}>{formatNumber(statistics.system.activeUsers)}</Text>
              <Text style={styles.statLabel}>Hoạt động</Text>
              <Text style={styles.statChange}>
                {formatPercentage((statistics.system.activeUsers / statistics.system.totalUsers) * 100)}
              </Text>
            </Surface>

            <Surface style={[styles.statCard, styles.warningCard]}>
              <Text style={styles.statNumber}>{formatNumber(statistics.system.totalExams)}</Text>
              <Text style={styles.statLabel}>Đề thi</Text>
              <Text style={styles.statChange}>
                +{statistics.system.newExamsThisPeriod || 0} mới
              </Text>
            </Surface>

            <Surface style={[styles.statCard, styles.infoCard]}>
              <Text style={styles.statNumber}>{formatNumber(statistics.system.totalLessons)}</Text>
              <Text style={styles.statLabel}>Bài học</Text>
              <Text style={styles.statChange}>
                +{statistics.system.newLessonsThisPeriod || 0} mới
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Thống kê người dùng */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Thống kê người dùng</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.userStatsContainer}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Học sinh:</Text>
              <Text style={styles.userStatValue}>{statistics.users.totalStudents || 0}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Giáo viên:</Text>
              <Text style={styles.userStatValue}>{statistics.users.totalTeachers || 0}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Admin:</Text>
              <Text style={styles.userStatValue}>{statistics.users.totalAdmins || 0}</Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>Hoạt động người dùng</Text>
          <List.Item
            title="Đăng nhập trong kỳ"
            description={`${statistics.users.loginsThisPeriod || 0} lượt đăng nhập`}
            left={() => <Avatar.Icon size={40} icon="login" />}
          />
          <List.Item
            title="Người dùng mới đăng ký"
            description={`${statistics.users.newRegistrations || 0} đăng ký mới`}
            left={() => <Avatar.Icon size={40} icon="account-plus" />}
          />
        </Card.Content>
      </Card>

      {/* Thống kê bài thi */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Thống kê bài thi</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.examStatsContainer}>
            <View style={styles.examStatRow}>
              <Text style={styles.examStatLabel}>Tổng số lượt thi:</Text>
              <Text style={styles.examStatValue}>{formatNumber(statistics.exams.totalAttempts)}</Text>
            </View>
            
            <View style={styles.examStatRow}>
              <Text style={styles.examStatLabel}>Điểm trung bình:</Text>
              <Text style={styles.examStatValue}>{(statistics.exams.averageScore || 0).toFixed(1)}/100</Text>
            </View>
            
            <View style={styles.examStatRow}>
              <Text style={styles.examStatLabel}>Tỷ lệ đỗ:</Text>
              <Text style={styles.examStatValue}>{formatPercentage(statistics.exams.passRate)}</Text>
            </View>
          </View>

          <Text style={styles.sectionSubtitle}>Phân bố độ khó</Text>
          <View style={styles.difficultyStats}>
            <View style={styles.difficultyItem}>
              <Text style={styles.difficultyLabel}>Dễ</Text>
              <ProgressBar 
                progress={(statistics.exams.easyExams || 0) / (statistics.system.totalExams || 1)} 
                style={styles.progressBar}
              />
              <Text style={styles.difficultyValue}>{statistics.exams.easyExams || 0}</Text>
            </View>
            <View style={styles.difficultyItem}>
              <Text style={styles.difficultyLabel}>Trung bình</Text>
              <ProgressBar 
                progress={(statistics.exams.mediumExams || 0) / (statistics.system.totalExams || 1)} 
                style={styles.progressBar}
              />
              <Text style={styles.difficultyValue}>{statistics.exams.mediumExams || 0}</Text>
            </View>
            <View style={styles.difficultyItem}>
              <Text style={styles.difficultyLabel}>Khó</Text>
              <ProgressBar 
                progress={(statistics.exams.hardExams || 0) / (statistics.system.totalExams || 1)} 
                style={styles.progressBar}
              />
              <Text style={styles.difficultyValue}>{statistics.exams.hardExams || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Thống kê bài học */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Thống kê bài học</Title>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Bài học được xem nhiều nhất"
            description={statistics.lessons.mostViewedLesson?.title || 'Chưa có dữ liệu'}
            right={() => <Text>{statistics.lessons.mostViewedLesson?.views || 0} lượt xem</Text>}
            left={() => <Avatar.Icon size={40} icon="eye" />}
          />
          
          <List.Item
            title="Tổng lượt xem bài học"
            description={`${formatNumber(statistics.lessons.totalViews)} lượt xem trong kỳ`}
            left={() => <Avatar.Icon size={40} icon="chart-line" />}
          />
          
          <List.Item
            title="Thời gian học trung bình"
            description={`${(statistics.lessons.averageStudyTime || 0).toFixed(1)} phút/bài`}
            left={() => <Avatar.Icon size={40} icon="clock" />}
          />
        </Card.Content>
      </Card>

      {/* Thống kê hiệu suất */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Hiệu suất hệ thống</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.performanceContainer}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Uptime</Text>
              <Text style={styles.performanceValue}>{formatPercentage(statistics.performance.uptime || 99.9)}</Text>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Thời gian phản hồi TB</Text>
              <Text style={styles.performanceValue}>{(statistics.performance.averageResponseTime || 150)}ms</Text>
            </View>
            
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Lỗi hệ thống</Text>
              <Text style={styles.performanceValue}>{statistics.performance.errors || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Top performers */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Bảng xếp hạng</Title>
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionSubtitle}>Top học sinh xuất sắc</Text>
          {(statistics.users.topStudents || []).map((student, index) => (
            <List.Item
              key={student.id}
              title={student.name}
              description={`Điểm TB: ${student.averageScore?.toFixed(1) || 0}`}
              left={() => <Avatar.Text size={40} label={(index + 1).toString()} />}
              right={() => <Chip mode="outlined">{student.completedExams || 0} bài thi</Chip>}
            />
          ))}
          
          {(!statistics.users.topStudents || statistics.users.topStudents.length === 0) && (
            <Text style={styles.noDataText}>Chưa có dữ liệu bảng xếp hạng</Text>
          )}
        </Card.Content>
      </Card>
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
  headerSection: {
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  periodChip: {
    marginRight: 4,
  },
  refreshButton: {
    alignSelf: 'flex-start',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  divider: {
    marginVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
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
  warningCard: {
    backgroundColor: '#FFF3E0',
  },
  infoCard: {
    backgroundColor: '#E1F5FE',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statChange: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  userStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  examStatsContainer: {
    marginVertical: 16,
  },
  examStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  examStatLabel: {
    fontSize: 16,
    color: '#333',
  },
  examStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  difficultyStats: {
    marginTop: 16,
  },
  difficultyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 12,
    height: 8,
  },
  difficultyValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
}); 