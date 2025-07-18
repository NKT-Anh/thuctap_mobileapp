import { doc, getDoc, collection, query, where, getDocs, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';

// Lấy email giáo viên từ classCode
export async function getTeacherEmailByClassCode(classCode) {
  const classDoc = await getDoc(doc(firestore, 'classes', classCode));
  if (!classDoc.exists()) throw new Error('Class not found');
  return classDoc.data().teacher;
}

// Lấy messages giữa học viên và giáo viên trong một lớp cụ thể
export async function getChatMessages(studentId, teacherEmail, classCode) {
  const chatsRef = collection(firestore, 'chats');
  const q = query(
    chatsRef,
    where('idStudent', '==', studentId),
    where('teacher', '==', teacherEmail),
    where('classCode', '==', classCode)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return [];
  const messages = querySnapshot.docs[0].data().messages || [];
  // Sắp xếp theo thời gian tăng dần
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}

// Gửi tin nhắn (lưu lịch sử chat theo từng lớp, kèm tên học viên và tên lớp)
export async function sendMessage(studentId, studentName, teacherEmail, classCode, className, content, sender = 'student') {
  const chatsRef = collection(firestore, 'chats');
  const q = query(
    chatsRef,
    where('idStudent', '==', studentId),
    where('teacher', '==', teacherEmail),
    where('classCode', '==', classCode)
  );
  const querySnapshot = await getDocs(q);

  const message = {
    sender,
    content,
    timestamp: Date.now()
  };

  if (querySnapshot.empty) {
    // Tạo mới
    await setDoc(doc(chatsRef), {
      idStudent: studentId,
      studentName,
      teacher: teacherEmail,
      classCode,
      className,
      messages: [message],
      teacherUnreadCount: sender === 'student' ? 1 : 0
    });
  } else {
    // Đã có, thêm vào messages
    const chatDoc = querySnapshot.docs[0];
    await updateDoc(chatDoc.ref, {
      messages: arrayUnion(message),
      ...(sender === 'student' && { teacherUnreadCount: increment(1) })
    });
  }
}