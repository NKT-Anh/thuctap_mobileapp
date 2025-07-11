import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { fetchUsersByEmails } from '../../services/userService';
import { fetchUsersByIds } from '../../services/userService';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function TeacherStudentTrackingScreen() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  // Lấy danh sách lớp
  useEffect(() => {
    const fetchClasses = async () => {
      const q = query(collection(firestore, 'classes'), where('teacher', '==', user.email));
      const querySnapshot = await getDocs(q);
      setClasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClasses();
  }, []);

  // Lấy danh sách học viên khi chọn lớp
  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        if (!selectedClass) { setStudents([]); setExams([]); setResults([]); setLoading(false); return; }
        const classDoc = await getDocs(query(collection(firestore, 'classes'), where('teacher', '==', user.email), where('id', '==', selectedClass)));
        const classData = classDoc.docs[0]?.data();
        const studentIds = classData?.students || [];
        const users = await fetchUsersByIds(studentIds);
        setStudents(users);
        // Lấy danh sách bài kiểm tra
        const examsQ = query(collection(firestore, 'exams'), where('classId', '==', selectedClass));
        const examsSnap = await getDocs(examsQ);
        setExams(examsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSelectedExam('');
        setResults([]);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải danh sách học viên: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedClass]);

  // Lấy kết quả tất cả bài kiểm tra của lớp khi chọn lớp
  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedClass || exams.length === 0) { setResults([]); return; }
      setLoading(true);
      try {
        // Lấy tất cả examId của lớp
        const examIds = exams.map(e => e.id);
        let allResults = [];
        // Firestore chỉ cho phép tối đa 10 phần tử trong mảng where('in')
        for (let i = 0; i < examIds.length; i += 10) {
          const chunk = examIds.slice(i, i + 10);
          const q = query(collection(firestore, 'results'), where('examId', 'in', chunk));
          const querySnapshot = await getDocs(q);
          allResults = allResults.concat(querySnapshot.docs.map(doc => doc.data()));
        }
        setResults(allResults);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải kết quả: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedClass, exams]);

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const doneCount = filteredStudents.filter(s => results.find(r => r.userId === s.id)).length;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Theo dõi & Đánh giá Học viên</Text>
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
      {selectedClass ? (
        <>
          {exams.map(exam => {
            const examResults = results.filter(r => r.examId === exam.id);
            const doneIds = examResults.map(r => r.userId);
            return (
              <View key={exam.id} style={styles.examBox}>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examMeta}>
                  Đã làm: {doneIds.length}/{students.length}
                </Text>
                {students.map(s => {
                  const result = examResults.find(r => r.userId === s.id);
                  return (
                    <View key={s.id} style={styles.studentRow}>
                      <Text style={styles.studentName}>{s.name}</Text>
                      <Text style={styles.studentMeta}>
                        {result ? `Điểm: ${result.score}` : 'Chưa làm bài'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm học viên..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007AFF" /><Text>Đang tải...</Text></View>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const result = results.find(r => r.userId === item.id);
            return (
              <View style={styles.studentRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentEmail}>{item.email}</Text>
                  <Text style={styles.studentMeta}>
                    {selectedExam
                      ? (result ? `Điểm: ${result.score}` : 'Chưa làm bài')
                      : ''}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có học viên nào.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
  studentRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  studentName: { fontWeight: 'bold', fontSize: 16 },
  studentEmail: { color: '#555' },
  studentMeta: { color: '#888', fontSize: 12 },
  classBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8, backgroundColor: '#fff' },
  classBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  classBtnActiveText: { color: '#fff', fontWeight: 'bold' },
  examBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8, backgroundColor: '#fff' },
  examBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  examBtnActiveText: { color: '#fff', fontWeight: 'bold' },
  examBox: { backgroundColor: '#f6f8fa', borderRadius: 8, padding: 12, marginBottom: 18, width: '100%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  examTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  examMeta: { color: '#007AFF', fontSize: 13, marginBottom: 8 },
}); 