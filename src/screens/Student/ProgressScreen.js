import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Divider } from 'react-native-paper';
import ClassPicker from '../../components/ClassPicker';

export default function ProgressScreen() {
  const [selectedClass, setSelectedClass] = useState('');

  // Dữ liệu mock, thực tế sẽ lấy từ Firestore
  const progress = {
    practice: 8,
    mockExam: 7,
    officialExam: 6,
    chart: [5, 6, 7, 8],
  };
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Tiến độ học tập</Text>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm luyện tập" />
        <Card.Content>
          <Text>Điểm trung bình: <Text style={{ fontWeight: 'bold' }}>{progress.practice}</Text></Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm thi thử" />
        <Card.Content>
          <Text>Điểm trung bình: <Text style={{ fontWeight: 'bold' }}>{progress.mockExam}</Text></Text>
        </Card.Content>
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Điểm thi chính thức" />
        <Card.Content>
          <Text>Điểm trung bình: <Text style={{ fontWeight: 'bold' }}>{progress.officialExam}</Text></Text>
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