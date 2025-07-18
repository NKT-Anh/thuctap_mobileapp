import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { getDocs, collection, query, where, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';

// Gửi tin nhắn trả lời học viên
async function replyToStudent(chatId, content) {
  const chatRef = collection(firestore, 'chats');
  const docRef = doc(chatRef, chatId);
  await updateDoc(docRef, {
    messages: arrayUnion({ sender: 'teacher', content, timestamp: Date.now() })
  });
}

export default function TeacherChatDetailScreen({ route }) {
  const { chat } = route.params;
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(chat.messages || []);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Đánh dấu đã đọc
    updateDoc(doc(firestore, 'chats', chat.id), { teacherUnreadCount: 0 });
  }, [chat.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await replyToStudent(chat.id, input);
    setMessages(msgs => [...msgs, { sender: 'teacher', content: input, timestamp: Date.now() }]);
    setInput('');
    setSending(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Lớp: {chat.className || chat.classCode}</Text>
      <Text style={{ marginBottom: 8 }}>Học viên: {chat.studentName || chat.idStudent}</Text>
      <FlatList
        data={messages.sort((a, b) => a.timestamp - b.timestamp)}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, alignSelf: item.sender === 'teacher' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'teacher' ? '#e3f2fd' : '#fff' }}>
            <Card.Content>
              <Text>{item.sender === 'teacher' ? ' ' : ' '}{item.content}</Text>
              <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' +
                  new Date(item.timestamp).toLocaleDateString('vi-VN') : ''}
              </Text>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TextInput
          style={{ flex: 1, marginRight: 8 }}
          placeholder="Nhập tin nhắn trả lời..."
          value={input}
          onChangeText={setInput}
        />
        <Button mode="contained" onPress={handleSend} loading={sending}>Gửi</Button>
      </View>
    </View>
  );
}