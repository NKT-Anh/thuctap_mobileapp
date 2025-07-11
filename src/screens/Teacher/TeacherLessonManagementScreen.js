import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { fetchLessons, addLesson, updateLesson, deleteLesson } from '../../services/lessonService';
import ClassPicker from '../../components/ClassPicker';

const TOPICS = ['Tất cả', 'Tin học cơ bản', 'Word', 'Excel', 'PowerPoint', 'Internet'];

export default function TeacherLessonManagementScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('Tất cả');
  const [modalVisible, setModalVisible] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', topic: 'Tin học cơ bản', attachment: '' });
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (selectedClass) loadLessons();
  }, [selectedClass]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const data = await fetchLessons(selectedClass);
      setLessons(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải bài học: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(l => {
    const matchClass = l.classId === selectedClass;
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || l.content?.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === 'Tất cả' ? true : l.topic === topic;
    return matchClass && matchSearch && matchTopic;
  });

  const openAddModal = () => {
    setEditLesson(null);
    setForm({ title: '', content: '', topic: 'Tin học cơ bản', attachment: '' });
    setModalVisible(true);
  };
  const openEditModal = (l) => {
    setEditLesson(l);
    setForm({ ...l });
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
    try {
      if (editLesson) {
        await updateLesson(editLesson.id, { ...form, classId: selectedClass });
        Alert.alert('Thành công', 'Đã cập nhật bài học!');
      } else {
        await addLesson({ ...form, classId: selectedClass });
        Alert.alert('Thành công', 'Đã thêm bài học mới!');
      }
      setModalVisible(false);
      loadLessons();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu bài học: ' + error.message);
    }
  };
  const handleDelete = (l) => {
    Alert.alert('Xác nhận', 'Xóa bài học này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteLesson(l.id);
            loadLessons();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa: ' + error.message);
          }
        }
      }
    ]);
  };

  if (!selectedClass) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} /><Text>Vui lòng chọn lớp để xem/quản lý bài học.</Text></View>;
  }

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text style={styles.title}>Quản lý Bài học</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm bài học..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {TOPICS.map(t => (
          <TouchableOpacity key={t} style={[styles.filterBtn, topic === t && styles.filterActive]} onPress={() => setTopic(t)}>
            <Text style={topic === t ? styles.filterActiveText : {}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredLessons}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.lessonRow} onPress={() => openEditModal(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonMeta}>Chủ đề: {item.topic}</Text>
              <Text numberOfLines={2} style={styles.lessonContent}>{item.content}</Text>
              {item.attachment ? <Text style={styles.lessonAttachment}>Tệp: {item.attachment}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Text style={{ color: 'red' }}>Xóa</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có bài học nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editLesson ? 'Sửa bài học' : 'Thêm bài học'}</Text>
            <TextInput style={styles.input} placeholder="Tiêu đề bài học" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Nội dung bài học" value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} multiline />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {TOPICS.slice(1).map(t => (
                <TouchableOpacity key={t} style={[styles.filterBtn, form.topic === t && styles.filterActive]} onPress={() => setForm(f => ({ ...f, topic: t }))}>
                  <Text style={form.topic === t ? styles.filterActiveText : {}}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Link file/hình ảnh/video (nếu có)" value={form.attachment} onChangeText={v => setForm(f => ({ ...f, attachment: v }))} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Hủy" color="gray" onPress={() => setModalVisible(false)} />
              <View style={{ width: 10 }} />
              <Button title={editLesson ? 'Lưu' : 'Thêm'} onPress={handleSave} />
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
  filterBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8 },
  filterActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterActiveText: { color: '#fff', fontWeight: 'bold' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  lessonTitle: { fontWeight: 'bold', fontSize: 16 },
  lessonMeta: { color: '#555', fontSize: 12 },
  lessonContent: { color: '#333', fontSize: 13 },
  lessonAttachment: { color: '#007AFF', fontSize: 12 },
  actionBtn: { marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
}); 