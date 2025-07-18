import { firestore } from '../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, getDoc } from 'firebase/firestore';

const ROLES_COLLECTION = 'roles';
const PERMISSIONS_COLLECTION = 'permissions';

export const fetchRoles = async () => {
  try {
    // Lấy tất cả roles và sắp xếp trên client-side
    const querySnapshot = await getDocs(collection(firestore, ROLES_COLLECTION));
    const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return roles.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách vai trò:', error);
    throw new Error('Không thể tải danh sách vai trò');
  }
};

export const addRole = async (role) => {
  try {
    const roleData = {
      ...role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(firestore, ROLES_COLLECTION), roleData);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi thêm vai trò:', error);
    throw new Error('Không thể thêm vai trò');
  }
};

export const updateRole = async (id, role) => {
  try {
    const roleRef = doc(firestore, ROLES_COLLECTION, id);
    const updateData = {
      ...role,
      updatedAt: new Date()
    };
    await updateDoc(roleRef, updateData);
  } catch (error) {
    console.error('Lỗi cập nhật vai trò:', error);
    throw new Error('Không thể cập nhật vai trò');
  }
};

export const deleteRole = async (id) => {
  try {
    const roleRef = doc(firestore, ROLES_COLLECTION, id);
    await deleteDoc(roleRef);
  } catch (error) {
    console.error('Lỗi xóa vai trò:', error);
    throw new Error('Không thể xóa vai trò');
  }
};

export const fetchRolesByLevel = async (level) => {
  try {
    const q = query(
      collection(firestore, ROLES_COLLECTION), 
      where("level", "==", level)
    );
    const querySnapshot = await getDocs(q);
    const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return roles.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy vai trò theo cấp độ:', error);
    throw new Error('Không thể tải vai trò theo cấp độ');
  }
};

export const fetchActiveRoles = async () => {
  try {
    const q = query(
      collection(firestore, ROLES_COLLECTION), 
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sắp xếp theo createdAt trên client-side
    return roles.sort((a, b) => {
      const aDate = a.createdAt?.toDate() || new Date(0);
      const bDate = b.createdAt?.toDate() || new Date(0);
      return bDate - aDate;
    });
  } catch (error) {
    console.error('Lỗi lấy vai trò hoạt động:', error);
    throw new Error('Không thể tải vai trò hoạt động');
  }
};

export const fetchDefaultRole = async () => {
  try {
    const q = query(
      collection(firestore, ROLES_COLLECTION), 
      where("isDefault", "==", true),
      where("isActive", "==", true)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi lấy vai trò mặc định:', error);
    throw new Error('Không thể tải vai trò mặc định');
  }
};

export const fetchPermissions = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, PERMISSIONS_COLLECTION));
    const permissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Nếu chưa có permissions trong DB, trả về permissions mặc định
    if (permissions.length === 0) {
      return [
        { id: 'read:users', name: 'Xem người dùng', category: 'users' },
        { id: 'write:users', name: 'Quản lý người dùng', category: 'users' },
        { id: 'read:exams', name: 'Xem đề thi', category: 'exams' },
        { id: 'write:exams', name: 'Quản lý đề thi', category: 'exams' },
        { id: 'read:lessons', name: 'Xem bài học', category: 'lessons' },
        { id: 'write:lessons', name: 'Quản lý bài học', category: 'lessons' },
        { id: 'read:questions', name: 'Xem câu hỏi', category: 'questions' },
        { id: 'write:questions', name: 'Quản lý câu hỏi', category: 'questions' },
        { id: 'read:statistics', name: 'Xem thống kê', category: 'statistics' },
        { id: 'write:statistics', name: 'Quản lý thống kê', category: 'statistics' },
        { id: 'read:config', name: 'Xem cấu hình', category: 'config' },
        { id: 'write:config', name: 'Quản lý cấu hình', category: 'config' },
        { id: 'admin:all', name: 'Toàn quyền admin', category: 'admin' }
      ];
    }
    
    return permissions;
  } catch (error) {
    console.error('Lỗi lấy danh sách quyền:', error);
    throw new Error('Không thể tải danh sách quyền');
  }
};

export const addPermission = async (permission) => {
  try {
    const permissionData = {
      ...permission,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const docRef = await addDoc(collection(firestore, PERMISSIONS_COLLECTION), permissionData);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi thêm quyền:', error);
    throw new Error('Không thể thêm quyền');
  }
};

export const checkUserPermission = async (userId, permission) => {
  try {
    // Lấy vai trò của user từ collection users
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }
    
    const userData = userSnap.data();
    const userRoleId = userData.roleId;
    
    if (!userRoleId) {
      return false;
    }
    
    // Lấy thông tin vai trò
    const roleRef = doc(firestore, ROLES_COLLECTION, userRoleId);
    const roleSnap = await getDoc(roleRef);
    
    if (!roleSnap.exists()) {
      return false;
    }
    
    const roleData = roleSnap.data();
    
    // Kiểm tra quyền
    if (roleData.permissions?.includes('admin:all')) {
      return true; // Admin có tất cả quyền
    }
    
    return roleData.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Lỗi kiểm tra quyền người dùng:', error);
    return false;
  }
};

export const assignRoleToUser = async (userId, roleId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      roleId: roleId,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Lỗi gán vai trò cho người dùng:', error);
    throw new Error('Không thể gán vai trò cho người dùng');
  }
};

export const getRoleStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(firestore, ROLES_COLLECTION));
    const roles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const stats = {
      total: roles.length,
      active: roles.filter(r => r.isActive).length,
      default: roles.filter(r => r.isDefault).length,
      inactive: roles.filter(r => !r.isActive).length
    };
    
    return stats;
  } catch (error) {
    console.error('Lỗi lấy thống kê vai trò:', error);
    throw new Error('Không thể tải thống kê vai trò');
  }
}; 