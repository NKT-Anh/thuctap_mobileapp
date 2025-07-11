import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { fetchUsers } from '../../services/userService';
import { addNotification } from '../../services/notificationService';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function NotificationScreen() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Lấy tất cả lớp từ Firestore
    const fetchClasses = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'classes'));
      setClasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClasses();
  }, []);

  const handleSend = async () => {
    if (!selectedClass) {
      Alert.alert('Lỗi', 'Vui lòng chọn lớp!');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung thông báo!');
      return;
    }
    setSending(true);
    try {
      // Lấy danh sách học viên trong lớp
      const db = getFirestore();
      const studentsSnapshot = await getDocs(collection(db, 'classes', selectedClass, 'students'));
      const studentIds = studentsSnapshot.docs.map(doc => doc.id);
      if (studentIds.length === 0) {
        Alert.alert('Không có học viên nào trong lớp này!');
        setSending(false);
        return;
      }
      // Gửi thông báo cho từng học viên
      let success = 0, fail = 0;
      for (const studentId of studentIds) {
        try {
          await addNotification({
            userId: studentId,
            classId: selectedClass,
            content: message,
            createdAt: new Date(),
            type: 'class',
          });
          success++;
        } catch {
          fail++;
        }
      }
      Alert.alert('Kết quả', `Đã gửi thông báo cho ${success} học viên${fail ? ', lỗi: ' + fail : ''}`);
      setMessage('');
    } catch (e) {
      Alert.alert('Lỗi', e.message || 'Không thể gửi thông báo!');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gửi thông báo cho lớp</Text>
      <Text style={{ marginBottom: 8 }}>Chọn lớp:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {classes.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.classBtn, selectedClass === c.id && styles.classBtnActive]}
            onPress={() => setSelectedClass(c.id)}
          >
            <Text style={selectedClass === c.id ? styles.classBtnActiveText : {}}>{c.name || c.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        placeholder="Nội dung thông báo"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity
        style={[styles.sendBtn, sending && { opacity: 0.6 }]}
        onPress={handleSend}
        disabled={sending}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Gửi thông báo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 16, width: 320 },
  sendBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 5, alignItems: 'center', marginTop: 10, width: 200 },
  classBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginRight: 8, backgroundColor: '#fff' },
  classBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  classBtnActiveText: { color: '#fff', fontWeight: 'bold' },
}); 