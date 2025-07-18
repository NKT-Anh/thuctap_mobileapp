import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { fetchLessons, addLesson, updateLesson, deleteLesson } from '../../services/lessonService';
import ClassPicker from '../../components/ClassPicker';
import { Card, IconButton } from 'react-native-paper';

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
    const matchTopic = form.topic === 'Tất cả' ? true : l.topic === form.topic;
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
    <View style={{ flex: 1, backgroundColor: '#f6f8fa', padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1976d2', marginBottom: 12 }}>Quản lý Bài học</Text>
      <View style={{ flexDirection: 'row', marginBottom: 14 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 0, borderRadius: 8, backgroundColor: '#fff', padding: 12, marginRight: 8, elevation: 1 }}
          placeholder="Tìm kiếm bài học..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={{ backgroundColor: '#1976d2', borderRadius: 24, padding: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 }} onPress={openAddModal}>
          <IconButton icon="plus" color="#fff" size={24} style={{ margin: 0 }} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 2, paddingBottom:30 }} // tăng paddingVertical
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 50, // tăng minHeight
            zIndex: 1,     // đảm bảo nằm trên
          }}
        >
          <Text style={{ alignSelf: 'center', marginRight: 8, color: '#333' }}>Chủ đề:</Text>
          {TOPICS.map(t => (
            <TouchableOpacity
              key={t}
              style={{
                backgroundColor: form.topic === t ? '#1976d2' : '#e3eafc',
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 8,
                marginRight: 8,
                minHeight: 20, // tăng minHeight cho chip
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => setForm(f => ({ ...f, topic: t }))}
            >
              <Text
                style={{
                  color: form.topic === t ? '#fff' : '#1976d2',
                  fontWeight: 'bold',
                  fontSize: 15
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <FlatList
        data={filteredLessons}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 14, borderRadius: 16, elevation: 2, backgroundColor: '#fff' }} onPress={() => openEditModal(item)}>
            <Card.Title title={item.title} subtitle={`Chủ đề: ${item.topic}`} titleStyle={{ fontWeight: 'bold', fontSize: 18 }} />
            <Card.Content>
              <Text style={{ color: '#555', marginBottom: 8 }}>{item.content}</Text>
              {item.attachment ? <Text style={{ color: '#1976d2', fontSize: 12 }}>Tệp: {item.attachment}</Text> : null}
            </Card.Content>
            <Card.Actions style={{ justifyContent: 'flex-end' }}>
              <IconButton icon="delete" color="#d32f2f" size={22} onPress={() => handleDelete(item)} />
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Không có bài học nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 12 }}>{editLesson ? 'Sửa bài học' : 'Thêm bài học'}</Text>
            <TextInput
              value={form.title}
              onChangeText={v => setForm(f => ({ ...f, title: v }))}
              placeholder="Tiêu đề"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10 }}
            />
            <TextInput
              value={form.content}
              onChangeText={v => setForm(f => ({ ...f, content: v }))}
              placeholder="Nội dung"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10, height: 80 }}
              multiline
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, paddingVertical: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {['Tin học cơ bản', 'Word', 'Excel', 'PowerPoint', 'Internet', 'Access', 'Lập trình', 'Mạng máy tính'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      backgroundColor: form.topic === t ? '#1976d2' : '#e3eafc',
                      borderRadius: 16,
                      paddingHorizontal: 20, // tăng lên cho rộng
                      paddingVertical: 8,    // tăng lên cho cao
                      marginRight: 8,
                      minWidth: undefined    // bỏ minWidth nếu có
                    }}
                    onPress={() => setForm(f => ({ ...f, topic: t }))}
                  >
                    <Text
                      style={{
                        color: form.topic === t ? '#fff' : '#1976d2',
                        fontWeight: 'bold',
                        fontSize: 15
                      }}
                      numberOfLines={1} // chỉ để tránh quá dài, không cắt chữ
                      ellipsizeMode="tail"
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TextInput
              value={form.attachment}
              onChangeText={v => setForm(f => ({ ...f, attachment: v }))}
              placeholder="Link file/hình ảnh/video (nếu có)"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10 }}
            />
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