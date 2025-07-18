import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { getDocs, collection, query, where, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { TextInput, Button, Card } from 'react-native-paper';

// Lấy tất cả các cuộc chat của giáo viên
async function getTeacherChats(teacherEmail) {
  const chatsRef = collection(firestore, 'chats');
  const q = query(chatsRef, where('teacher', '==', teacherEmail));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Gửi tin nhắn trả lời học viên
async function replyToStudent(chatId, content) {
  const chatRef = collection(firestore, 'chats');
  const docRef = doc(chatRef, chatId);
  await updateDoc(docRef, {
    messages: arrayUnion({ sender: 'teacher', content, timestamp: Date.now() })
  });
}

export default function TeacherChatScreen({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    async function fetchChats() {
      setLoading(true);
      const data = await getTeacherChats(user.email);
      setChats(data);
      setLoading(false);
    }
    fetchChats();
  }, [user?.email]);

  // Đếm số cuộc chat có tin nhắn chưa đọc
  useEffect(() => {
    setUnreadChatCount(chats.filter(c => c.teacherUnreadCount > 0).length);
  }, [chats]);

  // Khi chọn chat:
  const handleSelectChat = (chat) => {
    navigation.navigate('TeacherChatDetail', { chat });
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;
    setSending(true);
    await replyToStudent(selectedChat.id, input);
    // Cập nhật lại lịch sử chat sau khi gửi
    const updatedChats = await getTeacherChats(user.email);
    setChats(updatedChats);
    setSelectedChat(updatedChats.find(c => c.id === selectedChat.id));
    setInput('');
    setSending(false);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  if (!selectedChat) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Danh sách chat với học viên</Text>
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ padding: 16, backgroundColor: '#e3f2fd', borderRadius: 8, marginBottom: 12 }}
              onPress={() => handleSelectChat(item)}
            >
              <Text style={{ fontSize: 17, fontWeight: 'bold' }}>Lớp: {item.className || item.classCode}</Text>
              <Text>Học viên: {item.studentName || item.idStudent}</Text>
              {item.teacherUnreadCount > 0 && (
                <View style={{
                  backgroundColor: 'red',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  alignSelf: 'flex-start',
                  marginTop: 4
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.teacherUnreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>Chưa có cuộc chat nào.</Text>}
        />
      </View>
    );
  }

  // Hiển thị lịch sử chat và khung trả lời
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button icon="arrow-left" onPress={() => setSelectedChat(null)} style={{ marginBottom: 8 }}>Quay lại</Button>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Lớp: {selectedChat.className || selectedChat.classCode}</Text>
      <Text style={{ marginBottom: 8 }}>Học viên: {selectedChat.studentName || selectedChat.idStudent}</Text>
      <FlatList
        data={selectedChat.messages.sort((a, b) => a.timestamp - b.timestamp)}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, alignSelf: item.sender === 'teacher' ? 'flex-end' : 'flex-start', backgroundColor: item.sender === 'teacher' ? '#e3f2fd' : '#fff' }}>
            <Card.Content>
              <Text>{item.sender === 'teacher' ? 'Bạn: ' : 'Học viên: '}{item.content}</Text>
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