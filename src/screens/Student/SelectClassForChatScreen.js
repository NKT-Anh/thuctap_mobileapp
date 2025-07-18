import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { getStudentClasses } from '../../services/classService';
import { useAuth } from '../../context/AuthContext';

export default function SelectClassForChatScreen({ navigation }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      setLoading(true);
      const data = await getStudentClasses(user.uid);
      setClasses(data);
      setLoading(false);
    }
    fetchClasses();
  }, [user.uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Chọn lớp để chat với giáo viên</Text>
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 16,
              backgroundColor: '#e3f2fd',
              borderRadius: 8,
              marginBottom: 12
            }}
            onPress={() => navigation.navigate('Chat', { classCode: item.id })}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Giáo viên: {item.teacher}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Bạn chưa tham gia lớp nào.</Text>}
      />
    </View>
  );
}