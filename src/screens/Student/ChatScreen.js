import React, { useState, useEffect } from 'react';
import { View, FlatList, BackHandler } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { getTeacherEmailByClassCode, getChatMessages, sendMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatScreen({ route }) {
  const { classCode } = route.params; // truyền classCode khi navigate tới màn hình chat
  const { user } = useAuth(); // user.uid là studentId
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [className, setClassName] = useState('');

  // Lấy email giáo viên và tên lớp khi vào màn hình
  useEffect(() => {
    async function fetchClassInfo() {
      try {
        const email = await getTeacherEmailByClassCode(classCode);
        setTeacherEmail(email);
        // Lấy tên lớp
        const classDoc = await getDoc(doc(firestore, 'classes', classCode));
        if (classDoc.exists()) {
          setClassName(classDoc.data().name || '');
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin lớp hoặc giáo viên:', error);
      }
    }
    fetchClassInfo();
  }, [classCode]);

  // Lấy messages khi đã có teacherEmail
  useEffect(() => {
    if (!teacherEmail) return;
    async function fetchMessages() {
      try {
        const msgs = await getChatMessages(user.uid, teacherEmail, classCode);
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
      } catch (error) {
        console.error('Lỗi lấy lịch sử chat:', error);
      }
    }
    fetchMessages();
    // Có thể setInterval để tự động reload, hoặc dùng onSnapshot nếu muốn realtime
  }, [teacherEmail, classCode, user.uid]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await sendMessage(
        user.uid, // studentId
        user.name, // studentName
        teacherEmail, // teacherEmail
        classCode, // classCode
        className, // className
        input, // content
        'student' // sender
      );
      setMessages(msgs => [...msgs, { sender: 'student', content: input, timestamp: Date.now() }]);
      setInput('');
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Trao đổi với Giáo viên</Text>
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, alignSelf: item.sender === 'student' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'student' ? '#e3f2fd' : '#fff' }}>
            <Card.Content>
              <Text>{item.content}</Text>
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
          placeholder="Nhập tin nhắn..."
          value={input}
          onChangeText={setInput}
        />
        <Button mode="contained" onPress={handleSend}>Gửi</Button>
      </View>
    </View>
  );
}