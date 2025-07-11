import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const LESSONS_COLLECTION = 'lessons';

export const fetchLessons = async () => {
  const querySnapshot = await getDocs(collection(firestore, LESSONS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addLesson = async (lesson) => {
  const docRef = await addDoc(collection(firestore, LESSONS_COLLECTION), lesson);
  return docRef.id;
};

export const updateLesson = async (id, lesson) => {
  const lessonRef = doc(firestore, LESSONS_COLLECTION, id);
  await updateDoc(lessonRef, lesson);
};

export const deleteLesson = async (id) => {
  const lessonRef = doc(firestore, LESSONS_COLLECTION, id);
  await deleteDoc(lessonRef);
};

export const fetchLessonsByTopic = async (topic) => {
  const q = query(collection(firestore, LESSONS_COLLECTION), where("topic", "==", topic));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchLessonsByLevel = async (level) => {
  const q = query(collection(firestore, LESSONS_COLLECTION), where("level", "==", level));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 