import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, Menu, Button, ActivityIndicator } from 'react-native-paper';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../firebaseConfig';
import { useAuth } from '../context/AuthContext';

export default function ClassPicker({ selectedCode, onChange }) {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      let q;
      if (user?.role === 'teacher') {
        q = query(collection(firestore, 'classes'), where('teacher', '==', user.uid));
      } else {
        q = query(collection(firestore, 'classes'), where('students', 'array-contains', user.uid));
      }
      const querySnapshot = await getDocs(q);
      setClasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginBottom: 12 }} />;
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ marginBottom: 4 }}>Chọn lớp:</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Button mode="outlined" onPress={() => setVisible(true)}>
            {classes.find(c => c.code === selectedCode)?.name || selectedCode || 'Chọn lớp'}
          </Button>
        }
      >
        {classes.map(c => (
          <Menu.Item key={c.code} onPress={() => { setVisible(false); onChange(c.code); }} title={`${c.name} (${c.code})`} />
        ))}
      </Menu>
    </View>
  );
} 