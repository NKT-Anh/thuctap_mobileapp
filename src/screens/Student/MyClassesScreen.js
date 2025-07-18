import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Snackbar,
  FAB,
} from 'react-native-paper';
import {
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function MyClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    error: false,
  });

  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Truy vấn danh sách lớp học chứa UID của user
      const q = query(
        collection(firestore, 'classes'),
        where('students', 'array-contains', user.uid)
      );
      const querySnapshot = await getDocs(q);

      const classList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    } catch (error) {
      setSnackbar({
        visible: true,
        message: 'Không thể tải danh sách lớp: ' + error.message,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Lessons', { classCode: item.code }) // Thay 'Lessons' bằng tên route thật nếu khác
      }
    >
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 12,
          elevation: 2,
        }}
      >
        <Card.Title
          title={item.name}
          subtitle={`Mã lớp: ${item.code || '-'} | Giáo viên: ${item.teacher || '-'}`}
          titleStyle={{ fontSize: 18, fontWeight: '600' }}
        />
        <Card.Content>
          <Text style={{ color: '#555' }}>
            Sĩ số: {item.students?.length || 0}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f9f9f9' }}>
      <Text
        variant="titleMedium"
        style={{ marginBottom: 8, color: '#555' }}
      >
        Danh sách lớp bạn đã tham gia
      </Text>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 40,
          }}
        >
          <ActivityIndicator animating size="large" />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: 'center',
                marginTop: 40,
                color: '#888',
              }}
            >
              Bạn chưa tham gia lớp nào.
            </Text>
          }
        />
      )}

      <FAB
        icon="plus"
        label="Tham gia lớp"
        onPress={() => navigation.navigate('JoinClass')}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          backgroundColor: '#007AFF',
        }}
      />

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() =>
          setSnackbar({ ...snackbar, visible: false })
        }
        duration={2500}
        style={{
          backgroundColor: snackbar.error ? '#d32f2f' : '#43a047',
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}
