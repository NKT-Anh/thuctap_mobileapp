import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  Button,
  Card,
  RadioButton,
  ActivityIndicator,
  Snackbar,
  ProgressBar,
} from 'react-native-paper';
import {
  getDoc,
  doc,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const MOCK_EXAM_TIME = 20 * 60; // 20 phút

export default function MockExamScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { examId } = route.params || {};
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM_TIME);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [examInfo, setExamInfo] = useState(null);
  const timerRef = useRef();

  useEffect(() => {
    if (examId) loadExamData(examId);
  }, [examId]);

  useEffect(() => {
    if (!questions.length) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [questions.length]);

  const loadExamData = async (examId) => {
    try {
      setLoading(true);
      const examRef = doc(firestore, 'exams', examId);
      const examSnap = await getDoc(examRef);

      if (!examSnap.exists()) throw new Error('Không tìm thấy đề thi.');

      const examData = examSnap.data();
      setExamInfo(examData);

      const questionIds = examData.questionIds || [];
      const questionSnaps = await Promise.all(
        questionIds.map((qid) => getDoc(doc(firestore, 'questions', qid)))
      );

      const fetchedQuestions = questionSnaps
        .filter((snap) => snap.exists())
        .map((snap) => ({ id: snap.id, ...snap.data() }));

      setQuestions(fetchedQuestions);
      setSelected({});
      setTimeLeft(MOCK_EXAM_TIME);
    } catch (error) {
      setSnackbar({ visible: true, message: 'Lỗi tải đề: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qid, ans) => {
    if (selected[qid]) return;
    setSelected((prev) => ({ ...prev, [qid]: ans }));
  };

  const handleRetry = () => {
    loadExamData(examId);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percent = timeLeft / MOCK_EXAM_TIME;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>
        {examInfo?.title || 'Bài thi thử'}
      </Text>

      <Text style={{ marginBottom: 8 }}>
        Thời gian còn lại:{' '}
        <Text style={{ fontWeight: 'bold' }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Text>
      </Text>
      <ProgressBar progress={percent} color="#007AFF" style={{ marginBottom: 16 }} />

      {questions.length === 0 ? (
        <Text>Không có câu hỏi nào.</Text>
      ) : (
        questions.map((q, idx) => {
          const selectedAnswer = selected[q.id];
          const correctAnswer = q.options[q.correct];
          const isCorrect = selectedAnswer === correctAnswer;

          return (
            <Card key={q.id} style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Câu {idx + 1}: {q.content}
                </Text>

                <RadioButton.Group
                  onValueChange={(ans) => handleSelect(q.id, ans)}
                  value={selectedAnswer || ''}
                >
                  {q.options.map((opt, i) => (
                    <RadioButton.Item
                      key={i}
                      label={opt}
                      value={opt}
                      disabled={!!selected[q.id]}
                    />
                  ))}
                </RadioButton.Group>

                {selected[q.id] && (
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: isCorrect ? '#2e7d32' : '#d32f2f',
                      }}
                    >
                      {isCorrect ? '✅ Chính xác!' : '❌ Sai'}
                    </Text>
                    {!isCorrect && (
                      <Text>Đáp án đúng: {correctAnswer}</Text>
                    )}
                    {q.explanation && (
                      <Text style={{ fontStyle: 'italic', marginTop: 4 }}>
                        Giải thích: {q.explanation}
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })
      )}

      <Button
        mode="contained"
        onPress={handleRetry}
        style={{ marginTop: 12 }}
      >
        🔁 Làm lại
      </Button>

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
