import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { fetchNotifications, addNotification, deleteNotification, fetchNotificationsByTeacherEmail } from '../../services/notificationService';
import { getTeacherClassesWithStats, getClassDetail } from '../../services/teacherClassService';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../../firebaseConfig';
import { getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

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
  const [showSearch, setShowSearch] = useState(false);

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
      console.log('Current user email:', user.email);
      const data = await fetchNotificationsByTeacherEmail(user.email);
      console.log('Fetched notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.log('Error loading notifications:', error);
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
      let newNoti = null;
      for (const student of students) {
        try {
          const notiData = {
            userId: student.id,
            classId: selectedClass,
            teacherEmail: user.email,
            title: form.title,
            content: form.content,
            createdAt: new Date(),
            type: 'class',
          };
          await addNotification(notiData);
          if (!newNoti) newNoti = { ...notiData, id: Math.random().toString(36).substr(2, 9) };
          success++;
        } catch {
          fail++;
        }
      }
      Alert.alert('Kết quả', `Đã gửi thông báo cho ${success} học viên${fail ? ', lỗi: ' + fail : ''}`);
      setModalVisible(false);
      // Hiển thị thông báo mới ngay lập tức
      if (newNoti) setNotifications(prev => [newNoti, ...prev]);
      // loadNotifications(); // Không cần gọi lại ngay
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

  const getClassAvatarColor = (classId) => {
    // Tạo màu dựa trên id lớp
    const colors = ['#6C63FF', '#FFB830', '#FF6363', '#43D8C9', '#3A86FF', '#FF006E', '#8338EC', '#FB5607'];
    let hash = 0;
    for (let i = 0; i < classId.length; i++) hash = classId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getDateStr = (createdAt) => {
    if (!createdAt) return '';
    if (createdAt.seconds) return format(new Date(createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm');
    // Nếu là string hoặc Date
    try {
      return format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
    } catch {
      return '';
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f6f8fa' }}>
      <Text style={styles.title}>Gửi Thông báo</Text>
      {/* Floating Search Button */}
      {!showSearch && (
        <TouchableOpacity style={styles.fabSearch} onPress={() => setShowSearch(true)}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      {/* Search Overlay */}
      {showSearch && (
        <View style={styles.searchOverlay}>
          <View style={styles.searchBarOverlay}>
            <Ionicons name="search" size={20} color="#888" style={{ marginLeft: 8 }} />
            <TextInput
              style={styles.searchInputOverlay}
              placeholder="Tìm kiếm thông báo..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#aaa"
              autoFocus
            />
            <TouchableOpacity onPress={() => setShowSearch(false)}>
              <Ionicons name="close" size={22} color="#888" style={{ marginHorizontal: 8 }} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Danh sách thông báo */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const dateStr = getDateStr(item.createdAt);
          return (
            <TouchableOpacity
              onPress={() => { setSelectedNoti(item); setDetailModal(true); }}
              activeOpacity={0.85}
              style={styles.notiCardWrap}
            >
              <View style={styles.notiCardNew}>
                {/* Nút xóa ở góc phải trên */}
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                  <Ionicons name="close-circle" size={22} color="#ff4d4f" />
                </TouchableOpacity>
                <View style={[styles.avatarCircle, { backgroundColor: getClassAvatarColor(item.classId || '') }] }>
                  <Text style={styles.avatarText}>{(classMap[item.classId]?.[0] || item.classId?.[0] || 'C').toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 14, justifyContent: 'center' }}>
                  <Text style={styles.notiTitleNew}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 2 }}>
                    <MaterialCommunityIcons name="google-classroom" size={16} color="#888" />
                    <Text style={styles.notiMetaNew} numberOfLines={1}>
                      {'  '}{classMap[item.classId] || item.classId || '---'}
                    </Text>
                    <Ionicons name="calendar-outline" size={15} color="#888" style={{ marginLeft: 14 }} />
                    <Text style={styles.notiDateText}>{dateStr || 'Không rõ'}</Text>
                  </View>
                  <Text style={styles.notiContentNew} numberOfLines={2}>{item.content}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Không có thông báo nào.</Text>}
      />
      {/* Floating Action Button gửi thông báo */}
      <TouchableOpacity style={styles.fabSend} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      {/* Modal gửi thông báo và modal chi tiết giữ nguyên */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="notifications" size={22} color="#007AFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Gửi Thông báo</Text>
            </View>
            <Text style={{ marginBottom: 8, color: '#333' }}>Chọn lớp:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {classes.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.classBtn, selectedClass === c.id && styles.classBtnActive]}
                  onPress={() => setSelectedClass(c.id)}
                >
                  <Text style={selectedClass === c.id ? styles.classBtnActiveText : styles.classBtnText}>{c.name || c.id}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={styles.input} placeholder="Tiêu đề" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Nội dung" value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} multiline />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#888', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.sendBtn, sending && { backgroundColor: '#ccc' }]} disabled={sending}>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6 }}>{sending ? 'Đang gửi...' : 'Gửi'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={detailModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContentDetail}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="notifications" size={24} color="#007AFF" style={{ marginRight: 10 }} />
              <Text style={styles.modalTitleDetail}>{selectedNoti?.title}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={[styles.avatarCircle, { backgroundColor: getClassAvatarColor(selectedNoti?.classId || '') }] }>
                <Text style={styles.avatarText}>{(classMap[selectedNoti?.classId]?.[0] || selectedNoti?.classId?.[0] || 'C').toUpperCase()}</Text>
              </View>
              <Text style={[styles.notiMetaNew, { marginLeft: 10 }]}>{classMap[selectedNoti?.classId] || selectedNoti?.classId || '---'}</Text>
            </View>
            <Text style={styles.notiContentDetail}>{selectedNoti?.content}</Text>
            <Text style={[styles.notiMetaNew, { marginTop: 10, textAlign: 'right' }]}>
              {selectedNoti?.createdAt?.seconds ? new Date(selectedNoti.createdAt.seconds * 1000).toLocaleString() : ''}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
              <TouchableOpacity onPress={() => setDetailModal(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#222' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, borderWidth: 1, borderColor: '#eee', marginRight: 10, height: 40 },
  searchInput: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, fontSize: 15, color: '#222', borderRadius: 25 },
  addBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  notiCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: '#fff', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  notiTitle: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  notiContent: { color: '#444', fontSize: 13, marginTop: 4 },
  notiMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  actionBtn: { marginLeft: 10, padding: 6, borderRadius: 20, backgroundColor: '#fbeaea' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 22, borderRadius: 16, width: 350, elevation: 4 },
  modalTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  classBtn: { paddingVertical: 7, paddingHorizontal: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, marginRight: 8, backgroundColor: '#fff' },
  classBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  classBtnText: { color: '#222' },
  classBtnActiveText: { color: '#fff', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#f9f9f9', fontSize: 15, color: '#222' },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#f2f2f2', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, justifyContent: 'center' },
  notiCardWrap: { marginBottom: 18 },
  notiCardNew: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    marginBottom: 8,
    minHeight: 90,
  },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 22 },
  notiTitleNew: { fontWeight: 'bold', fontSize: 17, color: '#222', marginBottom: 2 },
  notiContentNew: { color: '#444', fontSize: 14, marginTop: 2 },
  notiMetaNew: { color: '#888', fontSize: 12 },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 2,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
  },
  modalContentDetail: { backgroundColor: '#fff', padding: 26, borderRadius: 18, width: 360, elevation: 6 },
  modalTitleDetail: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
  notiContentDetail: { color: '#333', fontSize: 16, marginVertical: 16 },
  notiDateBox: { alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  notiDateText: { color: '#888', fontSize: 13, marginLeft: 2, fontWeight: 'bold' },
  fabSearch: { position: 'absolute', top: 6, right: 18, zIndex: 20, backgroundColor: '#007AFF', borderRadius: 25, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabSend: { position: 'absolute', bottom: 28, right: 24, zIndex: 20, backgroundColor: '#007AFF', borderRadius: 32, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8 },
  searchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.98)', paddingTop: 40, paddingBottom: 10, zIndex: 30, elevation: 10 },
  searchBarOverlay: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 25, marginHorizontal: 18, paddingHorizontal: 8, height: 44, borderWidth: 1, borderColor: '#eee' },
  searchInputOverlay: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, fontSize: 16, color: '#222', borderRadius: 25 },
  notiDateBoxFixed: undefined, // Xóa style này nếu không còn dùng
});