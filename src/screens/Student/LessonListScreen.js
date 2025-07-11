import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Snackbar } from 'react-native-paper';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import ClassPicker from '../../components/ClassPicker';

export default function LessonListScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const navigation = useNavigation();
  const { user } = useAuth();
  const [classCodes, setClassCodes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    if (selectedClass) {
      loadLessons(selectedClass);
    }
  }, [selectedClass]);

  const loadStudentClasses = async () => {
    try {
      const q = query(collection(firestore, 'classes'), where('students', 'array-contains', user.email));
      const querySnapshot = await getDocs(q);
      const codes = querySnapshot.docs.map(doc => doc.data().code);
      setClassCodes(codes);
      loadLessons(codes[0]);
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải lớp: ' + error.message, error: true });
    }
  };

  const loadLessons = async (classCode) => {
    try {
      setLoading(true);
      if (!classCode) {
        setLessons([]);
        setLoading(false);
        return;
      }
      const q = query(collection(firestore, 'lessons'), where('classCode', '==', classCode));
      const querySnapshot = await getDocs(q);
      setLessons(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      setSnackbar({ visible: true, message: 'Không thể tải bài học: ' + error.message, error: true });
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
      <Text variant="titleLarge" style={{ marginBottom: 12 }}>Danh sách Bài học</Text>
      <FlatList
        data={lessons}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id })}>
            <Card style={{ marginBottom: 12 }}>
              <Card.Title title={item.title} subtitle={item.topic} />
              <Card.Content>
                <Text numberOfLines={2} style={{ color: '#555' }}>{item.content}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Chưa có bài học nào.</Text>}
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