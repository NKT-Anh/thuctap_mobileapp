import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';

const EXAMS_COLLECTION = 'exams';

export const fetchExams = async (classId = null) => {
  try {
    let querySnapshot;
    
    if (classId) {
      const q = query(
        collection(firestore, EXAMS_COLLECTION), 
        where('classId', '==', classId)
      );
      querySnapshot = await getDocs(q);
    } else {
      // Cho admin - lấy tất cả exam
      querySnapshot = await getDocs(collection(firestore, EXAMS_COLLECTION));
    }
    
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side (mới nhất trước)
    return exams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đề thi:', error);
    throw new Error('Không thể tải danh sách đề thi');
  }
};

export const addExam = async (exam) => {
  try {
    const examData = {
      ...exam,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(firestore, EXAMS_COLLECTION), examData);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi thêm đề thi:', error);
    throw new Error('Không thể thêm đề thi');
  }
};

export const updateExam = async (id, exam) => {
  try {
    const examRef = doc(firestore, EXAMS_COLLECTION, id);
    const updateData = {
      ...exam,
      updatedAt: new Date()
    };
    await updateDoc(examRef, updateData);
  } catch (error) {
    console.error('Lỗi cập nhật đề thi:', error);
    throw new Error('Không thể cập nhật đề thi');
  }
};

export const deleteExam = async (id) => {
  try {
    const examRef = doc(firestore, EXAMS_COLLECTION, id);
    await deleteDoc(examRef);
  } catch (error) {
    console.error('Lỗi xóa đề thi:', error);
    throw new Error('Không thể xóa đề thi');
  }
};

export const fetchExamsByType = async (type) => {
  try {
    const q = query(
      collection(firestore, EXAMS_COLLECTION), 
      where("type", "==", type)
    );
    const querySnapshot = await getDocs(q);
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return exams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy đề thi theo loại:', error);
    throw new Error('Không thể tải đề thi theo loại');
  }
};

export const fetchExamsByStatus = async (status) => {
  try {
    const q = query(
      collection(firestore, EXAMS_COLLECTION), 
      where("status", "==", status)
    );
    const querySnapshot = await getDocs(q);
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return exams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy đề thi theo trạng thái:', error);
    throw new Error('Không thể tải đề thi theo trạng thái');
  }
};

export const fetchExamsBySubject = async (subject) => {
  try {
    const q = query(
      collection(firestore, EXAMS_COLLECTION), 
      where("subject", "==", subject)
    );
    const querySnapshot = await getDocs(q);
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return exams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy đề thi theo môn học:', error);
    throw new Error('Không thể tải đề thi theo môn học');
  }
};

export const fetchExamsByDifficulty = async (difficulty) => {
  try {
    const q = query(
      collection(firestore, EXAMS_COLLECTION), 
      where("difficulty", "==", difficulty)
    );
    const querySnapshot = await getDocs(q);
    const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return exams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy đề thi theo độ khó:', error);
    throw new Error('Không thể tải đề thi theo độ khó');
  }
};

export const searchExams = async (searchTerm) => {
  try {
    // Lấy tất cả exams và tìm kiếm trên client-side
    const querySnapshot = await getDocs(collection(firestore, EXAMS_COLLECTION));
    const allExams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Tìm kiếm client-side vì Firestore không hỗ trợ full-text search
    const filteredExams = allExams.filter(exam => 
      exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sắp xếp kết quả theo createdAt
    return filteredExams.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm đề thi:', error);
    throw new Error('Không thể tìm kiếm đề thi');
  }
};

export const duplicateExam = async (examId) => {
  try {
    const examRef = doc(firestore, EXAMS_COLLECTION, examId);
    const examSnap = await getDoc(examRef);
    
    if (examSnap.exists()) {
      const examData = examSnap.data();
      const newExam = {
        ...examData,
        title: `${examData.title} (Bản sao)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(firestore, EXAMS_COLLECTION), newExam);
      return docRef.id;
    } else {
      throw new Error('Không tìm thấy đề thi');
    }
  } catch (error) {
    console.error('Lỗi sao chép đề thi:', error);
    throw new Error('Không thể sao chép đề thi');
  }
}; 