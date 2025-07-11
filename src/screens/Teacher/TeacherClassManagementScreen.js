import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import { IconButton, TextInput as PaperTextInput } from 'react-native-paper';
import { fetchUsersByEmails, fetchUsersByRole } from '../../services/userService';

export default function TeacherClassManagementScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [form, setForm] = useState({ name: '', students: [] });
  const [studentInput, setStudentInput] = useState('');
  const { user } = useAuth();
  const [copySnackbar, setCopySnackbar] = useState(false);
  const [studentInfos, setStudentInfos] = useState([]);
  const [allStudentInfos, setAllStudentInfos] = useState([]);

  useEffect(() => {
    loadClasses();
  }, []);

  // Đặt ngoài useEffect, trong component
  const fetchStudentInfos = async (studentIds = form.students) => {
    if (studentIds && studentIds.length > 0) {
      const infos = allStudentInfos.filter(u => studentIds.includes(u.id));
      setStudentInfos(infos);
    } else {
      setStudentInfos([]);
    }
  };

  // Trong useEffect chỉ gọi lại hàm này
  useEffect(() => {
    fetchStudentInfos();
  }, [form.students, modalVisible]);

  useEffect(() => {
    // Lấy toàn bộ user có role student để map id sang email khi hiển thị danh sách lớp
    const fetchAllStudents = async () => {
      const students = await fetchUsersByRole('student');
      setAllStudentInfos(students);
    };
    fetchAllStudents();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(query(collection(firestore, 'classes'), where('teacher', '==', user.email)));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClasses(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditClass(null);
    setForm({ name: '', students: [] });
    setModalVisible(true);
  };
  const openEditModal = (c) => {
    setEditClass(c);
    setForm({ ...c });
    setModalVisible(true);
    fetchStudentInfos(c.students);
  };
  function generateClassCode() {
    // Sinh mã lớp ngắn, ví dụ 6 ký tự chữ số
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên lớp!');
      return;
    }
    try {
      if (editClass) {
        await updateDoc(doc(firestore, 'classes', editClass.id), form);
        Alert.alert('Thành công', 'Đã cập nhật lớp!');
      } else {
        // Gán teacher là email giáo viên, sinh mã lớp code
        await addDoc(collection(firestore, 'classes'), { ...form, teacher: user.email, code: generateClassCode() });
        Alert.alert('Thành công', 'Đã thêm lớp mới!');
      }
      setModalVisible(false);
      loadClasses();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu lớp: ' + error.message);
    }
  };
  const handleDelete = (c) => {
    Alert.alert('Xác nhận', 'Xóa lớp này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(firestore, 'classes', c.id));
            loadClasses();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa: ' + error.message);
          }
        }
      }
    ]);
  };
  const handleAddStudent = async () => {
    if (!studentInput.trim()) return;
    // Kiểm tra email có tồn tại và có role student không
    try {
      const users = await fetchUsersByEmails([studentInput.trim()]);
      if (!users.length || users[0].role !== 'student') {
        Alert.alert('Lỗi', 'Tài khoản chưa tồn tại hoặc không phải học viên!');
        return;
      }
      // Kiểm tra nếu id đã có trong lớp thì báo lỗi
      if ((form.students || []).includes(users[0].id)) {
        Alert.alert('Thông báo', 'Học viên đã có trong lớp này!');
        return;
      }
      // Thêm id user vào danh sách học viên (nếu chưa có)
      setForm(f => ({ ...f, students: [...(f.students || []), users[0].id] }));
      setStudentInput('');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể kiểm tra tài khoản: ' + e.message);
    }
  };
  const handleRemoveStudent = (studentId) => {
    setForm(f => ({ ...f, students: f.students.filter(s => s !== studentId) }));
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Quản lý Lớp học</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm lớp..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredClasses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          // Map id sang email
          const emails = (item.students || []).map(id => {
            const info = allStudentInfos.find(u => u.id === id);
            return info ? info.email : id;
          });
          return (
            <TouchableOpacity style={styles.classRow} onPress={() => openEditModal(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{item.name}</Text>
                <Text style={styles.classMeta}>Sĩ số: {item.students?.length || 0}</Text>
                <Text style={styles.classMeta}>Học viên: {emails.join(', ')}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <Text style={{ color: 'red' }}>Xóa</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có lớp nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <PaperTextInput
                value={form.code || ''}
                label="Mã lớp"
                mode="outlined"
                style={{ flex: 1, marginRight: 8 }}
                editable={false}
                selectTextOnFocus
              />
              {form.code && (
                <IconButton
                  icon="content-copy"
                  size={24}
                  onPress={async () => { await Clipboard.setStringAsync(form.code); setCopySnackbar(true); }}
                  accessibilityLabel="Sao chép mã lớp"
                />
              )}
            </View>
            <Text style={styles.modalTitle}>{editClass ? 'Sửa lớp' : 'Thêm lớp'}</Text>
            <TextInput style={styles.input} placeholder="Tên lớp" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Học viên trong lớp:</Text>
            <FlatList
              data={studentInfos}
              keyExtractor={s => s.id}
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ flex: 1 }}>{item.email}</Text>
                  <TouchableOpacity onPress={() => handleRemoveStudent(item.id)}>
                    <Text style={{ color: 'red' }}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={{ color: '#888' }}>Chưa có học viên</Text>}
            />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Email học viên"
                value={studentInput}
                onChangeText={setStudentInput}
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleAddStudent}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Hủy" color="gray" onPress={() => setModalVisible(false)} />
              <View style={{ width: 10 }} />
              <Button title={editClass ? 'Lưu' : 'Thêm'} onPress={handleSave} />
            </View>
          </View>
        </View>
      </Modal>
      <Snackbar
        visible={copySnackbar}
        onDismiss={() => setCopySnackbar(false)}
        duration={1500}
        style={{ backgroundColor: '#43a047' }}
      >
        Đã sao chép mã lớp!
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
  addBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, marginLeft: 8, justifyContent: 'center' },
  classRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  className: { fontWeight: 'bold', fontSize: 16 },
  classMeta: { color: '#555', fontSize: 12 },
  actionBtn: { marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
}); 