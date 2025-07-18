import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import ClassPicker from '../../components/ClassPicker';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ProgressScreen() {
  const [selectedClass, setSelectedClass] = useState('');
  const { user } = useAuth();
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  useEffect(() => {
    if (user && selectedClass) {
      loadProgress();
    }
  }, [user, selectedClass]);

  const loadProgress = async () => {
    // Đếm tổng số bài học của lớp
    const lessonsQ = query(collection(firestore, 'lessons'), where('classCode', '==', selectedClass));
    const lessonsSnap = await getDocs(lessonsQ);
    const total = lessonsSnap.size;
    // Đếm số bài học đã hoàn thành của user
    const completedQ = query(collection(firestore, 'user_lessons'), where('userId', '==', user.uid));
    const completedSnap = await getDocs(completedQ);
    // Lọc theo classCode nếu cần
    const completed = completedSnap.docs.filter(docu => {
      const lesson = lessonsSnap.docs.find(les => les.id === docu.data().lessonId);
      return !!lesson;
    }).length;
    setProgress({ completed, total });
  };
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Tiến độ học tập</Text>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Bài học đã hoàn thành" />
        <Card.Content>
          <Text>
            {progress.completed} / {progress.total} bài học ({progress.total > 0 ? Math.round(progress.completed / progress.total * 100) : 0}%)
          </Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm luyện tập" />
        <Card.Content>
          <Text>Chưa có điểm</Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm thi thử" />
        <Card.Content>
          <Text>Chưa có điểm</Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm thi chính thức" />
        <Card.Content>
          <Text>Chưa có điểm</Text>
        </Card.Content>
      </Card>
      <Divider style={{ marginVertical: 16 }} />
      <Card>
        <Card.Title title="Biểu đồ tiến bộ (mock)" />
        <Card.Content>
          <Text>5 → 6 → 7 → 8</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
} 