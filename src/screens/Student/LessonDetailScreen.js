import React, { useState, useEffect } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

export default function LessonDetailScreen() {
  const route = useRoute();
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

  useEffect(() => {
    loadLesson();
  }, []);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const docRef = doc(firestore, 'lessons', lessonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLesson({ id: docSnap.id, ...docSnap.data() });
        setCompleted(!!docSnap.data().completed); // Tạm thời, thực tế sẽ lưu theo user
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải bài học: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      // Thực tế sẽ lưu trạng thái hoàn thành vào user_lesson hoặc profile user
      await updateDoc(doc(firestore, 'lessons', lessonId), { completed: true });
      setCompleted(true);
      setSnackbar({ visible: true, message: 'Đã đánh dấu hoàn thành!', error: false });
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể đánh dấu: ' + error.message, error: true });
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }
  if (!lesson) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Bài học không tồn tại.</Text></View>;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title={lesson.title} subtitle={lesson.topic} />
        <Card.Content>
          <Text style={{ marginBottom: 12 }}>{lesson.content}</Text>
          {lesson.videoUrl && (
            <Button icon="play" mode="outlined" onPress={() => Linking.openURL(lesson.videoUrl)} style={{ marginBottom: 8 }}>
              Xem video hướng dẫn
            </Button>
          )}
          {lesson.attachment && (
            <Button icon="file" mode="outlined" onPress={() => Linking.openURL(lesson.attachment)}>
              Xem tài liệu đính kèm
            </Button>
          )}
        </Card.Content>
      </Card>
      <Button
        mode={completed ? 'contained-tonal' : 'contained'}
        icon={completed ? 'check' : 'check-outline'}
        disabled={completed}
        onPress={handleMarkComplete}
      >
        {completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
      </Button>
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