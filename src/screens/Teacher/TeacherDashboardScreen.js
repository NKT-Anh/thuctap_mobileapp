import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { getTeacherClassesWithStats } from '../../services/teacherClassService';
import { useNavigation } from '@react-navigation/native';
// Giả sử AuthContext có userId
import { useAuth } from '../../context/AuthContext';


export default function TeacherDashboardScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTeacherClassesWithStats(user.uid);
        setClasses(data);
      } catch (e) {
        // Xử lý lỗi
        setClasses([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user.uid]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.classItem}
      onPress={() => navigation.navigate('TeacherClassDetail', { classId: item.id, className: item.name })}
    >
      <Text style={styles.className}>{item.name}</Text>
      <Text>Số học sinh: {item.studentCount}</Text>
      <Text>Số đề thi: {item.examCount}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Danh sách lớp bạn quản lý</Text>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Không có lớp nào.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  classItem: { padding: 16, backgroundColor: '#f2f2f2', borderRadius: 8, marginBottom: 12 },
  className: { fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
}); 