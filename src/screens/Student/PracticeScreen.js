import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, Card, RadioButton, ActivityIndicator, Snackbar, Chip } from 'react-native-paper';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import ClassPicker from '../../components/ClassPicker';

export default function PracticeScreen() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [topic, setTopic] = useState('all');
  const [topics, setTopics] = useState([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const navigation = useNavigation();
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadQuestions(selectedClass);
    }
  }, [selectedClass, topic]);

  const loadTopics = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'questions'));
      const allQuestions = querySnapshot.docs.map(doc => doc.data());
      const uniqueTopics = Array.from(new Set(allQuestions.map(q => q.topic)));
      setTopics(uniqueTopics);
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải chủ đề: ' + error.message, error: true });
    }
  };

  const loadQuestions = async (classCode) => {
    try {
      setLoading(true);
      if (!classCode) {
        setQuestions([]);
        setLoading(false);
        return;
      }
      let qSnap;
      if (topic === 'all') {
        qSnap = await getDocs(query(collection(firestore, 'questions'), where('classCode', '==', classCode)));
      } else {
        qSnap = await getDocs(query(collection(firestore, 'questions'), where('classCode', '==', classCode), where('topic', '==', topic)));
      }
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSelected({});
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải câu hỏi: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qid, ans) => {
    setSelected(s => ({ ...s, [qid]: ans }));
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;
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
    navigation.navigate('PracticeResult', {
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

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Luyện tập trắc nghiệm</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        <Chip style={{ marginRight: 8, marginBottom: 8 }} selected={topic === 'all'} onPress={() => setTopic('all')}>Tất cả</Chip>
        {topics.map(t => (
          <Chip key={t} style={{ marginRight: 8, marginBottom: 8 }} selected={topic === t} onPress={() => setTopic(t)}>{t}</Chip>
        ))}
      </View>
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