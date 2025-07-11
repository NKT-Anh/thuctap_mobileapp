import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { getClassDetail } from '../../services/teacherClassService';

export default function TeacherClassDetailScreen({ route }) {
  const { classId, className } = route.params;
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const detail = await getClassDetail(classId);
        setStudents(detail.students);
        setExams(detail.exams);
      } catch (e) {
        setStudents([]);
        setExams([]);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [classId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Chi tiết lớp: {className}</Text>
      <Text style={styles.sectionTitle}>Danh sách học sinh ({students.length}):</Text>
      <FlatList
        data={students}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name || item.id}</Text>}
        ListEmptyComponent={<Text>Không có học sinh.</Text>}
      />
      <Text style={styles.sectionTitle}>Danh sách đề thi ({exams.length}):</Text>
      <FlatList
        data={exams}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.title || item.id}</Text>}
        ListEmptyComponent={<Text>Không có đề thi.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  item: { fontSize: 16, paddingVertical: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}); 