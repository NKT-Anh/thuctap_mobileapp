import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const ROLES_COLLECTION = 'roles';

export const fetchRoles = async () => {
  const querySnapshot = await getDocs(collection(firestore, ROLES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addRole = async (role) => {
  const docRef = await addDoc(collection(firestore, ROLES_COLLECTION), role);
  return docRef.id;
};

export const updateRole = async (id, role) => {
  const roleRef = doc(firestore, ROLES_COLLECTION, id);
  await updateDoc(roleRef, role);
};

export const deleteRole = async (id) => {
  const roleRef = doc(firestore, ROLES_COLLECTION, id);
  await deleteDoc(roleRef);
};

export const fetchRolesByLevel = async (level) => {
  const q = query(collection(firestore, ROLES_COLLECTION), where("level", "==", level));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 