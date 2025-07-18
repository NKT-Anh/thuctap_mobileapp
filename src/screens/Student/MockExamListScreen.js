import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import {
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import ClassPicker from '../../components/ClassPicker';

export default function MockExamListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState(route.params?.classId || '');
  const [examList, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

  useEffect(() => {
    if (selectedClass && user) {
      fetchData();
    } else {
      setExamList([]);
    }
  }, [selectedClass, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const examQ = query(
        collection(firestore, 'exams'),
        where('classId', '==', selectedClass),
        where('type', '==', 'Luyện tập')
      );
      const examSnap = await getDocs(examQ);
      const exams = examSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExamList(exams);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Lỗi tải danh sách: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />

      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        🧪 Danh sách bài luyện tập
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : examList.length === 0 ? (
        <Text style={{ marginTop: 20, color: '#888' }}>
          Không có bài thi luyện tập nào.
        </Text>
      ) : (
        examList.map((exam, index) => (
          <Card
            key={exam.id}
            style={{ marginBottom: 12 }}
            onPress={() => {
              navigation.navigate('MockExam', { examId: exam.id });
            }}
          >
            <Card.Title
              title={`Đề ${index + 1}`}
              subtitle={`Nhấn để làm lại`}
            />
          </Card>
        ))
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2500}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
}
