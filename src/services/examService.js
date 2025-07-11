import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const EXAMS_COLLECTION = 'exams';

export const fetchExams = async (classId) => {
  if (!classId) return [];
  const q = query(collection(firestore, EXAMS_COLLECTION), where('classId', '==', classId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addExam = async (exam) => {
  const docRef = await addDoc(collection(firestore, EXAMS_COLLECTION), exam);
  return docRef.id;
};

export const updateExam = async (id, exam) => {
  const examRef = doc(firestore, EXAMS_COLLECTION, id);
  await updateDoc(examRef, exam);
};

export const deleteExam = async (id) => {
  const examRef = doc(firestore, EXAMS_COLLECTION, id);
  await deleteDoc(examRef);
};

export const fetchExamsByType = async (type) => {
  const q = query(collection(firestore, EXAMS_COLLECTION), where("type", "==", type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchExamsByStatus = async (status) => {
  const q = query(collection(firestore, EXAMS_COLLECTION), where("status", "==", status));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 