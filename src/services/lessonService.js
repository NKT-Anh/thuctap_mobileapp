import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

const LESSONS_COLLECTION = 'lessons';

export const fetchLessons = async () => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION),
      orderBy('order', 'asc'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy danh sách bài học:', error);
    throw new Error('Không thể tải danh sách bài học');
  }
};

export const addLesson = async (lesson) => {
  try {
    const lessonData = {
      ...lesson,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(firestore, LESSONS_COLLECTION), lessonData);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi thêm bài học:', error);
    throw new Error('Không thể thêm bài học');
  }
};

export const updateLesson = async (id, lesson) => {
  try {
    const lessonRef = doc(firestore, LESSONS_COLLECTION, id);
    const updateData = {
      ...lesson,
      updatedAt: new Date()
    };
    await updateDoc(lessonRef, updateData);
  } catch (error) {
    console.error('Lỗi cập nhật bài học:', error);
    throw new Error('Không thể cập nhật bài học');
  }
};

export const deleteLesson = async (id) => {
  try {
    const lessonRef = doc(firestore, LESSONS_COLLECTION, id);
    await deleteDoc(lessonRef);
  } catch (error) {
    console.error('Lỗi xóa bài học:', error);
    throw new Error('Không thể xóa bài học');
  }
};

export const fetchLessonsBySubject = async (subject) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION), 
      where("subject", "==", subject),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy bài học theo môn học:', error);
    throw new Error('Không thể tải bài học theo môn học');
  }
};

export const fetchLessonsByDifficulty = async (difficulty) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION), 
      where("difficulty", "==", difficulty),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy bài học theo độ khó:', error);
    throw new Error('Không thể tải bài học theo độ khó');
  }
};

export const fetchLessonsByStatus = async (status) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION), 
      where("status", "==", status),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy bài học theo trạng thái:', error);
    throw new Error('Không thể tải bài học theo trạng thái');
  }
};

export const fetchLessonsByTopic = async (topic) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION), 
      where("topic", "==", topic),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy bài học theo chủ đề:', error);
    throw new Error('Không thể tải bài học theo chủ đề');
  }
};

export const fetchLessonsByLevel = async (level) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION), 
      where("level", "==", level),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Lỗi lấy bài học theo cấp độ:', error);
    throw new Error('Không thể tải bài học theo cấp độ');
  }
};

export const searchLessons = async (searchTerm) => {
  try {
    const q = query(
      collection(firestore, LESSONS_COLLECTION),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const allLessons = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Tìm kiếm client-side
    return allLessons.filter(lesson => 
      lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Lỗi tìm kiếm bài học:', error);
    throw new Error('Không thể tìm kiếm bài học');
  }
};

export const reorderLessons = async (lessonId, newOrder) => {
  try {
    const lessonRef = doc(firestore, LESSONS_COLLECTION, lessonId);
    await updateDoc(lessonRef, {
      order: newOrder,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Lỗi sắp xếp lại thứ tự bài học:', error);
    throw new Error('Không thể sắp xếp lại thứ tự bài học');
  }
}; 