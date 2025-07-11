import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'teacher', content: 'Chào bạn, có gì cần hỗ trợ?' },
    { id: 2, sender: 'student', content: 'Em muốn hỏi về bài tập 2.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { id: msgs.length + 1, sender: 'student', content: input }]);
    setInput('');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Trao đổi với Giáo viên</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, alignSelf: item.sender === 'student' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'student' ? '#e3f2fd' : '#fff' }}>
            <Card.Content>
              <Text>{item.content}</Text>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TextInput
          style={{ flex: 1, marginRight: 8 }}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChangeText={setInput}
        />
        <Button mode="contained" onPress={handleSend}>Gửi</Button>
      </View>
    </View>
  );
} 