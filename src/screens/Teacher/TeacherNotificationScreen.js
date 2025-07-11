import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { fetchNotifications, addNotification, deleteNotification, fetchNotificationsByTeacherEmail } from '../../services/notificationService';
import { getTeacherClassesWithStats, getClassDetail } from '../../services/teacherClassService';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../../firebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';

export default function TeacherNotificationScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'teacher' });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sending, setSending] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [classMap, setClassMap] = useState({});

  useEffect(() => {
    loadNotifications();
    loadClasses();
  }, []);

  useEffect(() => {
    const fetchClassNames = async () => {
      const classIds = Array.from(new Set(notifications.map(n => n.classId).filter(Boolean)));
      if (classIds.length === 0) return;
      let map = {};
      for (let i = 0; i < classIds.length; i += 10) {
        const chunk = classIds.slice(i, i + 10);
        const q = query(collection(firestore, 'classes'), where('__name__', 'in', chunk));
        const snap = await getDocs(q);
        snap.forEach(doc => { map[doc.id] = doc.data().name; });
      }
      setClassMap(map);
    };
    fetchClassNames();
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchNotificationsByTeacherEmail(user.email);
      setNotifications(data.filter(n => n.type === 'class'));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông báo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const data = await getTeacherClassesWithStats(user.email);
      setClasses(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp: ' + error.message);
    }
  };

  const filteredNotifications = notifications.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setForm({ title: '', content: '', type: 'teacher' });
    setSelectedClass('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung!');
      return;
    }
    if (!selectedClass) {
      Alert.alert('Lỗi', 'Vui lòng chọn lớp!');
      return;
    }
    setSending(true);
    try {
      // Lấy danh sách học viên trong lớp
      const detail = await getClassDetail(selectedClass);
      const students = detail.students || [];
      if (students.length === 0) {
        Alert.alert('Không có học viên nào trong lớp này!');
        setSending(false);
        return;
      }
      // Gửi thông báo cho từng học viên
      let success = 0, fail = 0;
      for (const student of students) {
        try {
          await addNotification({
            userId: student.id,
            classId: selectedClass,
            teacherEmail: user.email,
            title: form.title,
            content: form.content,
            createdAt: new Date(),
            type: 'class',
          });
          success++;
        } catch {
          fail++;
        }
      }
      Alert.alert('Kết quả', `Đã gửi thông báo cho ${success} học viên${fail ? ', lỗi: ' + fail : ''}`);
      setModalVisible(false);
      loadNotifications();
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi thông báo!');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (n) => {
    Alert.alert('Xác nhận', 'Xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteNotification(n.id);
            loadNotifications();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa: ' + error.message);
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Gửi Thông báo</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm thông báo..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Gửi</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelectedNoti(item); setDetailModal(true); }}>
            <View style={styles.notiRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.notiTitle}>{item.title}</Text>
                <Text style={styles.notiMeta}>Lớp: {classMap[item.classId] || item.classId || '---'}</Text>
                <Text style={styles.notiMeta}>
                  Ngày: {item.createdAt?.seconds
                    ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                    : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                <Text style={{ color: 'red' }}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có thông báo nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gửi Thông báo</Text>
            <Text style={{ marginBottom: 8 }}>Chọn lớp:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {classes.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.classBtn, selectedClass === c.id && styles.classBtnActive]}
                  onPress={() => setSelectedClass(c.id)}
                >
                  <Text style={selectedClass === c.id ? styles.classBtnActiveText : {}}>{c.name || c.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={styles.input} placeholder="Tiêu đề" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Nội dung" value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Hủy" color="gray" onPress={() => setModalVisible(false)} />
              <View style={{ width: 10 }} />
              <Button title={sending ? 'Đang gửi...' : 'Gửi'} onPress={handleSave} disabled={sending} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={detailModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedNoti?.title}</Text>
            <Text style={styles.notiMeta}>Lớp: {classMap[selectedNoti?.classId] || selectedNoti?.classId || '---'}</Text>
            <Text style={{ marginVertical: 10 }}>{selectedNoti?.content}</Text>
            <Text style={styles.notiMeta}>
              {selectedNoti?.createdAt?.seconds
                ? new Date(selectedNoti.createdAt.seconds * 1000).toLocaleString()
                : ''}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Đóng" onPress={() => setDetailModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
  addBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5, marginLeft: 8, justifyContent: 'center' },
  notiRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  notiTitle: { fontWeight: 'bold', fontSize: 16 },
  notiContent: { color: '#333', fontSize: 13 },
  notiMeta: { color: '#888', fontSize: 12 },
  actionBtn: { marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  classBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8, backgroundColor: '#fff' },
  classBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  classBtnActiveText: { color: '#fff', fontWeight: 'bold' },
});