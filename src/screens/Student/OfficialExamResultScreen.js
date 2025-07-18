import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function OfficialExamResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { result } = route.params || {};

  if (!result) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không có dữ liệu kết quả.</Text>
      </View>
    );
  }

  const {
    userName,
    score,
    total,
    answers,
    startedAt,
    submittedAt
  } = result;

  const correctCount = answers.filter((a) => a.isCorrect).length;

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} lúc ${d.toLocaleTimeString()}`;
  };

  const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.floor((e - s) / 1000); // seconds
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins} phút ${secs} giây`;
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Card.Title title="📄 Kết quả Thi chính thức" />
        <Card.Content>
          {userName && (
            <Text>👤 Học sinh: <Text style={{ fontWeight: 'bold' }}>{userName}</Text></Text>
          )}
          <Text>📝 Điểm: <Text style={{ fontWeight: 'bold' }}>{score}</Text> / 10</Text>
          <Text>✅ Số câu đúng: <Text style={{ fontWeight: 'bold' }}>{correctCount}</Text> / {total}</Text>
          {startedAt && <Text>🕐 Bắt đầu: {formatDate(startedAt)}</Text>}
          {submittedAt && <Text>✅ Nộp bài: {formatDate(submittedAt)}</Text>}
          {startedAt && submittedAt && (
            <Text>⏱️ Thời gian làm bài: <Text style={{ fontWeight: 'bold' }}>{getDuration(startedAt, submittedAt)}</Text></Text>
          )}
          <Text style={{ color: 'red', marginTop: 8 }}>
            Kết quả này đã được ghi nhận vào hồ sơ học tập của bạn.
          </Text>
        </Card.Content>
      </Card>

      {answers.map((ans, idx) => {
        const selectedText =
          ans.selected != null && ans.options
            ? ans.options[parseInt(ans.selected)]
            : 'Chưa chọn';

        const correctText = Array.isArray(ans.correct)
          ? ans.correct.map((i) => ans.options?.[parseInt(i)]).join(', ')
          : ans.options?.[parseInt(ans.correct)];

        return (
          <Card key={idx} style={{ marginBottom: 10 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold' }}>
                Câu {idx + 1}: {ans.question}
              </Text>

              <Text>
                Đáp án của bạn:{' '}
                <Text style={{ color: ans.isCorrect ? 'green' : 'red' }}>
                  {selectedText}
                </Text>
              </Text>

              <Text>
                Đáp án đúng:{' '}
                <Text style={{ color: 'green' }}>
                  {correctText}
                </Text>
              </Text>

              {ans.explanation && (
                <Text style={{ color: '#555' }}>
                  Giải thích: {ans.explanation}
                </Text>
              )}
            </Card.Content>
          </Card>
        );
      })}

      <Divider style={{ marginVertical: 16 }} />
      <Button mode="contained" onPress={() => navigation.goBack()}>
        Quay lại
      </Button>
    </ScrollView>
  );
}
