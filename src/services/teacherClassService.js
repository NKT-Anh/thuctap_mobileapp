import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

// Lấy danh sách lớp của giáo viên, kèm số học sinh và số đề thi từng lớp
export const getTeacherClassesWithStats = async (teacherEmail) => {
  const classesRef = collection(db, 'classes');
  const q = query(classesRef, where('teacher', '==', teacherEmail));
  const querySnapshot = await getDocs(q);

  const classes = [];
  for (const docu of querySnapshot.docs) {
    const classData = docu.data();
    const classId = docu.id;

    // Đếm số học sinh
    const studentCount = Array.isArray(classData.students) ? classData.students.length : 0;

    // Đếm số đề thi (nếu có subcollection exams)
    let examCount = 0;
    try {
      const examsRef = collection(db, 'classes', classId, 'exams');
      const examsSnapshot = await getDocs(examsRef);
      examCount = examsSnapshot.size;
    } catch {}

    classes.push({
      id: classId,
      name: classData.name,
      studentCount,
      examCount,
    });
  }
  return classes;
};

// Lấy chi tiết lớp: danh sách học sinh từ trường students (mảng id)
export const getClassDetail = async (classId) => {
  const classDoc = await getDoc(doc(db, 'classes', classId));
  const classData = classDoc.data();
  const students = (classData.students || []).map(id => ({ id }));
  // Lấy danh sách đề thi nếu cần
  let exams = [];
  try {
    const examsRef = collection(db, 'classes', classId, 'exams');
    const examsSnapshot = await getDocs(examsRef);
    exams = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {}
  return { students, exams };
}; 