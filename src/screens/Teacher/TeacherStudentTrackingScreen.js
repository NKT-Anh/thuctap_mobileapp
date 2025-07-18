import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { firestore } from '../../../firebaseConfig';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TeacherStudentTrackingScreen({ route }) {
  // Có thể nhận classId hoặc examId từ route nếu cần
  const { classId, examId } = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    loadResults();
  }, [classId, examId]);

  useEffect(() => {
    if (selectedResult) {
      setComment(selectedResult.teacherComment || '');
    }
  }, [selectedResult]);

  const handleSaveComment = async () => {
    if (!selectedResult) return;
    setCommentLoading(true);
    try {
      const resultRef = doc(firestore, 'official_exam_results', selectedResult.id);
      await updateDoc(resultRef, { teacherComment: comment });
      setSelectedResult({ ...selectedResult, teacherComment: comment });
    } catch (e) {
      alert('Lưu nhận xét thất bại!');
    }
    setCommentLoading(false);
  };

  const loadResults = async () => {
    setLoading(true);
    let q;
    if (examId) {
      q = query(collection(firestore, 'official_exam_results'), where('examId', '==', examId));
    } else if (classId) {
      q = query(collection(firestore, 'official_exam_results'), where('classId', '==', classId));
    } else {
      q = collection(firestore, 'official_exam_results');
    }
    const snap = await getDocs(q);
    setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /><Text style={{marginTop:8}}>Đang tải kết quả...</Text></View>;
  }

  if (selectedResult) {
    // Hiển thị chi tiết kết quả
    return (
      <KeyboardAvoidingView style={{ flex: 1, padding: 16, backgroundColor: '#F4F7FB' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Kết quả chi tiết</Text>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>Học sinh:</Text>
          <Text style={styles.detailValue}>{selectedResult.userName || selectedResult.userId}</Text>
          <Text style={styles.detailLabel}>Điểm:</Text>
          <Text style={[styles.detailValue, {color:'#007AFF', fontWeight:'bold', fontSize:18}]}>{selectedResult.score} / {selectedResult.total}</Text>
        </View>
        <FlatList
          data={selectedResult.answers}
          keyExtractor={(_, idx) => idx.toString()}
          style={{marginTop:12}}
          ItemSeparatorComponent={() => <View style={{height:8}} />}
          renderItem={({ item, index }) => (
            <View style={styles.answerRow}>
              <Text style={{ fontWeight: 'bold', marginBottom:2 }}>Câu {index + 1}: {item.question}</Text>
              <Text>Đáp án của học sinh: <Text style={{ color: item.isCorrect ? '#27ae60' : '#e74c3c', fontWeight:'bold' }}>{item.selected || 'Chưa chọn'}</Text></Text>
              <Text>Đáp án đúng: <Text style={{ color: '#27ae60', fontWeight:'bold' }}>{item.correct}</Text></Text>
              {item.explanation && <Text style={{ color: '#555', fontStyle:'italic', marginTop:2 }}>Giải thích: {item.explanation}</Text>}
            </View>
          )}
        />
        <View style={styles.commentBoxWrap}>
          <Text style={styles.detailLabel}>Nhận xét của giáo viên:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Nhập nhận xét cho học sinh..."
            value={comment}
            onChangeText={setComment}
            multiline
            editable={!commentLoading}
          />
          <TouchableOpacity style={styles.saveCommentBtn} onPress={handleSaveComment} disabled={commentLoading}>
            <Text style={styles.saveCommentBtnText}>{commentLoading ? 'Đang lưu...' : 'Lưu nhận xét'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedResult(null)}>
          <Text style={styles.backBtnText}>← Quay lại danh sách</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => setSelectedResult(item)} activeOpacity={0.85}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(item.userName || item.userId)}</Text>
        </View>
      </View>
      <View style={{flex:1}}>
        <Text style={styles.resultName}>{item.userName || item.userId}</Text>
        <View style={styles.resultRowInfo}>
          <Text style={styles.resultScore}>Điểm: <Text style={{color:'#007AFF', fontWeight:'bold'}}>{item.score}</Text> / {item.total}</Text>
          <Text style={styles.resultCorrect}>Đúng: {item.correctCount} / {item.total}</Text>
        </View>
        <Text style={styles.resultInfo}>Thời gian: {item.durationInSeconds ? Math.round(item.durationInSeconds/60) + ' phút' : '---'}</Text>
        <Text style={styles.resultInfo}>Ngày nộp: {item.submittedAt ? (typeof item.submittedAt === 'string' ? new Date(item.submittedAt).toLocaleString() : (item.submittedAt.toDate ? item.submittedAt.toDate().toLocaleString() : String(item.submittedAt))) : '---'}</Text>
        <View style={styles.resultTagsWrap}>
          <Text style={styles.resultTag}>Mã đề: {item.examId}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#F4F7FB' }}>
      <Text style={styles.title}>Kết quả bài thi của học sinh</Text>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderResultItem}
        ItemSeparatorComponent={() => <View style={{height:12}} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color:'#888' }}>Chưa có kết quả nào.</Text>}
        contentContainerStyle={{paddingBottom:24}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#F4F7FB' },
  title: { fontWeight: 'bold', fontSize: 22, marginBottom: 18, color:'#222', alignSelf:'center' },
  resultCard: {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 2,
  },
  avatarWrap: { marginRight: 16 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#e3e9f7',
    justifyContent:'center', alignItems:'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 2,
  },
  avatarText: { fontSize: 20, fontWeight:'bold', color:'#4B6CB7' },
  resultName: { fontWeight: 'bold', fontSize: 17, color:'#222', marginBottom: 2 },
  resultRowInfo: { flexDirection:'row', alignItems:'center', marginBottom: 2 },
  resultScore: { fontSize: 15, marginRight: 16 },
  resultCorrect: { fontSize: 15, color:'#27ae60' },
  resultInfo: { color:'#555', fontSize: 13, marginBottom: 1 },
  resultTagsWrap: { flexDirection:'row', marginTop: 4 },
  resultTag: { backgroundColor:'#eaf0fb', color:'#4B6CB7', borderRadius: 6, paddingHorizontal:8, paddingVertical:2, fontSize:12, marginRight:8 },
  answerRow: { padding: 12, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, marginBottom: 2 },
  detailCard: { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:14, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:2, elevation:2 },
  detailLabel: { color:'#888', fontSize:14, marginTop:2 },
  detailValue: { color:'#222', fontSize:16, fontWeight:'bold', marginBottom:2 },
  backBtn: { marginTop: 24, alignSelf: 'center', backgroundColor:'#007AFF', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10, shadowColor:'#007AFF', shadowOffset:{width:0,height:2}, shadowOpacity:0.15, shadowRadius:4, elevation:2 },
  backBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  commentBoxWrap: { backgroundColor:'#fff', borderRadius:10, padding:12, marginTop:18, marginBottom:8, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:2, elevation:1 },
  commentInput: { minHeight: 48, fontSize: 15, color:'#222', backgroundColor:'#f4f7fb', borderRadius:8, padding:8, marginTop:6, marginBottom:10 },
  saveCommentBtn: { backgroundColor:'#27ae60', borderRadius:8, paddingVertical:10, alignItems:'center', marginBottom:2 },
  saveCommentBtnText: { color:'#fff', fontWeight:'bold', fontSize:15 },
});