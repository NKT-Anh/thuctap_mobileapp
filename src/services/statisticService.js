import { firestore } from '../../firebaseConfig';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';

export const fetchStatistics = async () => {
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
};

export const fetchUserStatistics = async () => {
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
}; 