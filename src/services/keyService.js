import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const KEYS_COLLECTION = 'keys';

export const fetchKeys = async () => {
  const querySnapshot = await getDocs(collection(firestore, KEYS_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addKey = async (keyData) => {
  const docRef = await addDoc(collection(firestore, KEYS_COLLECTION), keyData);
  return docRef.id;
};

export const updateKey = async (id, keyData) => {
  const keyRef = doc(firestore, KEYS_COLLECTION, id);
  await updateDoc(keyRef, keyData);
};

export const deleteKey = async (id) => {
  const keyRef = doc(firestore, KEYS_COLLECTION, id);
  await deleteDoc(keyRef);
};

export const fetchKeysByStatus = async (status) => {
  const q = query(collection(firestore, KEYS_COLLECTION), where("status", "==", status));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchKeysByType = async (type) => {
  const q = query(collection(firestore, KEYS_COLLECTION), where("type", "==", type));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}; 