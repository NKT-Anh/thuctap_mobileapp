import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const QUESTIONS_COLLECTION = 'questions';

export const fetchQuestions = async (teacherId) => {
  const q = query(collection(firestore, QUESTIONS_COLLECTION), where('teacherId', '==', teacherId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addQuestion = async (question, teacherId) => {
  const docRef = await addDoc(collection(firestore, QUESTIONS_COLLECTION), { ...question, teacherId });
  return docRef.id;
};

export const updateQuestion = async (id, question) => {
  const questionRef = doc(firestore, QUESTIONS_COLLECTION, id);
  await updateDoc(questionRef, question);
};

export const deleteQuestion = async (id) => {
  const questionRef = doc(firestore, QUESTIONS_COLLECTION, id);
  await deleteDoc(questionRef);
};

export const fetchQuestionsByTopic = async (topic) => {
  const q = query(collection(firestore, QUESTIONS_COLLECTION), where("topic", "==", topic));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchQuestionsByDifficulty = async (difficulty) => {
  const q = query(collection(firestore, QUESTIONS_COLLECTION), where("difficulty", "==", difficulty));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addAdminQuestion = async (question) => {
  return addQuestion(question, 'admin');
}; 