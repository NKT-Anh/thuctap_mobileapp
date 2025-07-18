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
  Surface,
  Avatar
} from 'react-native-paper';
import { fetchLessons, addLesson, updateLesson, deleteLesson } from '../../services/lessonService';
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
  fetchLessons, 
  addLesson, 
  updateLesson, 
  deleteLesson 
} from '../../services/lessonService';
>>>>>>> Stashed changes

export default function LessonManagementScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< Updated upstream
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    difficulty: 'medium',
    status: 'draft',
    duration: 30,
    order: 0,
    objectives: '',
    tags: ''
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, lesson: null });
  const [menuVisible, setMenuVisible] = useState(false);
=======
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [menuVisible, setMenuVisible] = useState({});
  
  // Form states
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    difficulty: 'easy',
    duration: 30,
    isPublished: false,
    order: 0,
    tags: '',
    videoUrl: '',
    imageUrl: ''
  });

  const difficultyOptions = [
    { value: 'easy', label: 'Dễ' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'hard', label: 'Khó' }
  ];

  const filterOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'draft', label: 'Nháp' }
  ];
>>>>>>> Stashed changes

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
<<<<<<< Updated upstream
      const data = await fetchLessons();
      setLessons(data || []);
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Không thể tải danh sách bài học: ' + error.message, 
        error: true 
      });
=======
      const lessonsData = await fetchLessons();
      setLessons(lessonsData);
    } catch (error) {
      Alert.alert('Lỗi', error.message);
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
<<<<<<< Updated upstream
    const matchSearch = 
      lesson.title?.toLowerCase().includes(search.toLowerCase()) ||
      lesson.subject?.toLowerCase().includes(search.toLowerCase()) ||
      lesson.tags?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : lesson.status === filter;
    return matchSearch && matchFilter;
  });

  const openAddModal = () => {
    setEditLesson(null);
    setForm({
      title: '',
      description: '',
      content: '',
      subject: '',
      difficulty: 'medium',
      status: 'draft',
      duration: 30,
      order: lessons.length + 1,
      objectives: '',
      tags: ''
    });
    setModalVisible(true);
  };

  const openEditModal = (lesson) => {
    setEditLesson(lesson);
    setForm({
      ...lesson,
      tags: lesson.tags?.join(', ') || '',
      objectives: lesson.objectives?.join('\n') || ''
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setSnackbar({ visible: true, message: 'Vui lòng nhập tiêu đề bài học', error: true });
      return;
    }

    try {
      const lessonData = {
        ...form,
        duration: parseInt(form.duration) || 30,
        order: parseInt(form.order) || 0,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        objectives: form.objectives.split('\n').map(obj => obj.trim()).filter(obj => obj),
        updatedAt: new Date()
      };

      if (editLesson) {
        await updateLesson(editLesson.id, lessonData);
        setSnackbar({ visible: true, message: 'Cập nhật bài học thành công!', error: false });
      } else {
        lessonData.createdAt = new Date();
        await addLesson(lessonData);
        setSnackbar({ visible: true, message: 'Thêm bài học thành công!', error: false });
      }

      setModalVisible(false);
      loadLessons();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi lưu bài học: ' + error.message, 
        error: true 
      });
    }
  };

  const handleDelete = async (lesson) => {
    try {
      await deleteLesson(lesson.id);
      setSnackbar({ visible: true, message: 'Xóa bài học thành công!', error: false });
      loadLessons();
    } catch (error) {
      setSnackbar({ 
        visible: true, 
        message: 'Lỗi xóa bài học: ' + error.message, 
        error: true 
      });
    }
    setConfirmDialog({ visible: false, lesson: null });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return '#4caf50';
      case 'draft': return '#ff9800';
      case 'archived': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
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
=======
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'published' && lesson.isPublished) ||
                         (filter === 'draft' && !lesson.isPublished);
    
    return matchesSearch && matchesFilter;
  });

  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      content: '',
      difficulty: 'easy',
      duration: 30,
      isPublished: false,
      order: lessons.length,
      tags: '',
      videoUrl: '',
      imageUrl: ''
    });
    setIsModalVisible(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      content: lesson.content || '',
      difficulty: lesson.difficulty || 'easy',
      duration: lesson.duration || 30,
      isPublished: lesson.isPublished || false,
      order: lesson.order || 0,
      tags: lesson.tags?.join(', ') || '',
      videoUrl: lesson.videoUrl || '',
      imageUrl: lesson.imageUrl || ''
    });
    setIsModalVisible(true);
  };

  const handleSaveLesson = async () => {
    try {
      if (!lessonForm.title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài học');
        return;
      }

      const lessonData = {
        ...lessonForm,
        tags: lessonForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: parseInt(lessonForm.duration) || 30
      };

      if (editingLesson) {
        await updateLesson(editingLesson.id, lessonData);
        Alert.alert('Thành công', 'Đã cập nhật bài học');
      } else {
        await addLesson(lessonData);
        Alert.alert('Thành công', 'Đã thêm bài học mới');
      }

      setIsModalVisible(false);
      loadLessons();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleDeleteLesson = (lesson) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa bài học "${lesson.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLesson(lesson.id);
              Alert.alert('Thành công', 'Đã xóa bài học');
              loadLessons();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            }
          }
        }
      ]
    );
  };

  const togglePublishLesson = async (lesson) => {
    try {
      await updateLesson(lesson.id, { isPublished: !lesson.isPublished });
      loadLessons();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
>>>>>>> Stashed changes
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
<<<<<<< Updated upstream
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  const renderLessonItem = ({ item, index }) => (
    <Card style={styles.lessonCard}>
      <Card.Content>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonInfo}>
            <View style={styles.titleRow}>
              <Avatar.Text 
                size={32} 
                label={item.order?.toString() || (index + 1).toString()} 
                style={styles.orderAvatar}
              />
              <View style={styles.titleContent}>
                <Title style={styles.lessonTitle}>{item.title}</Title>
                <Text style={styles.lessonSubject}>{item.subject}</Text>
              </View>
            </View>
          </View>
          <View style={styles.lessonActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => openEditModal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => setConfirmDialog({ visible: true, lesson: item })}
            />
          </View>
        </View>

        <Text style={styles.lessonDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.lessonDetails}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
          <Chip 
            mode="outlined" 
            style={[styles.difficultyChip, { borderColor: getDifficultyColor(item.difficulty) }]}
            textStyle={{ color: getDifficultyColor(item.difficulty) }}
          >
            {getDifficultyText(item.difficulty)}
          </Chip>
          <Chip mode="outlined" style={styles.detailChip}>
            ⏱️ {item.duration} phút
          </Chip>
        </View>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <Chip key={idx} mode="outlined" style={styles.tagChip} compact>
                {tag}
              </Chip>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3} thẻ khác</Text>
            )}
          </View>
        )}

        {item.objectives && item.objectives.length > 0 && (
          <View style={styles.objectivesContainer}>
            <Text style={styles.objectivesTitle}>Mục tiêu:</Text>
            <Text style={styles.objectivesText} numberOfLines={2}>
              {item.objectives.join(', ')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
=======
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  };

  const formatDuration = (duration) => {
    return `${duration} phút`;
  };

  const showMenu = (lessonId) => {
    setMenuVisible({ ...menuVisible, [lessonId]: true });
  };

  const hideMenu = (lessonId) => {
    setMenuVisible({ ...menuVisible, [lessonId]: false });
  };
>>>>>>> Stashed changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải danh sách bài học...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
<<<<<<< Updated upstream
      <Surface style={styles.searchSection}>
        <TextInput
          mode="outlined"
          label="Tìm kiếm bài học..."
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
          <Menu.Item onPress={() => { setFilter('published'); setMenuVisible(false); }} title="Đã xuất bản" />
          <Menu.Item onPress={() => { setFilter('draft'); setMenuVisible(false); }} title="Nháp" />
          <Menu.Item onPress={() => { setFilter('archived'); setMenuVisible(false); }} title="Lưu trữ" />
        </Menu>
      </Surface>

      <FlatList
        data={filteredLessons}
        renderItem={renderLessonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài học nào</Text>
            <Button mode="contained" onPress={openAddModal} style={styles.emptyButton}>
              Tạo bài học đầu tiên
            </Button>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={openAddModal}
        label="Thêm bài học"
      />

      {/* Modal thêm/sửa bài học */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>{editLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TextInput
                mode="outlined"
                label="Tiêu đề bài học *"
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
                  label="Thứ tự"
                  value={form.order.toString()}
                  onChangeText={(text) => setForm({...form, order: parseInt(text) || 0})}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfWidth]}
                />
              </View>

              <TextInput
                mode="outlined"
                label="Nội dung bài học"
                value={form.content}
                onChangeText={(text) => setForm({...form, content: text})}
                multiline
                numberOfLines={5}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Mục tiêu (mỗi dòng một mục tiêu)"
                value={form.objectives}
                onChangeText={(text) => setForm({...form, objectives: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Thẻ (phân cách bằng dấu phẩy)"
                value={form.tags}
                onChangeText={(text) => setForm({...form, tags: text})}
                style={styles.input}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Hủy</Button>
            <Button onPress={handleSave}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog 
          visible={confirmDialog.visible} 
          onDismiss={() => setConfirmDialog({ visible: false, lesson: null })}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có chắc chắn muốn xóa bài học "{confirmDialog.lesson?.title}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog({ visible: false, lesson: null })}>
              Hủy
            </Button>
            <Button onPress={() => handleDelete(confirmDialog.lesson)}>
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
        <Title style={styles.headerTitle}>Quản lý bài học</Title>
        <Text style={styles.headerSubtitle}>
          Tổng số: {lessons.length} bài học
        </Text>
      </Surface>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm bài học..."
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

      {/* Lessons List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredLessons.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Không tìm thấy bài học nào' : 'Chưa có bài học nào'}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredLessons.map((lesson) => (
            <Card key={lesson.id} style={styles.lessonCard}>
              <Card.Content>
                <View style={styles.lessonHeader}>
                  <View style={styles.lessonInfo}>
                    <Title style={styles.lessonTitle}>{lesson.title}</Title>
                    <Text style={styles.lessonDescription} numberOfLines={2}>
                      {lesson.description}
                    </Text>
                    <View style={styles.lessonMeta}>
                      <Chip 
                        mode="outlined" 
                        style={[styles.difficultyChip, { borderColor: getDifficultyColor(lesson.difficulty) }]}
                        textStyle={{ color: getDifficultyColor(lesson.difficulty) }}
                      >
                        {getDifficultyLabel(lesson.difficulty)}
                      </Chip>
                      <Text style={styles.durationText}>{formatDuration(lesson.duration)}</Text>
                      <Chip 
                        mode={lesson.isPublished ? 'flat' : 'outlined'}
                        style={lesson.isPublished ? styles.publishedChip : styles.draftChip}
                      >
                        {lesson.isPublished ? 'Đã xuất bản' : 'Nháp'}
                      </Chip>
                    </View>
                    {lesson.tags && lesson.tags.length > 0 && (
                      <View style={styles.tagsContainer}>
                        {lesson.tags.map((tag, index) => (
                          <Chip key={index} mode="outlined" style={styles.tagChip}>
                            {tag}
                          </Chip>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.lessonActions}>
                    <Menu
                      visible={menuVisible[lesson.id] || false}
                      onDismiss={() => hideMenu(lesson.id)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          onPress={() => showMenu(lesson.id)}
                        />
                      }
                    >
                      <Menu.Item
                        leadingIcon="pencil"
                        title="Chỉnh sửa"
                        onPress={() => {
                          hideMenu(lesson.id);
                          handleEditLesson(lesson);
                        }}
                      />
                      <Menu.Item
                        leadingIcon={lesson.isPublished ? "eye-off" : "eye"}
                        title={lesson.isPublished ? "Ẩn" : "Xuất bản"}
                        onPress={() => {
                          hideMenu(lesson.id);
                          togglePublishLesson(lesson);
                        }}
                      />
                      <Menu.Item
                        leadingIcon="delete"
                        title="Xóa"
                        onPress={() => {
                          hideMenu(lesson.id);
                          handleDeleteLesson(lesson);
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

      {/* Add Lesson FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddLesson}
        label="Thêm bài học"
      />

      {/* Add/Edit Lesson Modal */}
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Title style={styles.modalTitle}>
              {editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
            </Title>

            <TextInput
              label="Tiêu đề bài học *"
              value={lessonForm.title}
              onChangeText={(text) => setLessonForm({ ...lessonForm, title: text })}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Mô tả"
              value={lessonForm.description}
              onChangeText={(text) => setLessonForm({ ...lessonForm, description: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Nội dung bài học"
              value={lessonForm.content}
              onChangeText={(text) => setLessonForm({ ...lessonForm, content: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={6}
            />

            <View style={styles.rowContainer}>
              <View style={styles.halfWidth}>
                <SegmentedButtons
                  value={lessonForm.difficulty}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, difficulty: value })}
                  buttons={difficultyOptions}
                  style={styles.segmentedButtons}
                />
              </View>
              <View style={styles.halfWidth}>
                <TextInput
                  label="Thời lượng (phút)"
                  value={lessonForm.duration.toString()}
                  onChangeText={(text) => setLessonForm({ ...lessonForm, duration: parseInt(text) || 0 })}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TextInput
              label="Tags (phân cách bằng dấu phẩy)"
              value={lessonForm.tags}
              onChangeText={(text) => setLessonForm({ ...lessonForm, tags: text })}
              style={styles.input}
              mode="outlined"
              placeholder="ví dụ: javascript, react, frontend"
            />

            <TextInput
              label="URL Video"
              value={lessonForm.videoUrl}
              onChangeText={(text) => setLessonForm({ ...lessonForm, videoUrl: text })}
              style={styles.input}
              mode="outlined"
              placeholder="https://..."
            />

            <TextInput
              label="URL Hình ảnh"
              value={lessonForm.imageUrl}
              onChangeText={(text) => setLessonForm({ ...lessonForm, imageUrl: text })}
              style={styles.input}
              mode="outlined"
              placeholder="https://..."
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Xuất bản ngay</Text>
              <Switch
                value={lessonForm.isPublished}
                onValueChange={(value) => setLessonForm({ ...lessonForm, isPublished: value })}
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
                onPress={handleSaveLesson}
                style={styles.saveButton}
              >
                {editingLesson ? 'Cập nhật' : 'Thêm'}
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
  lessonCard: {
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
  lessonCard: {
    marginBottom: 16,
>>>>>>> Stashed changes
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lessonInfo: {
    flex: 1,
  },
<<<<<<< Updated upstream
  titleRow: {
=======
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  lessonMeta: {
>>>>>>> Stashed changes
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
<<<<<<< Updated upstream
  orderAvatar: {
    marginRight: 12,
    backgroundColor: '#2196f3',
  },
  titleContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lessonSubject: {
    fontSize: 14,
    color: '#666',
  },
  lessonActions: {
    flexDirection: 'row',
  },
  lessonDescription: {
    marginVertical: 8,
    color: '#333',
  },
  lessonDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  statusChip: {
    marginRight: 4,
  },
  difficultyChip: {
    marginRight: 4,
  },
  detailChip: {
    marginRight: 4,
=======
  difficultyChip: {
    marginRight: 8,
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  publishedChip: {
    backgroundColor: '#E8F5E8',
  },
  draftChip: {
    backgroundColor: '#FFF3E0',
>>>>>>> Stashed changes
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
<<<<<<< Updated upstream
    gap: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  tagChip: {
    backgroundColor: '#e3f2fd',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  objectivesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  objectivesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  objectivesText: {
    fontSize: 12,
    color: '#333',
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
  },
  tagChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  lessonActions: {
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
  segmentedButtons: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
