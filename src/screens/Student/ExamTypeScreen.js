import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Button,
  ActivityIndicator,
  Text,
  Snackbar,
  Card,
  Divider,
} from 'react-native-paper';
import { firestore } from '../../../firebaseConfig';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import ClassPicker from '../../components/ClassPicker';

export default function ExamTypeScreen() {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

  const navigation = useNavigation();

  useEffect(() => {
    if (selectedClass) {
      fetchExamData(selectedClass);
    } else {
      setExamData(null);
    }
  }, [selectedClass]);

  const fetchExamData = async (classCode) => {
    try {
      setLoading(true);
      const q = query(collection(firestore, 'exams'), where('classId', '==', classCode));
      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const testExam = exams.find(e => e.type === 'Kiểm tra');
      const practiceExam = exams.find(e => e.type === 'Luyện tập');
      setExamData({ testExam, practiceExam });
    } catch (error) {
      setSnackbar({ visible: true, message: 'Lỗi khi tải dữ liệu đề thi: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (type) => {
    if (!selectedClass) return;
    if (type === 'practice') {
      navigation.navigate('MockExamList', { classId: selectedClass });
    } else {
      navigation.navigate('OfficialExamList', { classId: selectedClass });
    }
  };

  return (
    <View style={styles.container}>
      {/* KHUNG 1: Chọn lớp */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎓 Chọn lớp học</Text>
          <Divider style={{ marginVertical: 8 }} />
          <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
        </Card.Content>
      </Card>

      {/* KHUNG 2: Chọn kiểu bài thi */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📝 Chọn kiểu bài thi</Text>
          <Divider style={{ marginVertical: 8 }} />

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : (
            selectedClass && (
              <View style={styles.buttonGroup}>
                <Button
                  icon="book-open-page-variant"
                  mode="contained"
                  onPress={() => handleNavigate('practice')}
                  style={styles.button}
                >
                  Ôn thi (Luyện tập)
                </Button>

                <Button
                  icon="clipboard-check"
                  mode="contained"
                  buttonColor="#d32f2f"
                  onPress={() => handleNavigate('test')}
                  style={styles.button}
                >
                  Thi chính thức (Kiểm tra)
                </Button>
              </View>
            )
          )}
        </Card.Content>
      </Card>

      {/* KHUNG 3: Snackbar thông báo */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2500}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f9',
    padding: 16,
    gap: 16, // khoảng cách giữa các khung
  },
  sectionCard: {
    borderRadius: 16,
    elevation: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    borderRadius: 8,
  },
});
