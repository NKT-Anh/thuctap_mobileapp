import React, { useState, useEffect } from 'react';
import { View, ScrollView, Linking } from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
  Divider,
  Surface,
} from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function LessonDetailScreen() {
  const route = useRoute();
  const { lessonId } = route.params;
  const { user } = useAuth();

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

        const progressQ = query(
          collection(firestore, 'userLessons'),
          where('userId', '==', user.uid),
          where('lessonId', '==', lessonId)
        );
        const progressSnap = await getDocs(progressQ);
        setCompleted(!progressSnap.empty);
      }
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải bài học: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await setDoc(doc(firestore, 'userLessons', `${user.uid}_${lessonId}`), {
        userId: user.uid,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
      setCompleted(true);
      setSnackbar({ visible: true, message: 'Đã đánh dấu hoàn thành!', error: false });
    } catch (error) {
      setSnackbar({ visible: true, message: 'Lỗi khi đánh dấu: ' + error.message, error: true });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="bodyLarge">Bài học không tồn tại.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card mode="outlined" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Card.Title
          title={lesson.title}
          subtitle={`📚 Chủ đề: ${lesson.topic}`}
          titleStyle={{ fontSize: 20, fontWeight: 'bold' }}
        />
        <Divider />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginVertical: 12, lineHeight: 22 }}>
            {lesson.content}
          </Text>

          {lesson.videoUrl && (
            <Button
              icon="play-circle"
              mode="elevated"
              onPress={() => Linking.openURL(lesson.videoUrl)}
              style={{ marginTop: 8 }}
            >
              Xem video hướng dẫn
            </Button>
          )}

          {lesson.attachment && (
            <Button
              icon="file-document"
              mode="outlined"
              onPress={() => Linking.openURL(lesson.attachment)}
              style={{ marginTop: 8 }}
            >
              Tài liệu đính kèm
            </Button>
          )}
        </Card.Content>
      </Card>

      <Surface
        style={{
          elevation: 2,
          borderRadius: 12,
          padding: 16,
          backgroundColor: completed ? '#e8f5e9' : '#f1f8e9',
          marginBottom: 20,
        }}
      >
        <Text
          variant="titleMedium"
          style={{ marginBottom: 12, color: completed ? '#2e7d32' : '#33691e' }}
        >
          {completed ? '✅ Bạn đã hoàn thành bài học này!' : '🔔 Bạn chưa hoàn thành bài học.'}
        </Text>
        <Button
          icon={completed ? 'check-circle' : 'check-outline'}
          mode={completed ? 'contained-tonal' : 'contained'}
          disabled={completed}
          onPress={handleMarkComplete}
        >
          {completed ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
        </Button>
      </Surface>

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
