import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card, RadioButton, ActivityIndicator, Snackbar, ProgressBar } from 'react-native-paper';
import { getDocs, collection, query, where, addDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import ClassPicker from '../../components/ClassPicker';

const OFFICIAL_EXAM_TIME = 30 * 60; // 30 phút

export default function OfficialExamScreen() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [timeLeft, setTimeLeft] = useState(OFFICIAL_EXAM_TIME);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const navigation = useNavigation();
  const timerRef = useRef();
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (selectedClass) {
      loadQuestions(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questions.length]);

  const loadQuestions = async (classCode) => {
    try {
      setLoading(true);
      if (!classCode) {
        setQuestions([]);
        setLoading(false);
        return;
      }
      const qSnap = await getDocs(query(collection(firestore, 'questions'), where('classCode', '==', classCode)));
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSelected({});
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải đề thi: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qid, ans) => {
    setSelected(s => ({ ...s, [qid]: ans }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    clearInterval(timerRef.current);
    let score = 0;
    const answers = questions.map(q => {
      const isCorrect = selected[q.id] === q.correct;
      if (isCorrect) score++;
      return {
        question: q.content,
        selected: selected[q.id],
        correct: q.correct,
        isCorrect,
        explanation: q.explanation,
      };
    });
    // Lưu kết quả vào Firestore
    try {
      await addDoc(collection(firestore, 'examResults'), {
        examId: null, // TODO: truyền examId nếu có
        userId: null, // TODO: truyền userId nếu có (lấy từ context)
        classId: selectedClass,
        score,
        total: questions.length,
        answers,
        submittedAt: new Date(),
      });
    } catch (e) {
      // Có thể hiện thông báo lỗi nếu cần
    }
    navigation.navigate('OfficialExamResult', {
      result: {
        score,
        total: questions.length,
        answers,
      },
    });
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percent = timeLeft / OFFICIAL_EXAM_TIME;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Thi chính thức</Text>
      <Text style={{ marginBottom: 8 }}>Thời gian còn lại: <Text style={{ fontWeight: 'bold' }}>{minutes}:{seconds.toString().padStart(2, '0')}</Text></Text>
      <ProgressBar progress={percent} color="#007AFF" style={{ marginBottom: 16 }} />
      {questions.length === 0 ? (
        <Text>Không có câu hỏi nào.</Text>
      ) : (
        questions.map((q, idx) => (
          <Card key={q.id} style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Câu {idx + 1}: {q.content}</Text>
              <RadioButton.Group onValueChange={ans => handleSelect(q.id, ans)} value={selected[q.id] || ''}>
                {q.options.map((opt, i) => (
                  <RadioButton.Item key={i} label={opt} value={opt} />
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
        ))
      )}
      {questions.length > 0 && (
        <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 12 }}>Nộp bài</Button>
      )}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2000}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
} 