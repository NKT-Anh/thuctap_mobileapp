import React, { useEffect, useState, useRef } from 'react';
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
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const EXAM_TIME = 30 * 60; // 30 phút

export default function OfficialExamScreen() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [examData, setExamData] = useState(null);

  const timerRef = useRef();
  const navigation = useNavigation();
  const { examId } = useRoute().params;
  const { user } = useAuth();
  const [startTime] = useState(new Date());

  useEffect(() => {
    loadExam();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [questions.length]);

  const loadExam = async () => {
    try {
      setLoading(true);

      const resultId = `${examId}_${user?.uid}`;
      const resultDocRef = doc(firestore, 'official_exam_results', resultId);
      const resultSnap = await getDoc(resultDocRef);

      if (resultSnap.exists()) {
        const data = resultSnap.data();
        navigation.replace('OfficialExamResult', {
          result: {
            score: data.score,
            total: data.total,
            correctCount: data.correctCount,
            durationInSeconds: data.durationInSeconds,
            answers: data.answers,
            startedAt: data.startedAt,
            submittedAt: data.submittedAt,
            userName: data.userName,
          },
        });
        return;
      }

      const examDoc = await getDoc(doc(firestore, 'exams', examId));
      if (!examDoc.exists()) throw new Error('Không tìm thấy đề thi.');

      const data = examDoc.data();
      setExamData(data);

      const questionIds = data.questionIds || [];

      const questionDocs = await Promise.all(
        questionIds.map((qid) => getDoc(doc(firestore, 'questions', qid)))
      );

      const loadedQuestions = questionDocs
        .filter((doc) => doc.exists())
        .map((doc) => ({ id: doc.id, ...doc.data() }));

      setQuestions(loadedQuestions);
      setSelectedAnswers({});
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Lỗi khi tải đề thi: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, answerIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    clearInterval(timerRef.current);

    let correctCount = 0;
    const results = questions.map((q) => {
      const selected = selectedAnswers[q.id];
      const correctAnswers = Array.isArray(q.correct)
        ? q.correct.map((c) => String(c))
        : [String(q.correct)];

      const isCorrect = correctAnswers.includes(String(selected));
      if (isCorrect) correctCount++;

      return {
        question: q.content,
        selected: selected ?? null,
        correct: correctAnswers,
        options: q.options,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const total = questions.length;
    const score = Math.round((correctCount * 100) / total) / 10;

    const submittedAt = new Date();
    const durationInSeconds = Math.floor((submittedAt - startTime) / 1000);
    const resultId = `${examId}_${user?.uid}`;

    try {
      await setDoc(doc(firestore, 'official_exam_results', resultId), {
        userId: user?.uid || 'unknown',
        userName: user?.name || 'Ẩn danh',
        examId: examId,
        classId: examData?.classId || '',
        score,
        total,
        correctCount, // ✅ Số câu đúng
        durationInSeconds, // ✅ Tổng thời gian làm bài (giây)
        answers: results,
        startedAt: startTime.toISOString(),
        submittedAt: submittedAt.toISOString(),
      });
    } catch (error) {
      console.error('Lỗi khi lưu kết quả:', error);
      setSnackbar({
        visible: true,
        message: 'Lỗi khi lưu kết quả thi!',
        error: true,
      });
    }

    navigation.replace('OfficialExamResult', {
      result: {
        score,
        total,
        correctCount,
        durationInSeconds,
        answers: results,
        startedAt: startTime.toISOString(),
        submittedAt: submittedAt.toISOString(),
        userName: user?.name || 'Ẩn danh',
      },
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percent = timeLeft / EXAM_TIME;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>🧠 Thi chính thức</Text>
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
        questions.map((q, idx) => (
          <Card key={q.id} style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
                Câu {idx + 1}: {q.content}
              </Text>
              <RadioButton.Group
                onValueChange={(index) => handleSelect(q.id, index)}
                value={selectedAnswers[q.id] ?? ''}
              >
                {q.options.map((opt, i) => (
                  <RadioButton.Item
                    key={i}
                    label={opt}
                    value={String(i)}
                  />
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
        ))
      )}

      {questions.length > 0 && (
        <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 12 }}>
          Nộp bài
        </Button>
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