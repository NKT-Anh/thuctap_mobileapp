import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';
import { updatePassword } from 'firebase/auth';

const USERS_COLLECTION = 'users';

export const fetchUsers = async () => {
  const querySnapshot = await getDocs(collection(firestore, USERS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addUser = async (user) => {
  const docRef = await addDoc(collection(firestore, USERS_COLLECTION), user);
  return docRef.id;
};

export const updateUser = async (id, user) => {
  const userRef = doc(firestore, USERS_COLLECTION, id);
  await updateDoc(userRef, user);
};

export const deleteUser = async (id) => {
  const userRef = doc(firestore, USERS_COLLECTION, id);
  await deleteDoc(userRef);
};

export const fetchUsersByRole = async (role) => {
  const q = query(collection(firestore, USERS_COLLECTION), where("role", "==", role));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchUsersByStatus = async (status) => {
  const q = query(collection(firestore, USERS_COLLECTION), where("status", "==", status));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchUsersByEmails = async (emails) => {
  if (!emails || emails.length === 0) return [];
  // Firestore chỉ cho phép tối đa 10 phần tử trong mảng where('in')
  const chunks = [];
  for (let i = 0; i < emails.length; i += 10) {
    chunks.push(emails.slice(i, i + 10));
  }
  let users = [];
  for (const chunk of chunks) {
    const q = query(collection(firestore, USERS_COLLECTION), where('email', 'in', chunk));
    const querySnapshot = await getDocs(q);
    users = users.concat(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
  return users;
};

export const changePassword = async (newPassword) => {
  if (!auth.currentUser) throw new Error('Chưa đăng nhập');
  await updatePassword(auth.currentUser, newPassword);
};

export const fetchUsersByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  // Firestore chỉ cho phép tối đa 10 phần tử trong mảng where('in')
  const chunks = [];
  for (let i = 0; i < ids.length; i += 10) {
    chunks.push(ids.slice(i, i + 10));
  }
  let users = [];
  for (const chunk of chunks) {
    const q = query(collection(firestore, USERS_COLLECTION), where('__name__', 'in', chunk));
    const querySnapshot = await getDocs(q);
    users = users.concat(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }
  return users;
}; 