import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function MyClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const { user } = useAuth();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const q = query(collection(firestore, 'classes'), where('students', 'array-contains', user.email));
      const querySnapshot = await getDocs(q);
      setClasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải danh sách lớp: ' + error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></View>;
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Lớp của tôi</Text>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Card.Title title={item.name} subtitle={`Mã lớp: ${item.code || '-'} | Giáo viên: ${item.teacher || '-'}`} />
            <Card.Content>
              <Text>Sĩ số: {item.students?.length || 0}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Bạn chưa tham gia lớp nào.</Text>}
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