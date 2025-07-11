import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { getDocs, collection, orderBy, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import ClassPicker from '../../components/ClassPicker';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (selectedClass) {
      loadNotifications(selectedClass);
    }
  }, [selectedClass]);

  const loadNotifications = async (classCode) => {
    try {
      setLoading(true);
      if (!classCode) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const q = query(collection(firestore, 'notifications'), where('classCode', '==', classCode), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setNotifications(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải thông báo: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Card.Title title={item.title} subtitle={item.type} />
            <Card.Content>
              <Text>{item.content}</Text>
              <Text style={{ color: '#888', marginTop: 6 }}>{item.createdAt && new Date(item.createdAt.seconds * 1000).toLocaleString()}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Không có thông báo nào.</Text>}
      />
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