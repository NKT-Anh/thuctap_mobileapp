import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
  Avatar,
  Button,
} from 'react-native-paper';
import {
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import ClassPicker from '../../components/ClassPicker';

export default function NotificationScreen() {
  const { user } = useAuth();

  const [classCodes, setClassCodes] = useState([]); // List of { code, id }
  const [selectedClass, setSelectedClass] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    error: false,
  });

  useEffect(() => {
    if (user?.uid) {
      loadStudentClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      loadNotifications(selectedClass);
    }
  }, [selectedClass]);

  const loadStudentClasses = async () => {
    try {
      const q = query(
        collection(firestore, 'classes'),
        where('students', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const codes = snapshot.docs.map((doc) => ({
        id: doc.id, // classId
        code: doc.data().code,
      }));

      setClassCodes(codes);

      if (codes.length > 0) {
        setSelectedClass(codes[0].code); // select first class by code
      }
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải lớp: ' + error.message,
        error: true,
      });
    }
  };

  const loadNotifications = async (classCode) => {
    try {
      setLoading(true);
      const classItem = classCodes.find((c) => c.code === classCode);

      if (!classItem) {
        throw new Error('Không tìm thấy mã lớp.');
      }

      const q = query(
        collection(firestore, 'notifications'),
        where('classId', '==', classItem.id)
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(list);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải thông báo: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExitClass = () => {
    setSelectedClass('');
    setNotifications([]);
  };

  if (loading && selectedClass) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {!selectedClass ? (
        <ClassPicker selectedCode={selectedClass} onChange={setSelectedClass} />
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              🏫 Lớp hiện tại: {selectedClass}
            </Text>
            <Button mode="outlined" onPress={handleExitClass} compact>
              Thoát lớp
            </Button>
          </View>
        </>
      )}

      <Text
        variant="titleLarge"
        style={{ marginBottom: 12, fontSize: 22, fontWeight: 'bold' }}
      >
        🔔 Danh sách Thông báo
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Card style={{ marginBottom: 12, elevation: 2 }}>
            <Card.Title
              title={item.title || 'Thông báo'}
              subtitle={new Date(item.createdAt?.seconds * 1000).toLocaleString()}
              left={() => (
                <Avatar.Text
                  size={40}
                  label={`${index + 1}`}
                  style={{ backgroundColor: '#FF7043' }}
                  color="white"
                />
              )}
            />
            <Card.Content>
              <Text>{item.content || 'Không có nội dung.'}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text
            style={{ textAlign: 'center', marginTop: 20, color: '#999' }}
          >
            Không có thông báo nào.
          </Text>
        }
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{ backgroundColor: snackbar.error ? '#d32f2f' : '#43a047' }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}
