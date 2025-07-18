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
<<<<<<< Updated upstream
  List,
=======
>>>>>>> Stashed changes
  Avatar,
  ProgressBar
} from 'react-native-paper';
import { 
  getSystemStatistics, 
  getUserStatistics, 
<<<<<<< Updated upstream
  getExamStatistics, 
  getLessonStatistics,
  getPerformanceStatistics
=======
  getExamStatistics
>>>>>>> Stashed changes
} from '../../services/statisticService';

const { width } = Dimensions.get('window');

export default function StatisticScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
<<<<<<< Updated upstream
  const [statistics, setStatistics] = useState({
    system: {},
    users: {},
    exams: {},
    lessons: {},
    performance: {}
=======
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [statistics, setStatistics] = useState({
    system: {},
    users: {},
    exams: {}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      
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
=======
      setError(null);
      setIsOffline(false);
      
      // Thêm timeout cho các request Firebase
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      );

      const statisticsPromise = Promise.all([
        getSystemStatistics(selectedPeriod).catch(() => ({})),
        getUserStatistics(selectedPeriod).catch(() => ({})),
        getExamStatistics(selectedPeriod).catch(() => ({}))
      ]);

      const [systemStats, userStats, examStats] = await Promise.race([
        statisticsPromise,
        timeoutPromise
      ]);

      console.log('Dữ liệu thống kê nhận được:', {
        system: systemStats,
        users: userStats,
        exams: examStats
      });

      setStatistics({
        system: systemStats,
        users: userStats,
        exams: examStats
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
      
      if (error.message.includes('timeout') || error.message.includes('network') || error.message.includes('offline')) {
        setIsOffline(true);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.');
        
        // Sử dụng dữ liệu mặc định khi offline
        setStatistics({
          system: {
            totalUsers: 0,
            activeUsers: 0,
            totalExams: 0,
            totalLessons: 0,
            newUsersThisPeriod: 0,
            newExamsThisPeriod: 0,
            newLessonsThisPeriod: 0
          },
          users: {
            totalStudents: 0,
            totalTeachers: 0,
            totalAdmins: 0,
            loginsThisPeriod: 0,
            newRegistrations: 0,
            topStudents: []
          },
          exams: {
            totalAttempts: 0,
            averageScore: 0,
            passRate: 0,
            easyExams: 0,
            mediumExams: 0,
            hardExams: 0
          }
        });
      } else {
        setError('Có lỗi xảy ra khi tải thống kê. Vui lòng thử lại.');
      }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
      {/* Error Banner */}
      {error && (
        <Surface style={[styles.errorBanner, isOffline && styles.offlineBanner]}>
          <Text style={styles.errorText}>
            {isOffline ? '📡 ' : '⚠️ '}{error}
          </Text>
          <Button 
            mode="text" 
            onPress={loadStatistics}
            textColor={isOffline ? '#FF6B35' : '#D32F2F'}
            style={styles.retryButton}
          >
            Thử lại
          </Button>
        </Surface>
      )}

      {/* Offline indicator */}
      {isOffline && (
        <Surface style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            Đang hiển thị dữ liệu offline - Một số thông tin có thể không cập nhật
          </Text>
        </Surface>
      )}

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
              disabled={isOffline}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
          disabled={isOffline}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                {formatPercentage((statistics.system.activeUsers / statistics.system.totalUsers) * 100)}
=======
                {formatPercentage((statistics.system.activeUsers / (statistics.system.totalUsers || 1)) * 100)}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Avatar.Icon size={40} icon="login" style={styles.activityIcon} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Đăng nhập trong kỳ</Text>
                <Text style={styles.activityDescription}>{statistics.users.loginsThisPeriod || 0} lượt đăng nhập</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Avatar.Icon size={40} icon="account-plus" style={styles.activityIcon} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Người dùng mới đăng ký</Text>
                <Text style={styles.activityDescription}>{statistics.users.newRegistrations || 0} đăng ký mới</Text>
              </View>
            </View>
          </View>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
              <View style={styles.difficultyHeader}>
                <Avatar.Icon size={32} icon="weather-sunny" style={styles.difficultyIcon} />
                <Text style={styles.difficultyLabel}>Dễ</Text>
              </View>
              <View style={styles.difficultyContent}>
                <Text style={styles.difficultyValue}>{statistics.exams.easyExams || 0} đề thi</Text>
                <ProgressBar 
                  progress={(statistics.exams.easyExams || 0) / (statistics.system.totalExams || 1)} 
                  style={styles.progressBar}
                  color="#4CAF50"
                />
                <Text style={styles.difficultyPercentage}>
                  {formatPercentage((statistics.exams.easyExams || 0) / (statistics.system.totalExams || 1) * 100)}
                </Text>
              </View>
            </View>
            
            <View style={styles.difficultyItem}>
              <View style={styles.difficultyHeader}>
                <Avatar.Icon size={32} icon="weather-partly-cloudy" style={styles.difficultyIcon} />
                <Text style={styles.difficultyLabel}>Trung bình</Text>
              </View>
              <View style={styles.difficultyContent}>
                <Text style={styles.difficultyValue}>{statistics.exams.mediumExams || 0} đề thi</Text>
                <ProgressBar 
                  progress={(statistics.exams.mediumExams || 0) / (statistics.system.totalExams || 1)} 
                  style={styles.progressBar}
                  color="#FF9800"
                />
                <Text style={styles.difficultyPercentage}>
                  {formatPercentage((statistics.exams.mediumExams || 0) / (statistics.system.totalExams || 1) * 100)}
                </Text>
              </View>
            </View>
            
            <View style={styles.difficultyItem}>
              <View style={styles.difficultyHeader}>
                <Avatar.Icon size={32} icon="weather-lightning" style={styles.difficultyIcon} />
                <Text style={styles.difficultyLabel}>Khó</Text>
              </View>
              <View style={styles.difficultyContent}>
                <Text style={styles.difficultyValue}>{statistics.exams.hardExams || 0} đề thi</Text>
                <ProgressBar 
                  progress={(statistics.exams.hardExams || 0) / (statistics.system.totalExams || 1)} 
                  style={styles.progressBar}
                  color="#F44336"
                />
                <Text style={styles.difficultyPercentage}>
                  {formatPercentage((statistics.exams.hardExams || 0) / (statistics.system.totalExams || 1) * 100)}
                </Text>
              </View>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
          <View style={styles.topStudentsContainer}>
            {(statistics.users.topStudents || []).map((student, index) => (
              <View key={student.id} style={styles.topStudentItem}>
                <Avatar.Text size={40} label={(index + 1).toString()} style={styles.studentRank} />
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentScore}>Điểm TB: {student.averageScore?.toFixed(1) || 0}</Text>
                </View>
                <Chip mode="outlined" style={styles.studentChip}>
                  {student.completedExams || 0} bài thi
                </Chip>
              </View>
            ))}
            
            {(!statistics.users.topStudents || statistics.users.topStudents.length === 0) && (
              <Text style={styles.noDataText}>Chưa có dữ liệu bảng xếp hạng</Text>
            )}
          </View>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  errorBanner: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  offlineBanner: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF6B35',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    marginRight: 8,
  },
  retryButton: {
    minWidth: 80,
  },
  offlineIndicator: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  offlineText: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
  },
>>>>>>> Stashed changes
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  divider: {
    marginVertical: 16,
  },
<<<<<<< Updated upstream
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    marginBottom: 12,
=======
  smallDivider: {
    marginVertical: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    width: (width - 64) / 4,
    padding: 12,
    marginBottom: 8,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    fontSize: 28,
=======
    fontSize: 22,
>>>>>>> Stashed changes
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
<<<<<<< Updated upstream
    fontSize: 14,
=======
    fontSize: 12,
>>>>>>> Stashed changes
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statChange: {
<<<<<<< Updated upstream
    fontSize: 12,
=======
    fontSize: 10,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  activityContainer: {
    marginVertical: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  activityIcon: {
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
  },
  difficultyHeader: {
>>>>>>> Stashed changes
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
<<<<<<< Updated upstream
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
=======
  difficultyIcon: {
    marginRight: 12,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  difficultyContent: {
    paddingLeft: 44,
  },
  difficultyValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  difficultyPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  progressBar: {
    height: 8,
    marginVertical: 8,
    borderRadius: 4,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
  topStudentsContainer: {
    marginVertical: 16,
  },
  topStudentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
  },
  studentRank: {
    marginRight: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentScore: {
    fontSize: 14,
    color: '#666',
  },
  studentChip: {
    marginLeft: 8,
  },
>>>>>>> Stashed changes
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
<<<<<<< Updated upstream
}); 
=======
});
>>>>>>> Stashed changes
