import React, { useState, useEffect } from 'react';
<<<<<<< Updated upstream
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
=======
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
>>>>>>> Stashed changes
import { 
  Card, 
  Title, 
  Text, 
<<<<<<< Updated upstream
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
=======
  Button, 
  ActivityIndicator,
  Surface,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Menu,
  Searchbar,
  FAB,
  Portal,
  Modal,
  TextInput,
  Switch,
  SegmentedButtons
} from 'react-native-paper';
import { 
  fetchExams, 
  addExam, 
  updateExam, 
  deleteExam 
} from '../../services/examService';
>>>>>>> Stashed changes

export default function ExamManagementScreen() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [form, setForm] = useState({
=======
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [menuVisible, setMenuVisible] = useState({});
  
  // Form states
  const [examForm, setExamForm] = useState({
>>>>>>> Stashed changes
    title: '',
    description: '',
    duration: 60,
    totalQuestions: 10,
    passingScore: 70,
<<<<<<< Updated upstream
    subject: '',
    difficulty: 'medium',
    status: 'draft',
    type: 'practice'
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, exam: null });
  const [menuVisible, setMenuVisible] = useState(false);
=======
    difficulty: 'easy',
    isPublished: false,
    isRandomized: false,
    allowRetake: false,
    maxAttempts: 1,
    type: 'practice',
    subject: '',
    tags: ''
  });

  const difficultyOptions = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' }
  ];

  const typeOptions = [
    { value: 'practice', label: 'Luyện tập' },
    { value: 'mock', label: 'Thi thử' },
    { value: 'official', label: 'Chính thức' }
  ];

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Nháp' },
    { value: 'practice', label: 'Luyện tập' },
    { value: 'official', label: 'Chính thức' }
  ];
>>>>>>> Stashed changes

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
<<<<<<< Updated upstream
      const data = await fetchExams();
      setExams(data || []);
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải danh sách đề thi: ' + error.message, 
        error: true 
      });
=======
      const examsData = await fetchExams();
      setExams(examsData);
    } catch (error) {
      Alert.alert('Lỗi', error.message);
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(exam => {
<<<<<<< Updated upstream
    const matchSearch = 
      exam.title?.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : exam.status === filter;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditExam(null);
    setForm({
=======
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'published' && exam.isPublished) ||
                         (filter === 'draft' && !exam.isPublished) ||
                         (filter === 'practice' && exam.type === 'practice') ||
                         (filter === 'official' && exam.type === 'official');
    
    return matchesSearch && matchesFilter;
  });

  const handleAddExam = () => {
    setEditingExam(null);
    setExamForm({
>>>>>>> Stashed changes
      title: '',
      description: '',
      duration: 60,
      totalQuestions: 10,
      passingScore: 70,
<<<<<<< Updated upstream
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
=======
      difficulty: 'easy',
      isPublished: false,
      isRandomized: false,
      allowRetake: false,
      maxAttempts: 1,
      type: 'practice',
      subject: '',
      tags: ''
    });
    setIsModalVisible(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title || '',
      description: exam.description || '',
      duration: exam.duration || 60,
      totalQuestions: exam.totalQuestions || 10,
      passingScore: exam.passingScore || 70,
      difficulty: exam.difficulty || 'easy',
      isPublished: exam.isPublished || false,
      isRandomized: exam.isRandomized || false,
      allowRetake: exam.allowRetake || false,
      maxAttempts: exam.maxAttempts || 1,
      type: exam.type || 'practice',
      subject: exam.subject || '',
      tags: exam.tags?.join(', ') || ''
    });
    setIsModalVisible(true);
  };

  const handleSaveExam = async () => {
    try {
      if (!examForm.title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề đề thi');
        return;
      }

      const examData = {
        ...examForm,
        tags: examForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: parseInt(examForm.duration) || 60,
        totalQuestions: parseInt(examForm.totalQuestions) || 10,
        passingScore: parseInt(examForm.passingScore) || 70,
        maxAttempts: parseInt(examForm.maxAttempts) || 1
      };

      if (editingExam) {
        await updateExam(editingExam.id, examData);
        Alert.alert('Thành công', 'Đã cập nhật đề thi');
      } else {
        await addExam(examData);
        Alert.alert('Thành công', 'Đã thêm đề thi mới');
      }

      setIsModalVisible(false);
      loadExams();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleDeleteExam = (exam) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa đề thi "${exam.title}"?\nTất cả kết quả thi liên quan sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExam(exam.id);
              Alert.alert('Thành công', 'Đã xóa đề thi');
              loadExams();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            }
          }
        }
      ]
    );
  };

  const togglePublishExam = async (exam) => {
    try {
      await updateExam(exam.id, { isPublished: !exam.isPublished });
      loadExams();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getDifficultyLabel = (difficulty) => {
>>>>>>> Stashed changes
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
<<<<<<< Updated upstream
      default: return 'Trung bình';
    }
  };

  const getTypeText = (type) => {
=======
      default: return 'Không xác định';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'practice': return '#2196F3';
      case 'mock': return '#FF9800';
      case 'official': return '#F44336';
      default: return '#757575';
    }
  };

  const getTypeLabel = (type) => {
>>>>>>> Stashed changes
    switch (type) {
      case 'practice': return 'Luyện tập';
      case 'mock': return 'Thi thử';
      case 'official': return 'Chính thức';
<<<<<<< Updated upstream
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
=======
      default: return 'Không xác định';
    }
  };

  const formatDuration = (duration) => {
    return `${duration} phút`;
  };

  const showMenu = (examId) => {
    setMenuVisible({ ...menuVisible, [examId]: true });
  };

  const hideMenu = (examId) => {
    setMenuVisible({ ...menuVisible, [examId]: false });
  };
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
      {/* Header */}
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Quản lý đề thi</Title>
        <Text style={styles.headerSubtitle}>
          Tổng số: {exams.length} đề thi
        </Text>
      </Surface>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm đề thi..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={filterOptions}
          style={styles.filterButtons}
        />
      </View>

      {/* Exams List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredExams.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Không tìm thấy đề thi nào' : 'Chưa có đề thi nào'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredExams.map((exam) => (
            <Card key={exam.id} style={styles.examCard}>
              <Card.Content>
                <View style={styles.examHeader}>
                  <View style={styles.examInfo}>
                    <Title style={styles.examTitle}>{exam.title}</Title>
                    {exam.subject && (
                      <Text style={styles.examSubject}>{exam.subject}</Text>
                    )}
                    {exam.description && (
                      <Text style={styles.examDescription} numberOfLines={2}>
                        {exam.description}
                      </Text>
                    )}
                    <View style={styles.examMeta}>
                      <Chip 
                        mode="outlined" 
                        style={[styles.typeChip, { borderColor: getTypeColor(exam.type) }]}
                        textStyle={{ color: getTypeColor(exam.type) }}
                      >
                        {getTypeLabel(exam.type)}
                      </Chip>
                      <Chip 
                        mode="outlined" 
                        style={[styles.difficultyChip, { borderColor: getDifficultyColor(exam.difficulty) }]}
                        textStyle={{ color: getDifficultyColor(exam.difficulty) }}
                      >
                        {getDifficultyLabel(exam.difficulty)}
                      </Chip>
                      <Chip 
                        mode={exam.isPublished ? 'flat' : 'outlined'}
                        style={exam.isPublished ? styles.publishedChip : styles.draftChip}
                      >
                        {exam.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </Chip>
                    </View>
                    <View style={styles.examStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Câu hỏi:</Text>
                        <Text style={styles.statValue}>{exam.totalQuestions}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Thời gian:</Text>
                        <Text style={styles.statValue}>{formatDuration(exam.duration)}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Điểm đỗ:</Text>
                        <Text style={styles.statValue}>{exam.passingScore}%</Text>
                      </View>
                    </View>
                    {exam.tags && exam.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {exam.tags.map((tag, index) => (
                          <Chip key={index} mode="outlined" style={styles.tagChip}>
                            {tag}
                          </Chip>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.examActions}>
                    <Menu
                      visible={menuVisible[exam.id] || false}
                      onDismiss={() => hideMenu(exam.id)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          onPress={() => showMenu(exam.id)}
                        />
                      }
                    >
                      <Menu.Item
                        leadingIcon="pencil"
                        title="Chỉnh sửa"
                        onPress={() => {
                          hideMenu(exam.id);
                          handleEditExam(exam);
                        }}
                      />
                      
                      <Menu.Item
                        leadingIcon={exam.isPublished ? "eye-off" : "eye"}
                        title={exam.isPublished ? "Ẩn" : "Xuất bản"}
                        onPress={() => {
                          hideMenu(exam.id);
                          togglePublishExam(exam);
                        }}
                      />
                      
                      <Menu.Item
                        leadingIcon="delete"
                        title="Xóa"
                        onPress={() => {
                          hideMenu(exam.id);
                          handleDeleteExam(exam);
                        }}
                      />
                    </Menu>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Exam FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddExam}
        label="Thêm đề thi"
      />

      {/* Add/Edit Exam Modal */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Title style={styles.modalTitle}>
              {editingExam ? 'Chỉnh sửa đề thi' : 'Thêm đề thi mới'}
            </Title>

            <TextInput
              label="Tiêu đề đề thi *"
              value={examForm.title}
              onChangeText={(text) => setExamForm({ ...examForm, title: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Môn học"
              value={examForm.subject}
              onChangeText={(text) => setExamForm({ ...examForm, subject: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Mô tả"
              value={examForm.description}
              onChangeText={(text) => setExamForm({ ...examForm, description: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Số câu hỏi"
                  value={examForm.totalQuestions.toString()}
                  onChangeText={(text) => setExamForm({ ...examForm, totalQuestions: parseInt(text) || 0 })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Thời gian (phút)"
                  value={examForm.duration.toString()}
                  onChangeText={(text) => setExamForm({ ...examForm, duration: parseInt(text) || 0 })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Điểm đỗ (%)"
                  value={examForm.passingScore.toString()}
                  onChangeText={(text) => setExamForm({ ...examForm, passingScore: parseInt(text) || 0 })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Số lần thi tối đa"
                  value={examForm.maxAttempts.toString()}
                  onChangeText={(text) => setExamForm({ ...examForm, maxAttempts: parseInt(text) || 1 })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Loại đề thi</Text>
            <SegmentedButtons
              value={examForm.type}
              onValueChange={(value) => setExamForm({ ...examForm, type: value })}
              buttons={typeOptions}
              style={styles.segmentedButtons}
            />

            <Text style={styles.sectionTitle}>Độ khó</Text>
            <SegmentedButtons
              value={examForm.difficulty}
              onValueChange={(value) => setExamForm({ ...examForm, difficulty: value })}
              buttons={difficultyOptions}
              style={styles.segmentedButtons}
            />

            <TextInput
              label="Tags (phân cách bằng dấu phẩy)"
              value={examForm.tags}
              onChangeText={(text) => setExamForm({ ...examForm, tags: text })}
              style={styles.input}
              mode="outlined"
              placeholder="ví dụ: toán, đại số, hình học"
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Trộn câu hỏi</Text>
              <Switch
                value={examForm.isRandomized}
                onValueChange={(value) => setExamForm({ ...examForm, isRandomized: value })}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Cho phép thi lại</Text>
              <Switch
                value={examForm.allowRetake}
                onValueChange={(value) => setExamForm({ ...examForm, allowRetake: value })}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Xuất bản ngay</Text>
              <Switch
                value={examForm.isPublished}
                onValueChange={(value) => setExamForm({ ...examForm, isPublished: value })}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveExam}
                style={styles.saveButton}
              >
                {editingExam ? 'Cập nhật' : 'Thêm'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
  header: {
    padding: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterButtons: {
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  examCard: {
    marginBottom: 16,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
    color: '#333',
    marginBottom: 4,
  },
  examSubject: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 4,
  },
  examDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  examMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  publishedChip: {
    backgroundColor: '#E8F5E8',
    marginBottom: 4,
  },
  draftChip: {
    backgroundColor: '#FFF3E0',
    marginBottom: 4,
>>>>>>> Stashed changes
  },
  examStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
<<<<<<< Updated upstream
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
=======
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  examActions: {
    marginLeft: 8,
  },
  emptyCard: {
    marginTop: 32,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
>>>>>>> Stashed changes
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
<<<<<<< Updated upstream
  modalContent: {
    paddingHorizontal: 24,
=======
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
>>>>>>> Stashed changes
  },
  input: {
    marginBottom: 16,
  },
<<<<<<< Updated upstream
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
=======
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});
>>>>>>> Stashed changes
