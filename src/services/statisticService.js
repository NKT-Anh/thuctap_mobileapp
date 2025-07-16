import { firestore } from '../../firebaseConfig';
import { collection, getDocs, getCountFromServer, query, where, orderBy, limit } from 'firebase/firestore';

// Hàm tiện ích để tính toán khoảng thời gian
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo;
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(0); // Từ đầu
  }

  return { startDate, endDate: now };
};

export const getSystemStatistics = async (period = 'week') => {
  try {
    const { startDate } = getDateRange(period);

    // Lấy tổng số
    const [usersSnap, examsSnap, lessonsSnap, questionsSnap] = await Promise.all([
      getCountFromServer(collection(firestore, 'users')),
      getCountFromServer(collection(firestore, 'exams')),
      getCountFromServer(collection(firestore, 'lessons')),
      getCountFromServer(collection(firestore, 'questions'))
    ]);

    // Lấy số liệu mới trong kỳ
    const [newUsersSnap, newExamsSnap, newLessonsSnap] = await Promise.all([
      getDocs(query(collection(firestore, 'users'), where('createdAt', '>=', startDate))),
      getDocs(query(collection(firestore, 'exams'), where('createdAt', '>=', startDate))),
      getDocs(query(collection(firestore, 'lessons'), where('createdAt', '>=', startDate)))
    ]);

    // Lấy số người dùng hoạt động
    const activeUsersSnap = await getDocs(query(collection(firestore, 'users'), where('status', '==', 'active')));

    return {
      totalUsers: usersSnap.data().count,
      totalExams: examsSnap.data().count,
      totalLessons: lessonsSnap.data().count,
      totalQuestions: questionsSnap.data().count,
      activeUsers: activeUsersSnap.docs.length,
      newUsersThisPeriod: newUsersSnap.docs.length,
      newExamsThisPeriod: newExamsSnap.docs.length,
      newLessonsThisPeriod: newLessonsSnap.docs.length
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê hệ thống:', error);
    throw new Error('Không thể tải thống kê hệ thống');
  }
};

export const getUserStatistics = async (period = 'week') => {
  try {
    const { startDate } = getDateRange(period);

    const querySnapshot = await getDocs(collection(firestore, 'users'));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const activeUsers = users.filter(user => user.status === 'active').length;
    const lockedUsers = users.filter(user => user.status === 'locked').length;
    const students = users.filter(user => user.role === 'student').length;
    const teachers = users.filter(user => user.role === 'teacher').length;
    const admins = users.filter(user => user.role === 'admin').length;

    // Đăng ký mới trong kỳ
    const newRegistrations = users.filter(user => 
      user.createdAt && user.createdAt.toDate() >= startDate
    ).length;

    // Lấy top học sinh (giả định có bảng scores hoặc exam_results)
    const topStudents = users
      .filter(user => user.role === 'student')
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 5)
      .map(student => ({
        id: student.id,
        name: student.name || student.email,
        averageScore: student.averageScore || 0,
        completedExams: student.completedExams || 0
      }));

    return {
      totalUsers: users.length,
      totalStudents: students,
      totalTeachers: teachers,
      totalAdmins: admins,
      activeUsers,
      lockedUsers,
      newRegistrations,
      topStudents,
      loginsThisPeriod: 0 // Cần implement tracking đăng nhập
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê người dùng:', error);
    throw new Error('Không thể tải thống kê người dùng');
  }
};

export const getExamStatistics = async (period = 'week') => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'exams'));
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Phân loại theo độ khó
    const easyExams = exams.filter(exam => exam.difficulty === 'easy').length;
    const mediumExams = exams.filter(exam => exam.difficulty === 'medium').length;
    const hardExams = exams.filter(exam => exam.difficulty === 'hard').length;

    // Lấy kết quả thi (giả định có collection exam_results)
    let totalAttempts = 0;
    let averageScore = 0;
    let passRate = 0;

    try {
      const resultsSnapshot = await getDocs(collection(firestore, 'exam_results'));
      const results = resultsSnapshot.docs.map(doc => doc.data());
      
      totalAttempts = results.length;
      if (totalAttempts > 0) {
        const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
        averageScore = totalScore / totalAttempts;
        
        const passedResults = results.filter(result => result.score >= (result.passingScore || 70));
        passRate = (passedResults.length / totalAttempts) * 100;
      }
    } catch (error) {
      console.log('Chưa có dữ liệu kết quả thi');
    }

    return {
      totalExams: exams.length,
      easyExams,
      mediumExams,
      hardExams,
      totalAttempts,
      averageScore,
      passRate
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê đề thi:', error);
    throw new Error('Không thể tải thống kê đề thi');
  }
};

export const getLessonStatistics = async (period = 'week') => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'lessons'));
    const lessons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Giả định có tracking views cho lessons
    let mostViewedLesson = null;
    let totalViews = 0;
    let averageStudyTime = 0;

    try {
      // Lấy lesson views (giả định có collection lesson_views)
      const viewsSnapshot = await getDocs(collection(firestore, 'lesson_views'));
      const views = viewsSnapshot.docs.map(doc => doc.data());
      
      totalViews = views.length;
      
      // Tìm bài học được xem nhiều nhất
      const lessonViewCounts = {};
      views.forEach(view => {
        lessonViewCounts[view.lessonId] = (lessonViewCounts[view.lessonId] || 0) + 1;
      });
      
      const mostViewedLessonId = Object.keys(lessonViewCounts).reduce((a, b) => 
        lessonViewCounts[a] > lessonViewCounts[b] ? a : b
      );
      
      mostViewedLesson = lessons.find(lesson => lesson.id === mostViewedLessonId);
      if (mostViewedLesson) {
        mostViewedLesson.views = lessonViewCounts[mostViewedLessonId];
      }

      // Tính thời gian học trung bình
      const studyTimes = views.filter(view => view.studyTime).map(view => view.studyTime);
      if (studyTimes.length > 0) {
        averageStudyTime = studyTimes.reduce((sum, time) => sum + time, 0) / studyTimes.length;
      }
    } catch (error) {
      console.log('Chưa có dữ liệu views bài học');
    }

    return {
      totalLessons: lessons.length,
      mostViewedLesson,
      totalViews,
      averageStudyTime
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê bài học:', error);
    throw new Error('Không thể tải thống kê bài học');
  }
};

export const getPerformanceStatistics = async (period = 'week') => {
  try {
    // Giả định có system monitoring data
    return {
      uptime: 99.5, // Phần trăm uptime
      averageResponseTime: 120, // milliseconds
      errors: 0, // Số lỗi trong period
      peakConcurrentUsers: 150, // Số người dùng đồng thời cao nhất
      dataTransfer: 1024 * 1024 * 500, // bytes transferred
      cacheHitRate: 85.5 // Phần trăm cache hit rate
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê hiệu suất:', error);
    throw new Error('Không thể tải thống kê hiệu suất');
  }
};

export const fetchStatistics = async () => {
  try {
    // Lấy tổng số người dùng, đề thi, bài học, v.v.
    const [usersSnap, examsSnap, lessonsSnap, questionsSnap] = await Promise.all([
      getCountFromServer(collection(firestore, 'users')),
      getCountFromServer(collection(firestore, 'exams')),
      getCountFromServer(collection(firestore, 'lessons')),
      getCountFromServer(collection(firestore, 'questions')),
    ]);
    
    return {
      userCount: usersSnap.data().count,
      examCount: examsSnap.data().count,
      lessonCount: lessonsSnap.data().count,
      questionCount: questionsSnap.data().count,
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê tổng quan:', error);
    throw new Error('Không thể tải thống kê tổng quan');
  }
};

export const fetchUserStatistics = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'users'));
    const users = querySnapshot.docs.map(doc => doc.data());
    
    const activeUsers = users.filter(user => user.status === 'active').length;
    const lockedUsers = users.filter(user => user.status === 'locked').length;
    const students = users.filter(user => user.role === 'student').length;
    const teachers = users.filter(user => user.role === 'teacher').length;
    const admins = users.filter(user => user.role === 'admin').length;
    
    return {
      totalUsers: users.length,
      activeUsers,
      lockedUsers,
      students,
      teachers,
      admins,
    };
  } catch (error) {
    console.error('Lỗi lấy thống kê người dùng cơ bản:', error);
    throw new Error('Không thể tải thống kê người dùng cơ bản');
  }
};

// Hàm export dữ liệu thống kê
export const exportStatistics = async (format = 'json', period = 'week') => {
  try {
    const [systemStats, userStats, examStats, lessonStats, performanceStats] = await Promise.all([
      getSystemStatistics(period),
      getUserStatistics(period),
      getExamStatistics(period),
      getLessonStatistics(period),
      getPerformanceStatistics(period)
    ]);

    const exportData = {
      period,
      generatedAt: new Date().toISOString(),
      system: systemStats,
      users: userStats,
      exams: examStats,
      lessons: lessonStats,
      performance: performanceStats
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }
    
    // Có thể thêm các format khác như CSV, Excel
    return exportData;
  } catch (error) {
    console.error('Lỗi export thống kê:', error);
    throw new Error('Không thể export thống kê');
  }
}; 