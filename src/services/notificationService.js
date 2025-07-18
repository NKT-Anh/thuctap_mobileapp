import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, arrayUnion } from 'firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';

export const fetchNotifications = async () => {
  const q = query(collection(firestore, NOTIFICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addNotification = async (notification) => {
  const docRef = await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
    ...notification,
    createdAt: new Date(),
  });
  return docRef.id;
};

export const updateNotification = async (id, notification) => {
  const notificationRef = doc(firestore, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(notificationRef, notification);
};

export const deleteNotification = async (id) => {
  const notificationRef = doc(firestore, NOTIFICATIONS_COLLECTION, id);
  await deleteDoc(notificationRef);
};

export const fetchNotificationsByType = async (type) => {
  const q = query(collection(firestore, NOTIFICATIONS_COLLECTION), where("type", "==", type), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchNotificationsByTeacherEmail = async (teacherEmail) => {
  const q = query(collection(firestore, NOTIFICATIONS_COLLECTION), where('teacherEmail', '==', teacherEmail), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const notiRef = doc(firestore, NOTIFICATIONS_COLLECTION, notificationId);
  await updateDoc(notiRef, { readBy: arrayUnion(userId) });
};

export const getUnreadNotificationCount = async (userId) => {
  const notiRef = collection(firestore, NOTIFICATIONS_COLLECTION);
  const snapshot = await getDocs(notiRef);
  let count = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.readBy || !data.readBy.includes(userId)) count++;
  });
  return count;
}; 