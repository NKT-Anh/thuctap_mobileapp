import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, FlatList, Modal } from 'react-native';
import { addAdminQuestion, fetchQuestions } from '../../services/questionService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const TOPICS = ['Tin học cơ bản', 'Word', 'Excel', 'PowerPoint', 'Internet'];
const LEVELS = ['Dễ', 'Trung bình', 'Khó'];

export default function QuestionBankScreen() {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState(0); // index
  const [topic, setTopic] = useState(TOPICS[0]);
  const [level, setLevel] = useState(LEVELS[0]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importTopic, setImportTopic] = useState(TOPICS[0]);
  const [importLevel, setImportLevel] = useState(LEVELS[0]);

  useEffect(() => {
    fetchQuestions('admin').then(setQuestions);
  }, [refresh]);

  const handleAdd = async () => {
    if (!content.trim() || options.some(o => !o.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ nội dung và các lựa chọn!');
      return;
    }
    setLoading(true);
    try {
      await addAdminQuestion({
        content,
        options,
        answer,
        topic,
        level,
      });
      setContent('');
      setOptions(['', '', '', '']);
      setAnswer(0);
      setTopic(TOPICS[0]);
      setLevel(LEVELS[0]);
      setRefresh(r => !r);
      Alert.alert('Thành công', 'Đã thêm câu hỏi vào ngân hàng admin!');
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể thêm câu hỏi!');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/csv', 'text/comma-separated-values', 'text/plain'] });
      if (res.canceled || !res.assets || !res.assets[0]?.uri) return;
      setImportFile(res.assets[0]);
      setImportModal(true);
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể chọn file!');
    }
  };

  const doImport = async () => {
    if (!importFile) return;
    try {
      const fileUri = importFile.uri;
      const fileName = importFile.name || '';
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      let imported = 0, failed = 0;
      if (fileName.endsWith('.json')) {
        let arr;
        try {
          arr = JSON.parse(content);
        } catch (e) {
          Alert.alert('Lỗi', 'File JSON không hợp lệ!');
          setImportModal(false);
          return;
        }
        if (!Array.isArray(arr)) {
          Alert.alert('Lỗi', 'File JSON phải là mảng các câu hỏi!');
          setImportModal(false);
          return;
        }
        for (const q of arr) {
          if (!q.content || !q.options || typeof q.answer !== 'number') { failed++; continue; }
          try {
            await addAdminQuestion({
              ...q,
              topic: q.topic || importTopic,
              level: q.level || importLevel,
            });
            imported++;
          } catch { failed++; }
        }
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const lines = content.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) { Alert.alert('Lỗi', 'File CSV không có dữ liệu!'); setImportModal(false); return; }
        const header = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row.length < 7) { failed++; continue; }
          const q = {
            content: row[header.indexOf('content')] || '',
            options: [row[header.indexOf('optionA')], row[header.indexOf('optionB')], row[header.indexOf('optionC')], row[header.indexOf('optionD')]],
            answer: parseInt(row[header.indexOf('answer')], 10),
            topic: row[header.indexOf('topic')] || importTopic,
            level: row[header.indexOf('level')] || importLevel,
          };
          if (!q.content || q.options.some(o => !o)) { failed++; continue; }
          try {
            await addAdminQuestion(q);
            imported++;
          } catch { failed++; }
        }
      } else {
        Alert.alert('Lỗi', 'Chỉ hỗ trợ file .json hoặc .csv!');
        setImportModal(false);
        return;
      }
      setRefresh(r => !r);
      setImportModal(false);
      Alert.alert('Kết quả import', `Thành công: ${imported}, Lỗi: ${failed}`);
    } catch (e) {
      setImportModal(false);
      Alert.alert('Lỗi', e.message || 'Không thể import file!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Import từ file (JSON/CSV)</Text>
      </TouchableOpacity>
      <Modal visible={importModal} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Chọn chủ đề & cấp độ cho file import</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <Text style={{ alignSelf: 'center', marginRight: 8 }}>Chủ đề:</Text>
              {TOPICS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterBtn, importTopic === t && styles.filterActive]}
                  onPress={() => setImportTopic(t)}
                >
                  <Text style={importTopic === t ? styles.filterActiveText : {}}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <Text style={{ alignSelf: 'center', marginRight: 8 }}>Cấp độ:</Text>
              {LEVELS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.filterBtn, importLevel === l && styles.filterActive]}
                  onPress={() => setImportLevel(l)}
                >
                  <Text style={importLevel === l ? styles.filterActiveText : {}}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setImportModal(false)} style={[styles.addBtn, { backgroundColor: '#ccc', marginRight: 10 }]}>
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doImport} style={styles.addBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.title}>Thêm câu hỏi vào Ngân hàng Admin</Text>
      <TextInput
        style={styles.input}
        placeholder="Nội dung câu hỏi"
        value={content}
        onChangeText={setContent}
        multiline
      />
      {options.map((opt, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder={`Lựa chọn ${idx + 1}`}
            value={opt}
            onChangeText={v => setOptions(opts => opts.map((o, i) => i === idx ? v : o))}
          />
          <TouchableOpacity
            style={[styles.radio, answer === idx && styles.radioSelected]}
            onPress={() => setAnswer(idx)}
          >
            {answer === idx && <View style={styles.radioDot} />}
          </TouchableOpacity>
          <Text style={{ marginLeft: 4 }}>Đáp án</Text>
        </View>
      ))}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>Chủ đề:</Text>
        {TOPICS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, topic === t && styles.filterActive]}
            onPress={() => setTopic(t)}
          >
            <Text style={topic === t ? styles.filterActiveText : {}}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <Text style={{ alignSelf: 'center', marginRight: 8 }}>Cấp độ:</Text>
        {LEVELS.map(l => (
          <TouchableOpacity
            key={l}
            style={[styles.filterBtn, level === l && styles.filterActive]}
            onPress={() => setLevel(l)}
          >
            <Text style={level === l ? styles.filterActiveText : {}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.addBtn, loading && { opacity: 0.6 }]}
        onPress={handleAdd}
        disabled={loading}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Thêm câu hỏi</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { marginTop: 30, marginBottom: 10 }]}>Danh sách câu hỏi admin</Text>
      {questions.length === 0 ? (
        <Text style={{ color: '#888', fontStyle: 'italic' }}>Chưa có câu hỏi nào trong ngân hàng admin.</Text>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.id}
          style={{ width: '100%' }}
          renderItem={({ item }) => (
            <View style={styles.qBox}>
              <Text style={styles.qContent}>{item.content}</Text>
              {item.options && item.options.map((opt, idx) => (
                <Text key={idx} style={{ marginLeft: 12, color: idx === item.answer ? '#007AFF' : '#333' }}>
                  {String.fromCharCode(65 + idx)}. {opt} {idx === item.answer ? '(Đáp án)' : ''}
                </Text>
              ))}
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={styles.qMeta}>Chủ đề: {item.topic}</Text>
                <Text style={[styles.qMeta, { marginLeft: 16 }]}>Cấp độ: {item.level}</Text>
              </View>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  importBtn: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 5, padding: 10, marginBottom: 16, backgroundColor: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: 340 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10, width: 300 },
  addBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10, width: 200 },
  filterBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8 },
  filterActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterActiveText: { color: '#fff', fontWeight: 'bold' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  radioSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF22' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#007AFF' },
  qBox: { backgroundColor: '#f6f8fa', borderRadius: 8, padding: 12, marginBottom: 14, width: 320, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  qContent: { fontWeight: 'bold', marginBottom: 4 },
  qMeta: { color: '#666', fontSize: 12 },
}); 