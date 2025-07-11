import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Button, Card, Snackbar } from 'react-native-paper';
import { getDocs, collection, query, where, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function JoinClassScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const { user } = useAuth();

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, 'classes'), where('code', '==', code.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setSnackbar({ visible: true, message: 'Mã lớp không hợp lệ!', error: true });
        setLoading(false);
        return;
      }
      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();
      if ((classData.students || []).includes(user.email)) {
        setSnackbar({ visible: true, message: 'Bạn đã tham gia lớp này!', error: true });
        setLoading(false);
        return;
      }
      const newStudents = [...(classData.students || []), user.email];
      await updateDoc(doc(firestore, 'classes', classDoc.id), { students: newStudents });
      setSnackbar({ visible: true, message: 'Tham gia lớp thành công!', error: false });
      setCode('');
    } catch (error) {
      setSnackbar({ visible: true, message: 'Lỗi: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Card>
        <Card.Title title="Tham gia lớp bằng mã" />
        <Card.Content>
          <TextInput
            label="Nhập mã lớp"
            value={code}
            onChangeText={setCode}
            style={{ marginBottom: 16 }}
            autoCapitalize="characters"
          />
          <Button mode="contained" loading={loading} onPress={handleJoin} disabled={loading || !code.trim()}>
            Tham gia lớp
          </Button>
        </Card.Content>
      </Card>
      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={2000}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
} 