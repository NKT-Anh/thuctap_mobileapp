import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { 
  Card, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  FAB, 
  Dialog, 
  Portal, 
  Snackbar, 
  ActivityIndicator,
  Chip,
  List,
  IconButton,
  Menu,
  Divider,
  Surface
} from 'react-native-paper';
import { fetchExams, addExam, updateExam, deleteExam } from '../../services/examService';

export default function ExamManagementScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: 60,
    totalQuestions: 10,
    passingScore: 70,
    subject: '',
    difficulty: 'medium',
    status: 'draft',
    type: 'practice'
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, exam: null });
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await fetchExams();
      setExams(data || []);
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải danh sách đề thi: ' + error.message, 
        error: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchSearch = 
      exam.title?.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : exam.status === filter;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditExam(null);
    setForm({
      title: '',
      description: '',
      duration: 60,
      totalQuestions: 10,
      passingScore: 70,
      subject: '',
      difficulty: 'medium',
      status: 'draft',
      type: 'practice'
    });
    setModalVisible(true);
  };

  const openEditModal = (exam) => {
    setEditExam(exam);
    setForm(exam);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setSnackbar({ visible: true, message: 'Vui lòng nhập tiêu đề đề thi', error: true });
      return;
    }

    try {
      const examData = {
        ...form,
        duration: parseInt(form.duration) || 60,
        totalQuestions: parseInt(form.totalQuestions) || 10,
        passingScore: parseInt(form.passingScore) || 70,
        updatedAt: new Date()
      };

      if (editExam) {
        await updateExam(editExam.id, examData);
        setSnackbar({ visible: true, message: 'Cập nhật đề thi thành công!', error: false });
      } else {
        examData.createdAt = new Date();
        await addExam(examData);
        setSnackbar({ visible: true, message: 'Thêm đề thi thành công!', error: false });
      }

      setModalVisible(false);
      loadExams();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi lưu đề thi: ' + error.message, 
        error: true 
      });
    }
  };

  const handleDelete = async (exam) => {
    try {
      await deleteExam(exam.id);
      setSnackbar({ visible: true, message: 'Xóa đề thi thành công!', error: false });
      loadExams();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi xóa đề thi: ' + error.message, 
        error: true 
      });
    }
    setConfirmDialog({ visible: false, exam: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'archived': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'draft': return 'Nháp';
      case 'archived': return 'Lưu trữ';
      default: return 'Không xác định';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Trung bình';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'practice': return 'Luyện tập';
      case 'mock': return 'Thi thử';
      case 'official': return 'Chính thức';
      default: return 'Luyện tập';
    }
  };

  const renderExamItem = ({ item }) => (
    <Card style={styles.examCard}>
      <Card.Content>
        <View style={styles.examHeader}>
          <View style={styles.examInfo}>
            <Title style={styles.examTitle}>{item.title}</Title>
            <Text style={styles.examSubject}>{item.subject}</Text>
          </View>
          <View style={styles.examActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => setConfirmDialog({ visible: true, exam: item })}
            />
          </View>
        </View>

        <Text style={styles.examDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.examDetails}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
          <Chip mode="outlined" style={styles.detailChip}>
            {getTypeText(item.type)}
          </Chip>
          <Chip mode="outlined" style={styles.detailChip}>
            {getDifficultyText(item.difficulty)}
          </Chip>
        </View>

        <View style={styles.examStats}>
          <Text style={styles.statText}>⏱️ {item.duration} phút</Text>
          <Text style={styles.statText}>❓ {item.totalQuestions} câu</Text>
          <Text style={styles.statText}>🎯 {item.passingScore}% để đạt</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải danh sách đề thi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.searchSection}>
        <TextInput
          mode="outlined"
          label="Tìm kiếm đề thi..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          left={<TextInput.Icon icon="magnify" />}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)}>
              Lọc: {filter === 'all' ? 'Tất cả' : getStatusText(filter)}
            </Button>
          }
        >
          <Menu.Item onPress={() => { setFilter('all'); setMenuVisible(false); }} title="Tất cả" />
          <Menu.Item onPress={() => { setFilter('active'); setMenuVisible(false); }} title="Hoạt động" />
          <Menu.Item onPress={() => { setFilter('draft'); setMenuVisible(false); }} title="Nháp" />
          <Menu.Item onPress={() => { setFilter('archived'); setMenuVisible(false); }} title="Lưu trữ" />
        </Menu>
      </Surface>

      <FlatList
        data={filteredExams}
        renderItem={renderExamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đề thi nào</Text>
            <Button mode="contained" onPress={openAddModal} style={styles.emptyButton}>
              Tạo đề thi đầu tiên
            </Button>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddModal}
        label="Thêm đề thi"
      />

      {/* Modal thêm/sửa đề thi */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{editExam ? 'Sửa đề thi' : 'Thêm đề thi mới'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                mode="outlined"
                label="Tiêu đề đề thi *"
                value={form.title}
                onChangeText={(text) => setForm({...form, title: text})}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Môn học"
                value={form.subject}
                onChangeText={(text) => setForm({...form, subject: text})}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Mô tả"
                value={form.description}
                onChangeText={(text) => setForm({...form, description: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <View style={styles.row}>
                <TextInput
                  mode="outlined"
                  label="Thời gian (phút)"
                  value={form.duration.toString()}
                  onChangeText={(text) => setForm({...form, duration: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                />

                <TextInput
                  mode="outlined"
                  label="Số câu hỏi"
                  value={form.totalQuestions.toString()}
                  onChangeText={(text) => setForm({...form, totalQuestions: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

              <TextInput
                mode="outlined"
                label="Điểm đạt (%)"
                value={form.passingScore.toString()}
                onChangeText={(text) => setForm({...form, passingScore: parseInt(text) || 0})}
                keyboardType="numeric"
                style={styles.input}
              />

              {/* Các dropdown cho difficulty, status, type sẽ cần component riêng */}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Hủy</Button>
            <Button onPress={handleSave}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={confirmDialog.visible} 
          onDismiss={() => setConfirmDialog({ visible: false, exam: null })}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc chắn muốn xóa đề thi "{confirmDialog.exam?.title}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, exam: null })}>
              Hủy
            </Button>
            <Button onPress={() => handleDelete(confirmDialog.exam)}>
              Xóa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={snackbar.error ? styles.errorSnackbar : styles.successSnackbar}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  examCard: {
    marginBottom: 12,
    elevation: 2,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  examSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  examActions: {
    flexDirection: 'row',
  },
  examDescription: {
    marginVertical: 8,
    color: '#333',
  },
  examDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  statusChip: {
    marginRight: 4,
  },
  detailChip: {
    marginRight: 4,
  },
  examStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    paddingHorizontal: 24,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
}); 