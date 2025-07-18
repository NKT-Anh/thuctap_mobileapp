import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

const KEYS_COLLECTION = 'keys';

export const fetchKeys = async () => {
  try {
    // Lấy tất cả keys và sắp xếp trên client-side
    const querySnapshot = await getDocs(collection(firestore, KEYS_COLLECTION));
    const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return keys.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách key:', error);
    throw new Error('Không thể tải danh sách key');
  }
};

export const addKey = async (keyData) => {
  try {
    const newKeyData = {
      ...keyData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(firestore, KEYS_COLLECTION), newKeyData);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi thêm key:', error);
    throw new Error('Không thể thêm key');
  }
};

export const updateKey = async (id, keyData) => {
  try {
    const keyRef = doc(firestore, KEYS_COLLECTION, id);
    const updateData = {
      ...keyData,
      updatedAt: new Date()
    };
    await updateDoc(keyRef, updateData);
  } catch (error) {
    console.error('Lỗi cập nhật key:', error);
    throw new Error('Không thể cập nhật key');
  }
};

export const deleteKey = async (id) => {
  try {
    const keyRef = doc(firestore, KEYS_COLLECTION, id);
    await deleteDoc(keyRef);
  } catch (error) {
    console.error('Lỗi xóa key:', error);
    throw new Error('Không thể xóa key');
  }
};

export const fetchKeysByStatus = async (status) => {
  try {
    const q = query(
      collection(firestore, KEYS_COLLECTION), 
      where("isActive", "==", status)
    );
    const querySnapshot = await getDocs(q);
    const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return keys.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy key theo trạng thái:', error);
    throw new Error('Không thể tải key theo trạng thái');
  }
};

export const fetchKeysByType = async (type) => {
  try {
    const q = query(
      collection(firestore, KEYS_COLLECTION), 
      where("type", "==", type)
    );
    const querySnapshot = await getDocs(q);
    const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return keys.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy key theo loại:', error);
    throw new Error('Không thể tải key theo loại');
  }
};

export const generateApiKey = async () => {
  try {
    // Tạo API key ngẫu nhiên
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const prefix = 'kc_'; // KICODE prefix
    
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return prefix + result;
  } catch (error) {
    console.error('Lỗi tạo API key:', error);
    throw new Error('Không thể tạo API key');
  }
};

export const validateApiKey = async (keyValue) => {
  try {
    const q = query(
      collection(firestore, KEYS_COLLECTION),
      where("keyValue", "==", keyValue),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const keyDoc = querySnapshot.docs[0];
    const keyData = { id: keyDoc.id, ...keyDoc.data() };
    
    // Kiểm tra hết hạn
    if (keyData.expiresAt && new Date(keyData.expiresAt.seconds * 1000) < new Date()) {
      return null;
    }
    
    // Kiểm tra giới hạn sử dụng
    if (keyData.currentUsage >= keyData.maxUsage) {
      return null;
    }
    
    return keyData;
  } catch (error) {
    console.error('Lỗi xác thực API key:', error);
    return null;
  }
};

export const incrementKeyUsage = async (keyId) => {
  try {
    const keyRef = doc(firestore, KEYS_COLLECTION, keyId);
    await updateDoc(keyRef, {
      currentUsage: firestore.FieldValue.increment(1),
      lastUsedAt: new Date()
    });
  } catch (error) {
    console.error('Lỗi tăng số lần sử dụng key:', error);
    throw new Error('Không thể cập nhật số lần sử dụng key');
  }
};

export const revokeKey = async (keyId) => {
  try {
    const keyRef = doc(firestore, KEYS_COLLECTION, keyId);
    await updateDoc(keyRef, {
      isActive: false,
      revokedAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Lỗi thu hồi key:', error);
    throw new Error('Không thể thu hồi key');
  }
};

export const getKeyUsageStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, KEYS_COLLECTION));
    const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const stats = {
      total: keys.length,
      active: keys.filter(k => k.isActive).length,
      expired: keys.filter(k => k.expiresAt && new Date(k.expiresAt.seconds * 1000) < new Date()).length,
      overLimit: keys.filter(k => k.currentUsage >= k.maxUsage).length,
      totalUsage: keys.reduce((sum, k) => sum + (k.currentUsage || 0), 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Lỗi lấy thống kê key:', error);
    throw new Error('Không thể tải thống kê key');
  }
}; 