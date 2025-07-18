import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

// Lấy danh sách lớp mà học viên đang tham gia
export async function getStudentClasses(studentId) {
  const classesRef = collection(firestore, 'classes');
  const q = query(classesRef, where('students', 'array-contains', studentId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}