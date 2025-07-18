import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import ClassPicker from '../../components/ClassPicker';

export default function LessonListScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    error: false,
  });

  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const initialClassCode = route.params?.classCode || '';
  const [classCodes, setClassCodes] = useState([]);
  const [selectedClass, setSelectedClass] = useState(initialClassCode);

  useEffect(() => {
    if (!initialClassCode) {
      loadStudentClasses();
    } else {
      setSelectedClass(initialClassCode);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadLessons(selectedClass);
    }
  }, [selectedClass]);

  const loadStudentClasses = async () => {
    try {
      const q = query(
        collection(firestore, 'classes'),
        where('students', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const codes = querySnapshot.docs.map((doc) => doc.data().code);
      setClassCodes(codes);
      setSelectedClass(codes[0]);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải lớp: ' + error.message,
        error: true,
      });
    }
  };

  const loadLessons = async (classCode) => {
    try {
      setLoading(true);
      const q = query(
        collection(firestore, 'lessons'),
        where('classId', '==', selectedClass)
      );
      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLessons(result);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải bài học: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExitClass = () => {
    setSelectedClass('');
    setLessons([]);
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
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
        📘 Danh sách Bài học
      </Text>

      <FlatList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('LessonDetail', { lessonId: item.id })
            }
          >
            <Card style={{ marginBottom: 12, elevation: 2 }}>
              <Card.Title
                title={item.title}
                subtitle={`Chủ đề: ${item.topic || 'Không có'}`}
                left={() => (
                  <Avatar.Text
                    size={40}
                    label={`${index + 1}`}
                    style={{ backgroundColor: '#007AFF' }}
                    color="white"
                  />
                )}
              />
              <Card.Content>
                <Text numberOfLines={2} style={{ color: '#555' }}>
                  {item.content || 'Không có nội dung mô tả.'}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text
            style={{ textAlign: 'center', marginTop: 20, color: '#999' }}
          >
            Chưa có bài học nào.
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
