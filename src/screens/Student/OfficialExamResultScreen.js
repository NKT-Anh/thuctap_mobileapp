import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function OfficialExamResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { result } = route.params || {};
  if (!result) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Không có dữ liệu kết quả.</Text></View>;
  }
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="Kết quả Thi chính thức" />
        <Card.Content>
          <Text>Điểm: <Text style={{ fontWeight: 'bold' }}>{result.score}</Text> / {result.total}</Text>
          <Text style={{ color: 'red', marginTop: 8 }}>Kết quả này đã được ghi nhận vào hồ sơ học tập của bạn.</Text>
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
      <Divider style={{ marginVertical: 16 }} />
      <Button mode="contained" onPress={() => navigation.goBack()}>Quay lại</Button>
    </ScrollView>
  );
} 