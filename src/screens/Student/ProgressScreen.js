import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import ClassPicker from '../../components/ClassPicker';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../../firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore';

export default function ProgressScreen() {
  const [selectedClass, setSelectedClass] = useState('');
  const { user } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [examResults, setExamResults] = useState([]);

  useEffect(() => {
    if (user && selectedClass) {
      loadProgress();
      loadExamResults();
    }
  }, [user, selectedClass]);

  const loadProgress = async () => {
    try {
      // 1. Lấy tất cả bài học của lớp
      const lessonsQ = query(
        collection(firestore, 'lessons'),
        where('classId', '==', selectedClass) // ✅ Đã sửa chỗ này
      );
      const lessonsSnap = await getDocs(lessonsQ);
      const lessonIds = lessonsSnap.docs.map((doc) => doc.id);
      const total = lessonIds.length;

      // 2. Lấy tất cả bài học mà học sinh đã hoàn thành
      const completedQ = query(
        collection(firestore, 'userLessons'),
        where('userId', '==', user.uid)
      );
      const completedSnap = await getDocs(completedQ);

      // 3. Đối chiếu các bài học thuộc lớp này
      const completed = completedSnap.docs.filter((docu) =>
        lessonIds.includes(docu.data().lessonId)
      ).length;

      setProgress({ completed, total });
    } catch (error) {
      console.error('Lỗi khi tải tiến độ:', error.message);
    }
  };

  const loadExamResults = async () => {
    try {
      const examQ = query(
        collection(firestore, 'exams'),
        where('classId', '==', selectedClass),
        where('type', '==', 'Kiểm tra')
      );
      const examSnap = await getDocs(examQ);
      const exams = examSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const results = [];

      for (const exam of exams) {
        const resultRef = doc(
          firestore,
          'official_exam_results',
          `${exam.id}_${user.uid}`
        );
        const resultDoc = await getDoc(resultRef);
        const score = resultDoc.exists() ? resultDoc.data().score : null;

        results.push({
          title: exam.title || 'Không có tiêu đề',
          score,
        });
      }

      setExamResults(results);
    } catch (error) {
      console.error('Lỗi khi tải kết quả thi:', error.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'green';
    if (score >= 5) return '#FFA500';
    return '#d32f2f';
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />

      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        Tiến độ học tập
      </Text>

      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Bài học đã hoàn thành" />
        <Card.Content>
          <Text>
            {progress.completed} / {progress.total} bài học (
            {progress.total > 0
              ? ((progress.completed / progress.total) * 100).toFixed(1)
              : 0}
            %)
          </Text>
        </Card.Content>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm thi chính thức" />
        <Card.Content>
          {examResults.length === 0 ? (
            <Text>Không có đề thi</Text>
          ) : (
            examResults.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <Text style={{ flex: 1 }}>
                  {index + 1}. {item.title}
                </Text>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color:
                      item.score != null
                        ? getScoreColor(item.score)
                        : '#999',
                  }}
                >
                  {item.score != null ? `${item.score} điểm` : 'Chưa làm'}
                </Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
