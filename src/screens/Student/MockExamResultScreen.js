import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function MockExamResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { result } = route.params || {};
  if (!result) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Không có dữ liệu kết quả.</Text></View>;
  }
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Kết quả Thi thử" />
        <Card.Content>
          <Text>Điểm: <Text style={{ fontWeight: 'bold' }}>{result.score}</Text> / {result.total}</Text>
        </Card.Content>
      </Card>
      {result.answers.map((ans, idx) => (
        <Card key={idx} style={{ marginBottom: 10 }}>
          <Card.Content>
            <Text style={{ fontWeight: 'bold' }}>Câu {idx + 1}: {ans.question}</Text>
            <Text>Đáp án của bạn: <Text style={{ color: ans.isCorrect ? 'green' : 'red' }}>{ans.selected || 'Chưa chọn'}</Text></Text>
            <Text>Đáp án đúng: <Text style={{ color: 'green' }}>{ans.correct}</Text></Text>
            {ans.explanation && <Text style={{ color: '#555' }}>Giải thích: {ans.explanation}</Text>}
          </Card.Content>
        </Card>
      ))}
      <Card style={{ marginVertical: 16 }}>
        <Card.Title title="Tỷ lệ đúng theo chủ đề" />
        <Card.Content>
          {result.topicStats && Object.entries(result.topicStats).map(([topic, percent]) => (
            <Text key={topic}>{topic}: <Text style={{ fontWeight: 'bold' }}>{percent}%</Text></Text>
          ))}
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => navigation.goBack()}>Quay lại Thi thử</Button>
    </ScrollView>
  );
} 