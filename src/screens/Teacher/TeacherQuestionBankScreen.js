import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion } from '../../services/questionService';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { Button as PaperButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const TOPICS = ['Tất cả', 'Tin học cơ bản', 'Word', 'Excel', 'PowerPoint', 'Internet'];
const LEVELS = ['Tất cả', 'Dễ', 'Trung bình', 'Khó'];

export default function TeacherQuestionBankScreen() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('Tất cả');
  const [level, setLevel] = useState('Tất cả');
  const [modalVisible, setModalVisible] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);
  const [form, setForm] = useState({ content: '', options: ['', '', '', ''], correct: [], topic: 'Tin học cơ bản', level: 'Dễ', explain: '' });
  const [importTopic, setImportTopic] = useState('Tin học cơ bản');
  const [importLevel, setImportLevel] = useState('Dễ');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions(user.uid);
      setQuestions(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải câu hỏi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content?.toLowerCase().includes(search.toLowerCase());
    const matchTopic = topic === 'Tất cả' ? true : q.topic === topic;
    const matchLevel = level === 'Tất cả' ? true : q.level === level;
    return matchSearch && matchTopic && matchLevel;
  });

  const openAddModal = () => {
    setEditQuestion(null);
    setForm({ content: '', options: ['', '', '', ''], correct: [], topic: 'Tin học cơ bản', level: 'Dễ', explain: '' });
    setModalVisible(true);
  };
  const openEditModal = (q) => {
    setEditQuestion(q);
    setForm({ ...q });
    setModalVisible(true);
  };
  const handleSave = async () => {
    if (!form.content.trim() || form.options.some(opt => !opt.trim()) || form.correct.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ nội dung, đáp án và chọn đáp án đúng!');
      return;
    }
    try {
      if (editQuestion) {
        await updateQuestion(editQuestion.id, form);
        Alert.alert('Thành công', 'Đã cập nhật câu hỏi!');
      } else {
        await addQuestion(form, user.uid);
        Alert.alert('Thành công', 'Đã thêm câu hỏi mới!');
      }
      setModalVisible(false);
      loadQuestions();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu câu hỏi: ' + error.message);
    }
  };
  const handleDelete = (q) => {
    Alert.alert('Xác nhận', 'Xóa câu hỏi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await deleteQuestion(q.id);
            loadQuestions();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa: ' + error.message);
          }
        }
      }
    ]);
  };
  const toggleCorrect = (idx) => {
    setForm(f => ({
      ...f,
      correct: f.correct.includes(idx)
        ? f.correct.filter(i => i !== idx)
        : [...f.correct, idx]
    }));
  };

  const handleImport = async () => {
    console.log('Import button pressed');
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'application/json'] });
      console.log('DocumentPicker result:', res);
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const fileUri = res.assets[0].uri;
        const fileString = await fetch(fileUri).then(r => r.text());
        console.log('File string:', fileString);
        let questions = [];
        if (res.assets[0].name.endsWith('.csv')) {
          const parsed = Papa.parse(fileString, { header: true });
          questions = parsed.data;
        } else if (res.assets[0].name.endsWith('.json')) {
          const json = JSON.parse(fileString);
          questions = json.questions || json;
        }
        console.log('Questions loaded:', questions);
        let count = 0;
        for (const q of questions) {
          console.log('Processing:', q);
          if (q && (q.content || q.question)) {
            const options = q.options || [];
            let correct = [];
            if (q.answer && options.length > 0) {
              const idx = options.findIndex(opt => opt === q.answer);
              if (idx !== -1) correct = [idx];
            }
            const newQ = {
              content: q.content || q.question || '',
              options,
              correct,
              topic: importTopic,
              level: importLevel,
              explain: q.explain || ''
            };
            await addQuestion(newQ, user.uid);
            count++;
          }
        }
        if (count > 0) {
          Alert.alert('Thành công', 'Đã thêm danh sách câu hỏi thành công!');
          loadQuestions();
        } else {
          Alert.alert('Lỗi', 'Không có câu hỏi nào được thêm!');
        }
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể import file: ' + err.message);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>Chủ đề:</Text>
        {TOPICS.slice(1).map(t => (
          <TouchableOpacity key={t} style={[styles.filterBtn, importTopic === t && styles.filterActive]} onPress={() => setImportTopic(t)}>
            <Text style={importTopic === t ? styles.filterActiveText : {}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>Cấp độ:</Text>
        {LEVELS.slice(1).map(l => (
          <TouchableOpacity key={l} style={[styles.filterBtn, importLevel === l && styles.filterActive]} onPress={() => setImportLevel(l)}>
            <Text style={importLevel === l ? styles.filterActiveText : {}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <PaperButton icon="upload" mode="contained" style={{ marginBottom: 12 }} onPress={handleImport}>
        Import CSV/JSON
      </PaperButton>
      <Text style={styles.title}>Ngân hàng Câu hỏi</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Tìm kiếm nội dung..."
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
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {LEVELS.map(l => (
          <TouchableOpacity key={l} style={[styles.filterBtn, level === l && styles.filterActive]} onPress={() => setLevel(l)}>
            <Text style={level === l ? styles.filterActiveText : {}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredQuestions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.qRow} onPress={() => openEditModal(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.qContent}>{item.content}</Text>
              <Text style={styles.qMeta}>Chủ đề: {item.topic} | Mức độ: {item.level}</Text>
              <Text style={styles.qMeta}>Đáp án đúng: {item.correct.map(i => String.fromCharCode(65 + i)).join(', ')}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Text style={{ color: 'red' }}>Xóa</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có câu hỏi nào.</Text>}
      />
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</Text>
            <TextInput style={styles.input} placeholder="Nội dung câu hỏi" value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} />
            {form.options.map((opt, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <TouchableOpacity onPress={() => toggleCorrect(idx)} style={[styles.checkBox, form.correct.includes(idx) && styles.checkBoxChecked]}>
                  {form.correct.includes(idx) && <Text style={{ color: '#fff' }}>✓</Text>}
                </TouchableOpacity>
                <Text style={{ width: 20 }}>{String.fromCharCode(65 + idx)}.</Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChangeText={v => setForm(f => {
                    const opts = [...f.options]; opts[idx] = v; return { ...f, options: opts };
                  })}
                />
              </View>
            ))}
            <TextInput style={styles.input} placeholder="Giải thích đáp án (nếu có)" value={form.explain} onChangeText={v => setForm(f => ({ ...f, explain: v }))} />
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {TOPICS.slice(1).map(t => (
                <TouchableOpacity key={t} style={[styles.filterBtn, form.topic === t && styles.filterActive]} onPress={() => setForm(f => ({ ...f, topic: t }))}>
                  <Text style={form.topic === t ? styles.filterActiveText : {}}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              {LEVELS.slice(1).map(l => (
                <TouchableOpacity key={l} style={[styles.filterBtn, form.level === l && styles.filterActive]} onPress={() => setForm(f => ({ ...f, level: l }))}>
                  <Text style={form.level === l ? styles.filterActiveText : {}}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <PaperButton mode="outlined" onPress={() => setModalVisible(false)}>Hủy</PaperButton>
              <View style={{ width: 10 }} />
              <PaperButton mode="contained" onPress={handleSave}>Lưu</PaperButton>
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
  qRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  qContent: { fontWeight: 'bold', fontSize: 16 },
  qMeta: { color: '#555', fontSize: 12 },
  actionBtn: { marginLeft: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  checkBox: { width: 24, height: 24, borderWidth: 1, borderColor: '#007AFF', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  checkBoxChecked: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
}); 