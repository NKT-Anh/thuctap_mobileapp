import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
  ToggleButton,
} from 'react-native-paper';
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import ClassPicker from '../../components/ClassPicker';
import { useAuth } from '../../context/AuthContext';

export default function OfficialExamListScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [selectedClass, setSelectedClass] = useState(route.params?.classId || '');
  const [loading, setLoading] = useState(false);
  const [examList, setExamList] = useState([]);
  const [examResults, setExamResults] = useState({});
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [filter, setFilter] = useState('all'); // all | done | notdone

  useEffect(() => {
    if (selectedClass) {
      fetchExamList(selectedClass);
    } else {
      setExamList([]);
      setExamResults({});
    }
  }, [selectedClass]);

  const fetchExamList = async (classCode) => {
    try {
      setLoading(true);

      const q = query(
        collection(firestore, 'exams'),
        where('classId', '==', classCode),
        where('type', '==', 'Kiểm tra')
      );
      const snap = await getDocs(q);
      const exams = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const results = {};
      for (const exam of exams) {
        const resultRef = doc(firestore, 'official_exam_results', `${exam.id}_${user.uid}`);
        const resultDoc = await getDoc(resultRef);
        if (resultDoc.exists()) {
          results[exam.id] = resultDoc.data();
        }
      }

      setExamList(exams);
      setExamResults(results);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải danh sách bài kiểm tra: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = examList.filter((exam) => {
    const done = !!examResults[exam.id];
    if (filter === 'done') return done;
    if (filter === 'notdone') return !done;
    return true;
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'green';
    if (score >= 5) return '#FFA500'; // cam
    return '#d32f2f'; // đỏ
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />

      <Text variant="titleLarge" style={{ marginBottom: 8 }}>
        📋 Danh sách bài kiểm tra
      </Text>

      <ToggleButton.Row
        onValueChange={setFilter}
        value={filter}
        style={{ marginBottom: 16 }}
      >
        <ToggleButton icon="format-list-bulleted" value="all" />
        <ToggleButton icon="check" value="done" />
        <ToggleButton icon="clipboard-list-outline" value="notdone" />
      </ToggleButton.Row>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} />
      ) : filteredExams.length === 0 ? (
        <Text style={{ marginTop: 20, color: '#888' }}>
          Không có bài kiểm tra phù hợp.
        </Text>
      ) : (
        filteredExams.map((exam, index) => {
          const result = examResults[exam.id];
          const done = !!result;

          const durationText = result?.durationInSeconds
            ? `⏱ Thời gian làm bài: ${formatDuration(result.durationInSeconds)}`
            : '';

          const correctText =
            typeof result?.correctCount === 'number' && typeof result?.total === 'number'
              ? `✅ Số câu đúng: ${result.correctCount} / ${result.total}`
              : '';

          const score = result?.score ?? 0;
          const scoreColor = getScoreColor(score);

          return (
            <Card
              key={exam.id}
              style={{
                marginBottom: 16,
                paddingVertical: 16,
                paddingHorizontal: 12,
              }}
              onPress={() => {
                if (done) {
                  navigation.navigate('OfficialExamResult', {
                    result,
                  });
                } else {
                  navigation.navigate('OfficialExam', {
                    examId: exam.id,
                  });
                }
              }}
            >
              <Card.Content style={{ paddingRight: 70 }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 18,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  📝 Đề {index + 1}: {exam.title || 'Không có tiêu đề'}
                </Text>

                {done ? (
                  <>
                    <Text style={{ color: '#555', marginBottom: 4 }}>{durationText}</Text>
                    <Text style={{ color: '#555' }}>{correctText}</Text>
                  </>
                ) : (
                  <Text style={{ color: '#999' }}>⏳ Chưa làm</Text>
                )}
              </Card.Content>

              {done && (
                <Text
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: [{ translateY: -12 }],
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: scoreColor,
                  }}
                >
                  {score} điểm
                </Text>
              )}
            </Card>
          );
        })
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
