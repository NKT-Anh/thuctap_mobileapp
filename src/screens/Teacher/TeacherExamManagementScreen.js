import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { fetchExams, addExam, updateExam, deleteExam } from '../../services/examService';
import { fetchQuestions } from '../../services/questionService';
import ClassPicker from '../../components/ClassPicker';
import { useAuth } from '../../context/AuthContext';
import { Button as PaperButton } from 'react-native-paper';

const TYPES = ['Tất cả', 'Luyện tập', 'Kiểm tra'];

export default function TeacherExamManagementScreen() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Tất cả');
  const [modalVisible, setModalVisible] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'Luyện tập', duration: 30, questionIds: [] });
  const [selectedClass, setSelectedClass] = useState('');
  const [questionTopic, setQuestionTopic] = useState('Tất cả');
  const [questionLevel, setQuestionLevel] = useState('Tất cả');
  const [quickSelectCount, setQuickSelectCount] = useState('');
  const [questionBankMode, setQuestionBankMode] = useState('teacher'); // 'teacher' hoặc 'admin'
  const [showAdminQuestions, setShowAdminQuestions] = useState(false);

  useEffect(() => {
    if (selectedClass) loadData();
    // eslint-disable-next-line
  }, [showAdminQuestions, selectedClass]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examData, questionData] = await Promise.all([
        fetchExams(selectedClass),
        showAdminQuestions ? fetchQuestions('admin') : fetchQuestions(user.uid)
      ]);
      setExams(examData);
      setQuestions(questionData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(e => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = type === 'Tất cả' ? true : e.type === type;
    return matchSearch && matchType;
  });

  const filteredQuestions = questions.filter(q => {
    const matchTopic = questionTopic === 'Tất cả' ? true : q.topic === questionTopic;
    const matchLevel = questionLevel === 'Tất cả' ? true : q.level === questionLevel;
    return matchTopic && matchLevel;
  });

  const openAddModal = () => {
    setEditExam(null);
    setForm({ title: '', type: 'Luyện tập', duration: 30, questionIds: [] });
    setModalVisible(true);
  };
  const openEditModal = (e) => {
    setEditExam(e);
    setForm({ ...e });
    setModalVisible(true);
  };
  const handleSave = async () => {
    if (!form.title.trim() || form.questionIds.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và chọn câu hỏi!');
      return;
    }
    if (!selectedClass) {
      Alert.alert('Lỗi', 'Vui lòng chọn lớp!');
      return;
    }
    try {
      if (editExam) {
        await updateExam(editExam.id, { ...form, classId: selectedClass, teacherId: user.uid });
        Alert.alert('Thành công', 'Đã cập nhật đề thi!');
      } else {
        await addExam({ ...form, classId: selectedClass, teacherId: user.uid });
        Alert.alert('Thành công', 'Đã thêm đề thi mới!');
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu đề thi: ' + error.message);
    }
  };
  const handleDelete = (e) => {
    Alert.alert('Xác nhận', 'Xóa đề thi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteExam(e.id);
            loadData();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa: ' + error.message);
          }
        }
      }
    ]);
  };
  const toggleQuestion = (id) => {
    setForm(f => ({
      ...f,
      questionIds: f.questionIds.includes(id)
        ? f.questionIds.filter(qid => qid !== id)
        : [...f.questionIds, id]
    }));
  };

  if (!selectedClass) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} /><Text>Vui lòng chọn lớp để xem/quản lý đề thi.</Text></View>;
  }

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text style={styles.title}>Quản lý Đề thi</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm đề thi..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.filterBtn, type === t && styles.filterActive]} onPress={() => setType(t)}>
            <Text style={type === t ? styles.filterActiveText : {}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredExams}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.examRow} onPress={() => openEditModal(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.examTitle}>{item.title}</Text>
              <Text style={styles.examMeta}>Loại: {item.type} | Thời gian: {item.duration} phút | Số câu: {item.questionIds.length}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Text style={{ color: 'red' }}>Xóa</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có đề thi nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Chọn câu hỏi</Text>
              <TouchableOpacity
                onPress={() => setShowAdminQuestions(!showAdminQuestions)}
                style={{
                  borderWidth: 1,
                  borderColor: '#007AFF',
                  borderRadius: 5,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  marginLeft: 8,
                  backgroundColor: showAdminQuestions ? '#fff' : '#007AFF'
                }}
              >
                <Text style={{ color: showAdminQuestions ? '#007AFF' : '#fff', fontWeight: 'bold' }}>
                  {showAdminQuestions ? 'Của tôi' : 'Ngân hàng câu hỏi'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Tiêu đề đề thi" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {TYPES.slice(1).map(t => (
                <TouchableOpacity key={t} style={[styles.filterBtn, form.type === t && styles.filterActive]} onPress={() => setForm(f => ({ ...f, type: t }))}>
                  <Text style={form.type === t ? styles.filterActiveText : {}}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Thời gian làm bài"
                value={String(form.duration)}
                onChangeText={v => setForm(f => ({ ...f, duration: Number(v.replace(/\D/g, '')) || 0 }))}
                keyboardType="numeric"
              />
              <Text style={{ marginLeft: 8, fontSize: 16 }}>phút</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <Text style={{ alignSelf: 'center', marginRight: 8 }}>Chủ đề:</Text>
              <TouchableOpacity style={[styles.filterBtn, questionTopic === 'Tất cả' && styles.filterActive]} onPress={() => setQuestionTopic('Tất cả')}>
                <Text style={questionTopic === 'Tất cả' ? styles.filterActiveText : {}}>Tất cả</Text>
              </TouchableOpacity>
              {['Tin học cơ bản', 'Word', 'Excel', 'PowerPoint', 'Internet'].map(t => (
                <TouchableOpacity key={t} style={[styles.filterBtn, questionTopic === t && styles.filterActive]} onPress={() => setQuestionTopic(t)}>
                  <Text style={questionTopic === t ? styles.filterActiveText : {}}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
              <Text style={{ alignSelf: 'center', marginRight: 8 }}>Cấp độ:</Text>
              <TouchableOpacity style={[styles.filterBtn, questionLevel === 'Tất cả' && styles.filterActive]} onPress={() => setQuestionLevel('Tất cả')}>
                <Text style={questionLevel === 'Tất cả' ? styles.filterActiveText : {}}>Tất cả</Text>
              </TouchableOpacity>
              {['Dễ', 'Trung bình', 'Khó'].map(l => (
                <TouchableOpacity key={l} style={[styles.filterBtn, questionLevel === l && styles.filterActive]} onPress={() => setQuestionLevel(l)}>
                  <Text style={questionLevel === l ? styles.filterActiveText : {}}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <FlatList
              data={filteredQuestions}
              keyExtractor={q => q.id}
              style={{ maxHeight: 180, marginBottom: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.qRow} onPress={() => toggleQuestion(item.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.qContent}>{item.content}</Text>
                  </View>
                  <View style={[styles.checkBox, form.questionIds.includes(item.id) && styles.checkBoxChecked]}>
                    {form.questionIds.includes(item.id) && <Text style={{ color: '#fff' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 10 }}>Không có câu hỏi.</Text>}
            />
            <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center', justifyContent: 'flex-end' }}>
              <TextInput
                style={[styles.input, { width: 60, marginBottom: 0 }]}
                placeholder="Số câu"
                value={quickSelectCount}
                onChangeText={setQuickSelectCount}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.addBtn, { marginLeft: 8, paddingHorizontal: 12, height: 40, justifyContent: 'center' }]}
                onPress={() => {
                  const n = parseInt(quickSelectCount);
                  if (!n || n <= 0) {
                    Alert.alert('Lỗi', 'Vui lòng nhập số câu hỏi hợp lệ!');
                    return;
                  }
                  if (filteredQuestions.length < n) {
                    Alert.alert('Lỗi', 'Không đủ câu hỏi theo bộ lọc!');
                    return;
                  }
                  // Chọn ngẫu nhiên n câu hỏi từ filteredQuestions
                  const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
                  const selected = shuffled.slice(0, n).map(q => q.id);
                  setForm(f => ({ ...f, questionIds: selected }));
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Chọn nhanh</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button title="Hủy" color="gray" onPress={() => setModalVisible(false)} />
              <View style={{ width: 10 }} />
              <Button title={editExam ? 'Lưu' : 'Thêm'} onPress={handleSave} />
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
  examRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  examTitle: { fontWeight: 'bold', fontSize: 16 },
  examMeta: { color: '#555', fontSize: 12 },
  actionBtn: { marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  qRow: { flexDirection: 'row', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#eee' },
  qContent: { fontSize: 14, flex: 1 },
  checkBox: { width: 24, height: 24, borderWidth: 1, borderColor: '#007AFF', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  checkBoxChecked: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
}); 