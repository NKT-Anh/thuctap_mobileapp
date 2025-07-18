import { firestore } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CONFIG_DOC = 'system_config';
const CONFIG_COLLECTION = 'config';

// Cấu hình mặc định
const DEFAULT_CONFIG = {
  examTimeLimit: 60,
  maxAttempts: 3,
  allowRetake: true,
  showResultsImmediately: false,
  enableNotifications: true,
  maxUploadSize: 10,
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: false,
  minimumPasswordLength: 6,
  sessionTimeout: 30,
  maxStudentsPerClass: 50,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const fetchConfig = async () => {
  try {
    const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      return configSnap.data();
    } else {
      // Nếu chưa có cấu hình, tạo cấu hình mặc định
      await setDoc(configRef, DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
  } catch (error) {
    console.error('Lỗi lấy cấu hình:', error);
    throw new Error('Không thể tải cấu hình hệ thống');
  }
};

export const updateConfig = async (newConfig) => {
  try {
    const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC);
    const updateData = {
      ...newConfig,
      updatedAt: new Date()
    };
    
    await setDoc(configRef, updateData, { merge: true });
    return updateData;
  } catch (error) {
    console.error('Lỗi cập nhật cấu hình:', error);
    throw new Error('Không thể cập nhật cấu hình hệ thống');
  }
};

export const resetConfig = async () => {
  try {
    const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC);
    await setDoc(configRef, DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Lỗi reset cấu hình:', error);
    throw new Error('Không thể reset cấu hình hệ thống');
  }
};

export const getConfigValue = async (key) => {
  try {
    const config = await fetchConfig();
    return config[key];
  } catch (error) {
    console.error('Lỗi lấy giá trị cấu hình:', error);
    return null;
  }
};

export const updateConfigValue = async (key, value) => {
  try {
    const configRef = doc(firestore, CONFIG_COLLECTION, CONFIG_DOC);
    await updateDoc(configRef, {
      [key]: value,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Lỗi cập nhật giá trị cấu hình:', error);
    throw new Error(`Không thể cập nhật ${key}`);
  }
}; 